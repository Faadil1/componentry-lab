import assert from "node:assert/strict"
import test from "node:test"

import { fingerprintProjectBrain } from "../lib/projects/fingerprint"
import {
  completeProjectNextActionPostgresWithSql,
  type ProjectNextActionCompleteSqlClient,
} from "../lib/projects/next-action-complete-writer"
import { projectPresets } from "../lib/projects/presets"
import type { ProjectBrain } from "../lib/projects/types"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function doingStated(): ProjectBrain {
  const project = projectPresets.find((item) => item.id === "stated")
  assert.ok(project)
  const current = clone(project)
  const action = current.nextActions.find((item) => item.id === "act1")
  assert.ok(action)
  action.status = "doing"
  return current
}

function completedFrom(current: ProjectBrain): ProjectBrain {
  const updated = clone(current)
  const action = updated.nextActions.find((item) => item.id === "act1")
  assert.ok(action)
  action.status = "done"
  updated.updatedLabel = "2026-08-18"
  return updated
}

function fakeSql(handler: (query: string, values: unknown[] | undefined) => Array<Record<string, unknown>>): ProjectNextActionCompleteSqlClient {
  return {
    unsafe: async <T extends Array<Record<string, unknown>> = Array<Record<string, unknown>>>(query: string, values?: unknown[]) => {
      return handler(query, values) as T
    },
  }
}

const noBootstrap = async () => {}

test("COMPLETE_POSTGRES_PARITY_INSERTS_COMPLETED_OVERLAY_FOR_UNPERSISTED_SEED", async () => {
  const current = doingStated()
  const updated = completedFrom(current)
  let persistedPayload: ProjectBrain | null = null

  const sql = fakeSql((query, values) => {
    if (query.includes("SELECT payload")) return []
    if (query.includes("INSERT INTO componentry_projects")) {
      persistedPayload = JSON.parse(String(values?.[2])) as ProjectBrain
      return [{ project_id: current.id }]
    }
    throw new Error(`Unexpected SQL: ${query}`)
  })

  const result = await completeProjectNextActionPostgresWithSql(
    sql,
    current,
    updated,
    fingerprintProjectBrain(current),
    "ev1",
    "2026-08-18T13:20:00.000Z",
    noBootstrap,
  )

  assert.equal(result.status, "COMPLETED")
  assert.equal(persistedPayload?.nextActions.find((action) => action.id === "act1")?.status, "done")
  assert.equal(result.evidenceRef, "project-brain:stated:evidence:ev1")
  assert.equal(result.beforeFingerprint, fingerprintProjectBrain(current))
  assert.equal(result.afterFingerprint, fingerprintProjectBrain(updated))
})

test("COMPLETE_POSTGRES_PARITY_UPDATES_ONLY_MATCHING_PERSISTED_PAYLOAD", async () => {
  const current = doingStated()
  const updated = completedFrom(current)
  let updateValues: unknown[] | undefined

  const sql = fakeSql((query, values) => {
    if (query.includes("SELECT payload")) return [{ payload: clone(current) }]
    if (query.includes("UPDATE componentry_projects")) {
      updateValues = values
      return [{ project_id: current.id }]
    }
    throw new Error(`Unexpected SQL: ${query}`)
  })

  const result = await completeProjectNextActionPostgresWithSql(
    sql,
    current,
    updated,
    fingerprintProjectBrain(current),
    "ev1",
    "2026-08-18T13:21:00.000Z",
    noBootstrap,
  )

  assert.equal(result.status, "COMPLETED")
  assert.ok(updateValues)
  const written = JSON.parse(String(updateValues?.[2])) as ProjectBrain
  const compareAndSwapExpected = JSON.parse(String(updateValues?.[4])) as ProjectBrain
  assert.equal(written.nextActions.find((action) => action.id === "act1")?.status, "done")
  assert.equal(fingerprintProjectBrain(compareAndSwapExpected), fingerprintProjectBrain(current))
})

test("COMPLETE_POSTGRES_PARITY_STALE_PERSISTED_PAYLOAD_CAUSES_ZERO_UPDATE", async () => {
  const current = doingStated()
  const updated = completedFrom(current)
  const concurrentlyChanged = clone(current)
  concurrentlyChanged.warnings = [...concurrentlyChanged.warnings, "Concurrent canonical change"]
  let updateCalled = false

  const sql = fakeSql((query) => {
    if (query.includes("SELECT payload")) return [{ payload: concurrentlyChanged }]
    if (query.includes("UPDATE componentry_projects")) {
      updateCalled = true
      return [{ project_id: current.id }]
    }
    throw new Error(`Unexpected SQL: ${query}`)
  })

  const result = await completeProjectNextActionPostgresWithSql(
    sql,
    current,
    updated,
    fingerprintProjectBrain(current),
    "ev1",
    "2026-08-18T13:22:00.000Z",
    noBootstrap,
  )

  assert.equal(result.status, "STALE_PRECONDITION")
  assert.equal(updateCalled, false)
  assert.equal(result.project?.warnings.includes("Concurrent canonical change"), true)
})

test("COMPLETE_POSTGRES_PARITY_COMPARE_AND_SWAP_RACE_FAILS_CLOSED", async () => {
  const current = doingStated()
  const updated = completedFrom(current)

  const sql = fakeSql((query) => {
    if (query.includes("SELECT payload")) return [{ payload: current }]
    if (query.includes("UPDATE componentry_projects")) return []
    throw new Error(`Unexpected SQL: ${query}`)
  })

  const result = await completeProjectNextActionPostgresWithSql(
    sql,
    current,
    updated,
    fingerprintProjectBrain(current),
    "ev1",
    "2026-08-18T13:23:00.000Z",
    noBootstrap,
  )

  assert.equal(result.status, "STALE_PRECONDITION")
  assert.equal(result.afterFingerprint, undefined)
  assert.ok(result.error?.includes("changed concurrently"))
})
