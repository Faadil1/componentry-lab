import assert from "node:assert/strict"
import { test } from "node:test"

import { ensureCanonicalStorageSchema } from "../lib/persistence/canonical-storage-bootstrap.ts"

const LOCK_KEY = 0x63616e6f
const LOCK_CLASS = 0x6c61796f

function makeTransactionSql(callLog: string[]) {
  return Object.assign(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = Array.from(strings).join("${}").trim().replace(/\s+/g, " ")
    callLog.push(`txn:${text} [${values.join(", ")}]`)
    return []
  }, {})
}

test("canonical storage bootstrap uses one transaction and locks before DDL", async () => {
  const callLog: string[] = []
  const sql = Object.assign(async (strings: TemplateStringsArray, ..._values: unknown[]) => {
    void _values
    const text = Array.from(strings).join("${}").trim().replace(/\s+/g, " ")
    callLog.push(`outer:${text}`)
    return []
  }, {
    begin: async <T>(callback: (txnSql: ReturnType<typeof makeTransactionSql>) => Promise<T>): Promise<T> => {
      callLog.push("outer:begin")
      const txnSql = makeTransactionSql(callLog)
      const result = await callback(txnSql)
      callLog.push("outer:commit")
      return result
    },
  })

  await ensureCanonicalStorageSchema(sql as never)

  assert.deepEqual(callLog, [
    "outer:begin",
    "txn:SELECT pg_advisory_xact_lock(${}, ${}) [" + LOCK_KEY + ", " + LOCK_CLASS + "]",
    "txn:CREATE TABLE IF NOT EXISTS componentry_projects ( project_id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL ) []",
    "txn:CREATE TABLE IF NOT EXISTS componentry_plans ( plan_fingerprint TEXT PRIMARY KEY, project_id TEXT NOT NULL, request_fingerprint TEXT NOT NULL, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL, UNIQUE (project_id, plan_fingerprint) ) []",
    "txn:CREATE TABLE IF NOT EXISTS componentry_routes ( route_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, plan_fingerprint TEXT, route_identity TEXT NOT NULL UNIQUE, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL ) []",
    "outer:commit",
  ])
})

test("canonical storage bootstrap propagates transaction failures", async () => {
  const boom = new Error("lock failed")
  const sql = Object.assign(async () => [], {
    begin: async () => {
      throw boom
    },
  })

  await assert.rejects(() => ensureCanonicalStorageSchema(sql as never), boom)
})