const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing in .env");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase requiere SSL
});

// Crea tablas si no existen
const ready = (async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      username  TEXT UNIQUE NOT NULL,
      password  TEXT NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title     TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      user_id   INT NOT NULL REFERENCES users(id)
    );
  `);
})();

module.exports = { pool, ready };
