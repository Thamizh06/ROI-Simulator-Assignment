import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { query } from './db.js';
import { simulate } from './calc.js';
import { InputsSchema, ScenarioSaveSchema, IdParamSchema, EmailSchema } from './validate.js';
import { renderReportHTML } from './report.js';
import { getConnection } from './db.js';

const app = express();

/**
 * ---- CORS (only changes here) ----
 * - Dynamic allowlist (env or defaults)
 * - Proper preflight handling for all routes
 * - Vary headers for caches/CDNs
 * - Expose Content-Disposition (for /report/generate download)
 */
const DEFAULT_ALLOWLIST = [
  'https://quant-payback.vercel.app',
  'http://localhost:3000',         // local dev front-end (optional)
  'http://127.0.0.1:3000'          // local dev front-end (optional)
];

const ALLOWLIST = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : DEFAULT_ALLOWLIST
);

// Build per-request origin check
const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools / same-origin / curl (no Origin header)
    if (!origin) return callback(null, true);
    if (ALLOWLIST.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,                 // keep if you use cookies/auth headers
  optionsSuccessStatus: 204          // successful preflight status
};

// Helpful for caches/CDNs and proxies
app.use((req, res, next) => {
  res.header('Vary', 'Origin');
  res.append('Vary', 'Access-Control-Request-Method');
  res.append('Vary', 'Access-Control-Request-Headers');
  next();
});

// Apply CORS to all routes
app.use(cors(corsOptions));

// Make sure all preflight requests are handled
app.options('*', cors(corsOptions));
/* ---- end CORS ---- */

app.use(express.json({ limit: '1mb' }));

(async () => {
  const conn = await getConnection();
  await conn.ping();
  conn.release();
  console.log('MySQL ping OK');
})();

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// POST /simulate  -> returns computed results
app.post('/simulate', async (req, res) => {
  try {
    // Accept either full InputsSchema or a body with 'inputs'
    const body = req.body.inputs ? { ...req.body.inputs, scenario_name: req.body.inputs.scenario_name ?? 'temp' } : req.body;
    const parsed = InputsSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.format() });

    const inputs = parsed.data;
    const results = simulate(inputs);
    res.json({ inputs, results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// POST /scenarios  -> create or update by unique name
app.post('/scenarios', async (req, res) => {
  try {
    const parsed = ScenarioSaveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.format() });

    const { name, inputs } = parsed.data;
    const results = simulate({
      scenario_name: name,
      ...inputs
    });

    // Insert or update
    const id = nanoid(21);
    await query(
      `INSERT INTO scenarios (id, name, inputs, results)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         inputs = VALUES(inputs),
         results = VALUES(results),
         updated_at = CURRENT_TIMESTAMP`,
      [id, name, JSON.stringify(inputs), JSON.stringify(results)]
    );

    // Fetch id (either the new one, or the existing row's)
    const rows = await query(`SELECT id FROM scenarios WHERE name = ? LIMIT 1`, [name]);
    res.status(200).json({ id: rows[0].id, name, inputs, results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Save scenario failed' });
  }
});

// GET /scenarios -> list
app.get('/scenarios', async (_req, res) => {
  try {
    const rows = await query(`SELECT id, name, created_at, updated_at FROM scenarios ORDER BY updated_at DESC`, []);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'List scenarios failed' });
  }
});

function toObject(v) {
  if (Buffer.isBuffer(v)) {
    const s = v.toString('utf8');
    try { return JSON.parse(s); } catch { return s; }
  }
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v; // already an object
}

// GET /scenarios/:id -> get full scenario
app.get('/scenarios/:id', async (req, res) => {
  const p = IdParamSchema.safeParse({ id: req.params.id });
  if (!p.success) return res.status(400).json({ error: 'Invalid id' });

  try {
    const rows = await query(`SELECT id, name, inputs, results, created_at, updated_at FROM scenarios WHERE id = ? LIMIT 1`, [p.data.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const row = rows[0];
    row.inputs = toObject(row.inputs);
    row.results = toObject(row.results);
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Get scenario failed' });
  }
});

// DELETE /scenarios/:id
app.delete('/scenarios/:id', async (req, res) => {
  const p = IdParamSchema.safeParse({ id: req.params.id });
  if (!p.success) return res.status(400).json({ error: 'Invalid id' });

  try {
    await query(`DELETE FROM scenarios WHERE id = ?`, [p.data.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete scenario failed' });
  }
});

// POST /report/generate  (requires email) -> returns downloadable HTML
app.post('/report/generate', async (req, res) => {
  const parsed = EmailSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid email' });

  const { email, scenarioId } = parsed.data;

  try {
    let scenario;
    if (scenarioId) {
      const rows = await query(`SELECT id, name, inputs, results FROM scenarios WHERE id = ? LIMIT 1`, [scenarioId]);
      if (rows.length === 0) return res.status(404).json({ error: 'Scenario not found' });
      scenario = {
        id: rows[0].id,
        name: rows[0].name,
        inputs: JSON.parse(rows[0].inputs),
        results: JSON.parse(rows[0].results)
      };
    } else {
      // Allow ad-hoc with request payload
      const simBody = req.body.inputs ? { scenario_name: 'Report', ...req.body.inputs } : null;
      if (!simBody) return res.status(400).json({ error: 'Provide scenarioId or inputs' });
      const inputs = InputsSchema.parse({ scenario_name: 'Report', ...simBody });
      const results = simulate(inputs);
      scenario = { id: 'adhoc', name: 'Ad-hoc', inputs, results };
    }

    const leadId = nanoid(21);
    await query(`INSERT INTO leads (id, email, scenario_id) VALUES (?, ?, ?)`, [leadId, email, scenario.id === 'adhoc' ? null : scenario.id]);

    const html = renderReportHTML(scenario);

    res.setHeader('Content-Disposition', `attachment; filename="roi-report-${scenario.name.replace(/\s+/g, '-')}.html"`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Report generation failed' });
  }
});

const port = +process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`ROI API listening on :${port}`);
});

