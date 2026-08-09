// ─────────────────────────────────────────────────────────────
// Database Migration Runner
// ─────────────────────────────────────────────────────────────
// Executes db/migrations SQL against Neon PostgreSQL.
// Loads DATABASE_URL from environment (.env.local not auto-loaded by Node).
// ─────────────────────────────────────────────────────────────

import { readFileSync, readdirSync } from "fs"
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

  // Read and execute all migration files in lexical order
  const migrationsDir = resolve(process.cwd(), "db/migrations")
  let migrationFiles: string[]
  try {
    const allFiles = readdirSync(migrationsDir)
    migrationFiles = allFiles
      .filter((f) => f.endsWith(".sql"))
      .sort() // lexical order: 001_, 002_, etc.
  } catch (err) {
    console.error("Error: Failed to read migrations directory: db/migrations")
    console.error((err as Error).message)
    await sql.end()
    process.exit(1)
  }

  if (migrationFiles.length === 0) {
    console.log("ℹ No migration files found in db/migrations/")
  }

  // Execute each migration file
  for (const migrationFile of migrationFiles) {
    const migrationPath = resolve(migrationsDir, migrationFile)
    let migrationSql: string
    try {
      migrationSql = readFileSync(migrationPath, "utf-8")
    } catch (err) {
      console.error(`Error: Failed to read migration file: ${migrationFile}`)
      console.error((err as Error).message)
      await sql.end()
      process.exit(1)
    }

    try {
      // Execute the entire migration file as a single statement to PostgreSQL
      // This allows the server to parse multi-statement SQL properly
      await sql.unsafe(migrationSql)
      console.log(`✓ ${migrationFile} executed successfully`)
    } catch (err) {
      console.error(`Error: Migration ${migrationFile} failed`)
      console.error((err as Error).message)
      await sql.end()
      process.exit(1)
    }
  }

  if (migrationFiles.length > 0) {
    console.log(`✓ All ${migrationFiles.length} migration(s) executed successfully`)
  }

  // Clean up connection
  try {
    await sql.end()
    console.log("✓ Connection closed")
  } catch {
    console.error("Warning: Failed to close connection gracefully")
  }

  console.log("Migration complete.")
}

runMigrations().catch((err) => {
  console.error("Fatal error:", (err as Error).message)
  process.exit(1)
})
