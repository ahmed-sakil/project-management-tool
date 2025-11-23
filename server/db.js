const { Pool } = require('pg');
require('dotenv').config();

const devConfig = {
  connectionString: `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`
};

const proConfig = {
  connectionString: process.env.DATABASE_URL, // Comes from Render Env Vars
  ssl: {
    rejectUnauthorized: false // <--- REQUIRED for Render
  }
};

const pool = new Pool(
  process.env.NODE_ENV === "production" ? proConfig : devConfig
);

// Fallback logic in case NODE_ENV isn't set but DATABASE_URL is
if (!process.env.NODE_ENV && process.env.DATABASE_URL) {
    // If we have a DATABASE_URL, assume we are in production-like environment
    pool.options = proConfig;
}

module.exports = {
  query: (text, params) => pool.query(text, params),
};