import test from "node:test"
import assert from "node:assert/strict"

import { registryComponents } from "../lib/registry/components"
import {
  buildDualLibraryProjection,
  validateLibraryCrosswalks
} from "../lib/creative-os/collaboration"
import { buildLiveLibraryV2ReadModel } from "../lib/creative-os/library-v2"

test("DUAL_LIBRARY_PROJECTION_PRESERVES_BOTH_PLANES", () => {
  const projection = buildDualLibraryProjection()
  assert.equal(projection.valid, true)
  assert.equal(projection.counts.governedCapabilities, 34)
  assert.equal(projection.counts.compositions, registryComponents.length)
  assert.equal(projection.counts.explicitCrosswalks, 0)
  assert.equal(projection.unmappedCompositionRefs.length, registryComponents.length)
})

test("ONLY_GOVERNED_INTERNAL_METHODS_ARE_EXECUTABLE_COLLABORATORS", () => {
  const projection = buildDualLibraryProjection()
  const executable = projection.governedCapabilities.filter(
    (entry) => entry.collaborationAccess === "INTERNAL_ADVISORY_EXECUTION"
  )

  assert.equal(executable.length, 6)
  assert.ok(executable.every((entry) => entry.entityKind === "METHOD"))
  assert.ok(executable.every((entry) => entry.operationEffectClass === "NONE"))

  const references = projection.governedCapabilities.filter((entry) => entry.entityKind === "REFERENCE")
  assert.ok(references.length > 0)
  assert.ok(references.every((entry) => entry.collaborationAccess === "READ_DISCOVERY_ONLY"))
  assert.ok(references.every((entry) => entry.authorityCeiling === "NOT_MODELED"))
})

test("LEGACY_COMPONENT_IDENTITIES_ARE_NAMESPACED_NOT_FABRICATED_AS_V2_IDS", () => {
  const projection = buildDualLibraryProjection()
  const captureBridge = projection.compositions.find((entry) => entry.legacyEntryId === "capture-bridge")

  assert.ok(captureBridge)
  assert.equal(captureBridge!.canonicalRef, "component-library:capture-bridge")
  assert.equal(
    projection.governedCapabilities.some((entry) => entry.entityId === "capture-bridge"),
    false
  )
})

test("LEGACY_COMPOSITION_INTELLIGENCE_IS_PRESERVED", () => {
  const projection = buildDualLibraryProjection()
  const spotlight = projection.compositions.find((entry) => entry.legacyEntryId === "spotlight")

  assert.ok(spotlight)
  assert.ok(spotlight!.capabilities.includes("responsive"))
  assert.ok(spotlight!.limitations.length > 0)
  assert.ok(spotlight!.recommendedFor.length > 0)
  assert.equal(spotlight!.namespace, "COMPONENT_LIBRARY")
  assert.ok(spotlight!.relations.every((relation) => relation.targetRef.startsWith("component-library:")))
})

test("CROSSWALK_REQUIRES_EXISTING_IDENTITIES_AND_EVIDENCE", () => {
  const governed = buildLiveLibraryV2ReadModel()
  assert.equal(governed.valid, true)

  const errors = validateLibraryCrosswalks(
    [
      {
        legacyEntryId: "capture-bridge",
        governedEntityId: "res_library_first_composition_router",
        relationship: "GOVERNED_METHOD_INFORMS_COMPOSITION",
        evidenceRefs: []
      }
    ],
    governed.entities
  )

  assert.ok(errors.some((error) => error.includes("requires evidenceRefs")))

  const invalidProjection = buildDualLibraryProjection([
    {
      legacyEntryId: "missing-legacy-id",
      governedEntityId: "missing-governed-id",
      relationship: "SAME_UNDERLYING_CAPABILITY",
      evidenceRefs: ["evidence:explicit-review"]
    }
  ])
  assert.equal(invalidProjection.valid, false)
  assert.equal(invalidProjection.crosswalks.length, 0)
})

test("NAMESPACES_PREVENT_DUAL_LIBRARY_ID_COLLISIONS", () => {
  const projection = buildDualLibraryProjection()
  const governedRefs = new Set(projection.governedCapabilities.map((entry) => entry.canonicalRef))
  const compositionRefs = new Set(projection.compositions.map((entry) => entry.canonicalRef))

  for (const ref of compositionRefs) {
    assert.equal(governedRefs.has(ref), false)
  }
})
