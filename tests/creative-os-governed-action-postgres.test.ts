import assert from "node:assert/strict"
import test from "node:test"

import { fingerprintProjectBrain } from "../lib/projects/fingerprint"
import {
  appendProjectNextActionPostgresWithSql,
  type ProjectNextActionSqlClient,
} from "../lib/projects/next-action-writer"
import { projectPresets } from "../lib/projects/presets"
import type { ProjectBrain } from "../lib/projects/types"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function stated(): ProjectBrain {
  const project = projectPresets.find((item) => item.id === "stated")
  assert.ok(project)
  return clone(project)
}

function updatedFrom(current: ProjectBrain, id: string): ProjectBrain {
  const updated = clone(current)
  updated.nextActions = [
    ...updated.nextActions,
    {
      id,
      label: "Postgres governed write",
      description: "Prove durable parity without touching a real database.",
      phase: "verify",
      status: "todo",
    },
  ]
  updated.updatedLabel = "2026-08-18"
  return updated
}

function fakeSql(handler: (query: string, values: unknown[] | undefined) => Array<Record<string, unknown>>): ProjectNextActionSqlClient {
  return {
    unsafe: async <T extends Array<Record<string, unknown>> = Array<Record<string, unknown>>>(query: string, values?: unknown[]) => {
      return handler(query, values) as T
    },
  }
}

const noBootstrap = async () => {}

test("POSTGRES_PARITY_INSERTS_A_RUNTIME_OVERLAY_FOR_AN_UNPERSISTED_SEED", async () => {
  const current = stated()
  const updated = updatedFrom(current, "postgres-seed-action")
  const calls: Array<{ query: string; values?: unknown[] }> = []
  let persistedPayload: ProjectBrain | null = null

  const sql = fakeSql((query, values) => {
    calls.push({ query, values })
    if (query.includes("SELECT payload")) return []
    if (query.includes("INSERT INTO componentry_projects")) {
      persistedPayload = JSON.parse(String(values?.[2])) as ProjectBrain
      return [{ project_id: current.id }]
    }
    throw new Error(`Unexpected SQL: ${query}`)
  })

  const result = await appendProjectNextActionPostgresWithSql(
    sql,
    current,
    updated,
    fingerprintProjectBrain(current),
    "2026-08-18T12:10:00.000Z",
    noBootstrap,
  )

  assert.equal(result.status, "APPENDED")
  assert.equal(result.beforeFingerprint, fingerprintProjectBrain(current))
  assert.equal(result.afterFingerprint, fingerprintProjectBrain(updated))
  assert.equal(persistedPayload?.nextActions.some((item) => item.id === "postgres-seed-action"), true)
  assert.equal(calls.filter((call) => call.query.includes("INSERT INTO componentry_projects")).length, 1)
  assert.equal(calls.some((call) => call.query.includes("UPDATE componentry_projects")), false)
})

test("POSTGRES_PARITY_UPDATES_ONLY_WHEN_PERSISTED_PAYLOAD_MATCHES_THE_APPROVED_PRECONDITION", async () => {
  const current = stated()
  const updated = updatedFrom(current, "postgres-update-action")
  let updateValues: unknown[] | undefined

  const sql = fakeSql((query, values) => {
    if (query.includes("SELECT payload")) return [{ payload: clone(current) }]
    if (query.includes("UPDATE componentry_projects")) {
      updateValues = values
      return [{ project_id: current.id }]
    }
    throw new Error(`Unexpected SQL: ${query}`)
  })

  const result = await appendProjectNextActionPostgresWithSql(
    sql,
    current,
    updated,
    fingerprintProjectBrain(current),
    "2026-08-18T12:11:00.000Z",
    noBootstrap,
  )

  assert.equal(result.status, "APPENDED")
  assert.ok(updateValues)
  const written = JSON.parse(String(updateValues?.[2])) as ProjectBrain
  const compareAndSwapExpected = JSON.parse(String(updateValues?.[4])) as ProjectBrain
  assert.equal(written.nextActions.some((item) => item.id === "postgres-update-action"), true)
  assert.equal(fingerprintProjectBrain(compareAndSwapExpected), fingerprintProjectBrain(current))
})

test("POSTGRES_PARITY_FAILS_CLOSED_WHEN_THE_PERSISTED_PROJECT_IS_STALE", async () => {
  const current = stated()
  const updated = updatedFrom(current, "must-not-write")
  const concurrentlyChanged = updatedFrom(current, "concurrent-action")
  let updateCalled = false

  const sql = fakeSql((query) => {
    if (query.includes("SELECT payload")) return [{ payload: concurrentlyChanged }]
    if (query.includes("UPDATE componentry_projects")) {
      updateCalled = true
      return [{ project_id: current.id }]
    }
    throw new Error(`Unexpected SQL: ${query}`)
  })

  const result = await appendProjectNextActionPostgresWithSql(
    sql,
    current,
    updated,
    fingerprintProjectBrain(current),
    "2026-08-18T12:12:00.000Z",
    noBootstrap,
  )

  assert.equal(result.status, "STALE_PRECONDITION")
  assert.equal(updateCalled, false)
  assert.equal(result.project?.nextActions.some((item) => item.id === "concurrent-action"), true)
})

test("POSTGRES_PARITY_COMPARE_AND_SWAP_REJECTS_A_CONCURRENT_UPDATE_RACE", async () => {
  const current = stated()
  const updated = updatedFrom(current, "losing-race-action")

  const sql = fakeSql((query) => {
    if (query.includes("SELECT payload")) return [{ payload: current }]
    if (query.includes("UPDATE componentry_projects")) return []
    throw new Error(`Unexpected SQL: ${query}`)
  })

  const result = await appendProjectNextActionPostgresWithSql(
    sql,
    current,
    updated,
    fingerprintProjectBrain(current),
    "2026-08-18T12:13:00.000Z",
    noBootstrap,
  )

  assert.equal(result.status, "STALE_PRECONDITION")
  assert.equal(result.afterFingerprint, undefined)
  assert.ok(result.error?.includes("changed concurrently"))
})
