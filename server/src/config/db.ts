
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export async function testDatabaseConnection(): Promise<void> {
  const result = await pool.query(
    "SELECT current_database(), current_user, NOW() AS current_time"
  );

  console.log("PostgreSQL connected successfully:", result.rows[0]);
}
