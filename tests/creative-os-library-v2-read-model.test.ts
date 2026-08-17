import test from "node:test"
import assert from "node:assert/strict"

import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"
import {
  LIBRARY_V2_ENTITY_KINDS,
  LIBRARY_V2_METHOD_DOMAINS,
  buildLibraryV2ReadModel,
  getLibraryV2EntityById,
  listLibraryV2EntitiesByKind,
  listLibraryV2MethodsByDomain
} from "../lib/creative-os/library-v2"
import { validateLibraryV2Projection } from "../lib/creative-os/library-v2/validation"
import type { LibraryEntityKind, MethodDomain, LibraryV2Entity } from "../lib/creative-os/library-v2"

const EXPECTED_KINDS: readonly LibraryEntityKind[] = LIBRARY_V2_ENTITY_KINDS
const EXPECTED_DOMAINS: readonly MethodDomain[] = LIBRARY_V2_METHOD_DOMAINS

function isFrozenDeep(value: unknown): boolean {
  if (!Object.isFrozen(value)) return false
  if (Array.isArray(value)) {
    return value.every((item) => isFrozenDeep(item))
  }
  if (typeof value === "object" && value !== null) {
    return Object.values(value).every((item) => isFrozenDeep(item))
  }
  return true
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function readModelIds(model: ReturnType<typeof buildLibraryV2ReadModel>): string[] {
  return model.entities.map((entity) => entity.id)
}

function mutablyProbeModel(model: ReturnType<typeof buildLibraryV2ReadModel>): void {
  const mutable = model as unknown as {
    valid: boolean
    errors: string[]
    warnings: unknown[]
    entities: LibraryV2Entity[]
    countsByKind: Record<LibraryEntityKind, number>
    methodCountsByDomain: Record<MethodDomain, number>
  }

  try { mutable.valid = false } catch {}
  try { mutable.errors.push("mutated") } catch {}
  try { mutable.warnings.push({}) } catch {}
  try { mutable.entities.push({} as never) } catch {}
  try { mutable.entities.reverse() } catch {}
  try { mutable.entities[0].name = "mutated-name" } catch {}
  try { mutable.entities[0].description = "mutated-description" } catch {}
  try {
    const first = mutable.entities[0]
    if ("tags" in first && Array.isArray(first.tags)) {
      first.tags.push("mutated-tag")
    }
  } catch {}
  try {
    const first = mutable.entities[0]
    if ("supersedes" in first && Array.isArray(first.supersedes)) {
      first.supersedes.push("mutated-supersedes")
    }
  } catch {}
  try {
    const first = mutable.entities[0]
    if ("supersededBy" in first && Array.isArray(first.supersededBy)) {
      first.supersededBy.push("mutated-superseded-by")
    }
  } catch {}
  try { mutable.countsByKind.SOURCE = 99 } catch {}
  try { mutable.methodCountsByDomain.STRATEGY = 99 } catch {}
}

test("READ_MODEL_VALID_BUILD_GATE", () => {
  const model = buildLibraryV2ReadModel()

  assert.equal(model.valid, true)
  assert.deepStrictEqual(model.errors, [])
  assert.equal(model.entities.length, 20)
})

test("READ_MODEL_ENTITY_KIND_COUNTS_GATE", () => {
  const model = buildLibraryV2ReadModel()

  assert.deepStrictEqual(model.countsByKind, {
    SOURCE: 5,
    RESOURCE: 6,
    REFERENCE: 0,
    METHOD: 6,
    PROVIDER: 3
  })
})

test("READ_MODEL_METHOD_DOMAIN_COUNTS_GATE", () => {
  const model = buildLibraryV2ReadModel()

  assert.deepStrictEqual(model.methodCountsByDomain, {
    STRATEGY: 1,
    PERCEPTUAL: 1,
    CREATIVE_TRANSFORMATION: 1,
    CONCEPTUAL: 1,
    PRODUCTION: 1,
    ORCHESTRATION: 1
  })
})

test("READ_MODEL_ORDER_DETERMINISM_GATE", () => {
  const first = buildLibraryV2ReadModel()
  const second = buildLibraryV2ReadModel()

  assert.deepStrictEqual(readModelIds(first), RESOURCE_REGISTRY.map((resource) => resource.id))
  assert.deepStrictEqual(second, first)
})

test("READ_MODEL_ID_LOOKUP_GATE", () => {
  const model = buildLibraryV2ReadModel()
  const known = getLibraryV2EntityById(model, "res_originkit")
  const unknown = getLibraryV2EntityById(model, "does-not-exist")

  assert.ok(known)
  assert.equal(known?.id, "res_originkit")
  assert.equal(unknown, null)
})

test("READ_MODEL_KIND_FILTER_GATE", () => {
  const model = buildLibraryV2ReadModel()

  for (const kind of EXPECTED_KINDS) {
    const entities = listLibraryV2EntitiesByKind(model, kind)
    assert.ok(entities.every((entity) => entity.entityKind === kind))
  }

  assert.equal(listLibraryV2EntitiesByKind(model, "SOURCE").length, 5)
  assert.equal(listLibraryV2EntitiesByKind(model, "RESOURCE").length, 6)
  assert.equal(listLibraryV2EntitiesByKind(model, "REFERENCE").length, 0)
  assert.equal(listLibraryV2EntitiesByKind(model, "METHOD").length, 6)
  assert.equal(listLibraryV2EntitiesByKind(model, "PROVIDER").length, 3)
})

test("READ_MODEL_METHOD_FILTER_GATE", () => {
  const model = buildLibraryV2ReadModel()

  for (const domain of EXPECTED_DOMAINS) {
    const methods = listLibraryV2MethodsByDomain(model, domain)
    assert.equal(methods.length, 1)
    assert.ok(methods.every((entity) => entity.entityKind === "METHOD" && entity.methodDomain === domain))
  }
})

test("READ_MODEL_REFERENCE_ZERO_GATE", () => {
  const model = buildLibraryV2ReadModel()

  assert.equal(model.countsByKind.REFERENCE, 0)
  assert.deepStrictEqual(listLibraryV2EntitiesByKind(model, "REFERENCE"), [])
})

test("READ_MODEL_FAIL_CLOSED_GATE", () => {
  const invalidResources = RESOURCE_REGISTRY.slice(0, 19)
  const model = buildLibraryV2ReadModel(invalidResources)

  assert.equal(model.valid, false)
  assert.ok(model.errors.length > 0)
  assert.deepStrictEqual(model.entities, [])
  assert.deepStrictEqual(model.countsByKind, {
    SOURCE: 0,
    RESOURCE: 0,
    REFERENCE: 0,
    METHOD: 0,
    PROVIDER: 0
  })
  assert.deepStrictEqual(model.methodCountsByDomain, {
    STRATEGY: 0,
    PERCEPTUAL: 0,
    CREATIVE_TRANSFORMATION: 0,
    CONCEPTUAL: 0,
    PRODUCTION: 0,
    ORCHESTRATION: 0
  })
})


test("READ_MODEL_WARNING_PRESERVATION_GATE", () => {
  const model = buildLibraryV2ReadModel()
  const validation = validateLibraryV2Projection()

  assert.deepStrictEqual(model.warnings, validation.warnings)

  const legacyPlaceholderWarnings = validation.warnings.filter((warning) => warning.code === "LEGACY_PLACEHOLDER_SOURCE")
  assert.equal(new Set(legacyPlaceholderWarnings.map((warning) => warning.resourceId)).size, 11)
  assert.equal(
    RESOURCE_REGISTRY.filter((resource) => resource.sourceUrl?.includes("github.com/example/")).length,
    11
  )
  assert.equal(legacyPlaceholderWarnings.length, 22)
})

test("READ_MODEL_ORIGINKIT_CONSERVATIVE_GATE", () => {
  const model = buildLibraryV2ReadModel()
  const originKit = getLibraryV2EntityById(model, "res_originkit")

  assert.ok(originKit)
  assert.equal(originKit?.entityKind, "SOURCE")
  if (originKit?.entityKind === "SOURCE") {
    assert.equal(originKit.sourceKind, "CONNECTOR")
    assert.equal(originKit.lifecycleState, "TEST_CANDIDATE")
    assert.equal(originKit.authorityPolicy.maximumAuthority, "READ_ONLY")
    assert.equal(originKit.licenseEvidenceRecords?.[0].status, "UNKNOWN")
    assert.equal(originKit.licenseEvidenceRecords?.[0].licenseValue, "UNCLAIMED")
    assert.equal(originKit.compatibilityEvidenceStatus, "UNKNOWN")
    assert.notEqual(originKit.sourceVerificationStatus, "VERIFIED")
  }
})

test("READ_MODEL_IMMUTABILITY_ISOLATION_GATE", () => {
  const beforeRegistry = clone(RESOURCE_REGISTRY)
  const first = buildLibraryV2ReadModel()

  assert.ok(isFrozenDeep(first))
  assert.ok(Object.isFrozen(first.entities))
  assert.ok(Object.isFrozen(first.countsByKind))
  assert.ok(Object.isFrozen(first.methodCountsByDomain))

  mutablyProbeModel(first)

  assert.deepStrictEqual(RESOURCE_REGISTRY, beforeRegistry)

  const second = buildLibraryV2ReadModel()
  assert.deepStrictEqual(second, first)
  assert.ok(isFrozenDeep(second))
})
