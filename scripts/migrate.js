/**
 * HmarePanditJi — SQL Migration Runner
 * Reads all SQL files from /migrations, runs them in order,
 * skips already-run migrations, records completion.
 *
 * Run with: node scripts/migrate.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    const client = await pool.connect();
    try {
        // Create tracking table if it doesn't exist
        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Get already executed migrations
        const { rows: done } = await client.query(
            'SELECT filename FROM schema_migrations ORDER BY id'
        );
        const doneSet = new Set(done.map(r => r.filename));

        // Read migration files sorted alphabetically
        const migrationDir = path.join(__dirname, '..', 'migrations');

        if (!fs.existsSync(migrationDir)) {
            console.log('⚠  No migrations directory found. Creating it...');
            fs.mkdirSync(migrationDir, { recursive: true });
            console.log('✓ Created /migrations directory');
            return;
        }

        const files = fs.readdirSync(migrationDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('⚠  No migration files found in /migrations/');
            return;
        }

        let ran = 0;
        let skipped = 0;

        for (const file of files) {
            if (doneSet.has(file)) {
                console.log(`✓ Skipping (already run): ${file}`);
                skipped++;
                continue;
            }
            console.log(`▶ Running: ${file}`);
            const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');

            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query(
                    'INSERT INTO schema_migrations (filename) VALUES ($1)',
                    [file]
                );
                await client.query('COMMIT');
                console.log(`✓ Done: ${file}`);
                ran++;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`✗ Failed: ${file}\n${err.message}`);
                process.exit(1);
            }
        }
        console.log(`\n✓ All migrations complete (${ran} executed, ${skipped} skipped)`);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
