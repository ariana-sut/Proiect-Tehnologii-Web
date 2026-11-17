const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'localguide',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
    console.log('Conexiune reușită la baza de date PostgreSQL.');
});

pool.on('error', (err) => {
    console.error('Eroare neașteptată la conexiunea PostgreSQL:', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
};