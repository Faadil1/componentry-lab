export type CanonicalStorageTransactionSql = {
  (strings: TemplateStringsArray, ...values: unknown[]): unknown
}

export type CanonicalStorageSql = CanonicalStorageTransactionSql & {
  begin?<T>(callback: (txn: CanonicalStorageTransactionSql) => Promise<T>): Promise<T>
  [Symbol.toStringTag]?: string
}

const CANONICAL_STORAGE_BOOTSTRAP_LOCK_KEY = 0x63616e6f
const CANONICAL_STORAGE_BOOTSTRAP_LOCK_CLASS = 0x6c61796f

async function writeCanonicalSchema(sql: CanonicalStorageTransactionSql): Promise<void> {
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

export async function ensureCanonicalStorageSchema(sql: CanonicalStorageSql): Promise<void> {
  if (typeof sql.begin !== "function") {
    throw new Error("Canonical storage bootstrap requires sql.begin().")
  }

  await sql.begin(async (transactionSql) => {
    await transactionSql`
      SELECT pg_advisory_xact_lock(${CANONICAL_STORAGE_BOOTSTRAP_LOCK_KEY}, ${CANONICAL_STORAGE_BOOTSTRAP_LOCK_CLASS})
    `
    await writeCanonicalSchema(transactionSql)
  })
}