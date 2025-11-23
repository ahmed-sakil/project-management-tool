const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL Connection Pool
 * Manages concurrent connections to the database using the connection string
 * defined in the environment variables (DATABASE_URL).
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Note: If deploying to production (e.g., Render/Heroku) without a custom domain, 
  // you may need to uncomment the SSL config below:
  // ssl: { rejectUnauthorized: false }
});

module.exports = {
  /**
   * Abstraction for executing SQL queries.
   * Logs the duration of queries if needed for debugging (optional).
   * * @param {string} text - The SQL query text (e.g., "SELECT * FROM users WHERE id = $1")
   * @param {Array} params - The parameters to safely inject into the query
   * @returns {Promise} - Resolves with the query result
   */
  query: (text, params) => pool.query(text, params),
};