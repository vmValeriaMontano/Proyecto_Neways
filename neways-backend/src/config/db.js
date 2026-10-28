require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set to connect to PostgreSQL');
}

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
const databaseHost = new URL(databaseUrl).hostname.toLowerCase();
const ssl = !localHosts.has(databaseHost)
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool({
    connectionString: databaseUrl,
    ssl,
});

pool.connect()
    .then(client => {
        console.log('✅ Conectado a PostgreSQL correctamente');
        client.release();
    })
    .catch(error => {
        console.error('❌ Error conectando a PostgreSQL:');
        console.error(error.message);
    });

module.exports = pool;