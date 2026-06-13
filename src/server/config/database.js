const mysql = require('mysql2/promise');

/**
 * Shared MySQL connection pool.
 *
 *  - `DB_HOST` – hostname of the MySQL server (default: `'localhost'`)
 *  - `DB_USER` – database username (default: `'root'`)
 *  - `DB_PASSWORD` – database password (default: `''`)
 *  - `DB_NAME` – schema / database name (default: `'estflix'`)
 *
 * @type {import('mysql2/promise').Pool}
 */
const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'estflix',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

module.exports = pool;
