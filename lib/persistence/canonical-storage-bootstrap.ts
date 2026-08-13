export type CanonicalStorageSql = {
  (strings: TemplateStringsArray, ...values: unknown[]): unknown
}

export async function ensureCanonicalStorageSchema(sql: CanonicalStorageSql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS componentry_projects (
      project_id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS componentry_plans (
      plan_fingerprint TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      request_fingerprint TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      UNIQUE (project_id, plan_fingerprint)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS componentry_routes (
      route_id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      plan_fingerprint TEXT,
      route_identity TEXT NOT NULL UNIQUE,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `
}
