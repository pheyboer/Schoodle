// Load variables from .env file
require("dotenv").config();

// PG database client/connection setup
const { Pool } = require("pg");

const dbParams = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

const db = new Pool(dbParams);

// Test connection
db.connect()
  .then(() => console.log("Connected to database successfully"))
  .catch((err) => {
    console.log("Database connection error:", err.stack);
    process.exit(1);
  });

module.exports = db;
