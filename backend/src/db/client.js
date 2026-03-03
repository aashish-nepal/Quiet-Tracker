import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  // Prevent Railway connection limit exhaustion
  max: 10,
  // Release idle clients after 30 seconds
  idleTimeoutMillis: 30_000,
  // Fail fast if we cannot get a connection within 5 seconds
  connectionTimeoutMillis: 5_000,
  // Kill runaway queries after 30 seconds
  statement_timeout: 30_000,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function withTransaction(run) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await run(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
