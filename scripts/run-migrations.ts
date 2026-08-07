// ─────────────────────────────────────────────────────────────
// Database Migration Runner
// ─────────────────────────────────────────────────────────────
// Executes db/migrations SQL against Neon PostgreSQL.
// Loads DATABASE_URL from environment (.env.local not auto-loaded by Node).
// ─────────────────────────────────────────────────────────────

import { readFileSync } from "fs"
import { resolve } from "path"
import postgres from "postgres"

// Load environment - .env.local is not auto-loaded by Node
async function loadEnv() {
  try {
    // Try loading dotenv if available, but don't fail if missing
    const dotenv = await import("dotenv")
    const envPath = resolve(process.cwd(), ".env.local")
    dotenv.config({ path: envPath })
  } catch {
    // dotenv not available - that's OK, rely on process.env
  }
}

async function runMigrations() {
  await loadEnv()

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error(
      "Error: DATABASE_URL environment variable is not set.\n" +
        "Add DATABASE_URL to .env.local and try again."
    )
    process.exit(1)
  }

  let sql: ReturnType<typeof postgres>
  try {
    sql = postgres(databaseUrl)
    console.log("✓ Connected to database")
  } catch (err) {
    console.error("Error: Failed to connect to database")
    console.error((err as Error).message)
    process.exit(1)
  }

  // Read migration file
  let migrationSql: string
  try {
    const migrationPath = resolve(process.cwd(), "db/migrations/001_canonical_episode_state.sql")
    migrationSql = readFileSync(migrationPath, "utf-8")
  } catch (err) {
    console.error("Error: Failed to read migration file: db/migrations/001_canonical_episode_state.sql")
    console.error((err as Error).message)
    await sql.end()
    process.exit(1)
  }

  // Execute migration
  try {
    // Execute the entire migration file as a single statement to PostgreSQL
    // This allows the server to parse multi-statement SQL properly
    await sql.unsafe(migrationSql)

    console.log("✓ Migration executed successfully")
  } catch (err) {
    console.error("Error: Migration failed")
    console.error((err as Error).message)
    await sql.end()
    process.exit(1)
  }

  // Clean up connection
  try {
    await sql.end()
    console.log("✓ Connection closed")
  } catch (err) {
    console.error("Warning: Failed to close connection gracefully")
  }

  console.log("Migration complete.")
}

runMigrations().catch((err) => {
  console.error("Fatal error:", (err as Error).message)
  process.exit(1)
})
