const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Обёртка с тем же API, что и раньше (prepare().all/get/run),
// только асинхронная и с плейсхолдерами PostgreSQL ($1, $2 вместо ?).
function prepare(sql) {
    let i = 0;
    const text = sql.replace(/\?/g, () => `$${++i}`);
    return {
        all: async (...params) => (await pool.query(text, params)).rows,
        get: async (...params) => (await pool.query(text, params)).rows[0],
        run: async (...params) => ({ changes: (await pool.query(text, params)).rowCount }),
    };
}

async function init() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_admin INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            room TEXT NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            duration REAL NOT NULL,
            user_id INTEGER NOT NULL,
            user_name TEXT NOT NULL
        );
    `);
}

module.exports = { prepare, init, pool };
