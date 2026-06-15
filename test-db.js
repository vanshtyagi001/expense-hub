import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

async function run() {
  try {
    const client = await pool.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT * FROM groups LIMIT 1');
    console.log("Query result:", res.rows);
    client.release();
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await pool.end();
  }
}

run();
