const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
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