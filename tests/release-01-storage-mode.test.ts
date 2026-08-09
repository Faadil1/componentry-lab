import assert from "node:assert/strict"
import test, { afterEach, describe } from "node:test"

import { getComponentryLabStorageMode, isDurableStorageRequired } from "../lib/persistence/storage-mode"

const originalMode = process.env.COMPONENTRY_LAB_STORAGE_MODE
const originalNodeEnv = process.env.NODE_ENV

afterEach(() => {
  process.env.COMPONENTRY_LAB_STORAGE_MODE = originalMode
  ;(process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv
})

describe("release-01 storage mode", () => {
  test("defaults to local-file outside production", () => {
    delete process.env.COMPONENTRY_LAB_STORAGE_MODE
    ;(process.env as Record<string, string | undefined>).NODE_ENV = "test"

    assert.equal(getComponentryLabStorageMode(), "local-file")
    assert.equal(isDurableStorageRequired(), false)
  })

  test("accepts explicit postgres mode", () => {
    process.env.COMPONENTRY_LAB_STORAGE_MODE = "postgres"
    ;(process.env as Record<string, string | undefined>).NODE_ENV = "production"

    assert.equal(getComponentryLabStorageMode(), "postgres")
    assert.equal(isDurableStorageRequired(), true)
  })

  test("fails closed in production when storage mode is missing", () => {
    delete process.env.COMPONENTRY_LAB_STORAGE_MODE
    ;(process.env as Record<string, string | undefined>).NODE_ENV = "production"

    assert.throws(() => getComponentryLabStorageMode(), /must be set to 'postgres' in production/)
  })
})

