// src/db.js  (hard-coded, no envs)
import mysql from 'mysql2/promise';

// >>> Replace ONLY the PASSWORD value below <<<
const HOST = 'bootrenim4s8thfamlyy-mysql.services.clever-cloud.com';
const PORT = 3306;
const USER = 'urjrj7jlcr7l8q47';
const PASSWORD = 'MIhaK0r4ES33zfIFmcVG';
const DATABASE = 'bootrenim4s8thfamlyy';

// ---- Pool (relaxed TLS for local dev) ----
// If you still see TLS errors on some networks, set "rejectUnauthorized: false" (already done)
const pool = mysql.createPool({
  host: HOST,
  port: PORT,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
  waitForConnections: true,
  connectionLimit: 8,
  connectTimeout: 15000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false } // dev only
});

export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function getConnection() {
  return pool.getConnection();
}

// Optional: quick ping on boot (call from server.js if you want)
// const conn = await pool.getConnection(); await conn.ping(); conn.release();
