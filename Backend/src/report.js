function fmt(n) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n ?? 0); }

export function renderReportHTML(scenario) {
  const { name, inputs, results } = scenario;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>ROI Report — ${name}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;max-width:900px;margin:40px auto;padding:0 16px;color:#0f172a}
  h1{font-size:28px;margin-bottom:8px}
  h2{margin-top:28px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .card{border:1px solid #e2e8f0;border-radius:12px;padding:14px;background:#fff}
  code{background:#f8fafc;padding:2px 6px;border-radius:6px}
  table{width:100%;border-collapse:collapse}
  td{padding:6px 4px;border-bottom:1px solid #e2e8f0}
</style>
</head>
<body>
  <h1>Invoicing ROI Report</h1>
  <p><strong>Scenario:</strong> ${name}</p>

  <h2>Inputs</h2>
  <div class="card">
  <table>
   <tr><td>Invoice volume / month</td><td>${fmt(inputs.monthly_invoice_volume)}</td></tr>
   <tr><td>Avg hours / invoice</td><td>${fmt(inputs.avg_hours_per_invoice)}</td></tr>
   <tr><td>Hourly wage</td><td>$${fmt(inputs.hourly_wage)}</td></tr>
   <tr><td>Manual error rate</td><td>${fmt(inputs.error_rate_manual)}%</td></tr>
   <tr><td>Error cost</td><td>$${fmt(inputs.error_cost)}</td></tr>
   <tr><td>Time horizon (months)</td><td>${fmt(inputs.time_horizon_months)}</td></tr>
   <tr><td>One-time implementation</td><td>$${fmt(inputs.one_time_implementation_cost || 0)}</td></tr>
  </table>
  </div>

  <h2>Results</h2>
  <div class="grid">
    <div class="card"><strong>Monthly Savings</strong><br/>$${fmt(results.monthly_savings)}</div>
    <div class="card"><strong>Payback (months)</strong><br/>${results.payback_months ? fmt(results.payback_months) : 'n/a'}</div>
    <div class="card"><strong>ROI (%)</strong><br/>${results.roi_percentage ? fmt(results.roi_percentage) : 'n/a'}</div>
    <div class="card"><strong>Cumulative Savings</strong><br/>$${fmt(results.cumulative_savings)}</div>
  </div>

  <p style="margin-top:24px;color:#64748b">Note: Results are modeled and include a conservative bias in favor of automation.</p>
</body>
</html>`;
}
