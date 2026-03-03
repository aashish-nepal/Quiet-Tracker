import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to:', process.env.DATABASE_URL.replace(/:[^:]+@/, ':****@'));
        await client.connect();
        console.log('Successfully connected to Supabase!');
        const res = await client.query('SELECT current_database(), current_user, now();');
        console.log('Results:', res.rows[0]);

        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables found:', tables.rows.map(r => r.table_name));

    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

test();
