import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { getLibraryProjection } from "../lib/library/types"
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"
import { registryComponents } from "../lib/registry/components"

describe("IA-01B Library UX Correction", () => {
  it("does not mutate canonical ResourceType values", () => {
    const projection = getLibraryProjection()
    const resources = projection.filter(p => p.sourceKind === "CREATIVE_RESOURCE")
    assert.ok(resources.length > 0)
    for (const res of resources) {
      const canonical = RESOURCE_REGISTRY.find(r => r.id === res.sourceId)
      assert.ok(canonical)
      assert.equal(res.resourceDetails?.resourceType, canonical.type)
    }
  })

  it("does not mutate canonical ResourceLifecycle values", () => {
    const projection = getLibraryProjection()
    const resources = projection.filter(p => p.sourceKind === "CREATIVE_RESOURCE")
    assert.ok(resources.length > 0)
    
    // Check specific required enums
    const hasTestCandidate = resources.some(r => r.status.value === "TEST_CANDIDATE")
    const hasValidated = resources.some(r => r.status.value === "VALIDATED")
    
    assert.ok(hasTestCandidate, "TEST_CANDIDATE should remain TEST_CANDIDATE canonically")
    assert.ok(hasValidated, "VALIDATED should remain VALIDATED canonically (does not become APPROVED)")
    
    for (const res of resources) {
      const canonical = RESOURCE_REGISTRY.find(r => r.id === res.sourceId)
      assert.ok(canonical)
      assert.equal(res.status.value, canonical.lifecycleState)
    }
  })

  it("Creative Resources are excluded from Component System Map data", () => {
    const projection = getLibraryProjection()
    const resources = projection.filter(p => p.sourceKind === "CREATIVE_RESOURCE")
    
    // System map logic in UI filters by sourceKind === "COMPONENT"
    // We just verify that resources don't accidentally get componentDetails populated which the map relies on
    for (const res of resources) {
      assert.equal(res.componentDetails, undefined)
    }
  })

  it("Component projection remains unchanged semantically", () => {
    const projection = getLibraryProjection()
    const components = projection.filter(p => p.sourceKind === "COMPONENT")
    assert.equal(components.length, registryComponents.length)
    
    for (const comp of components) {
      assert.equal(comp.sourceKind, "COMPONENT")
      assert.ok(comp.componentDetails)
      assert.equal(comp.resourceDetails, undefined)
      assert.equal(comp.canonicalOwner, "ComponentRegistry")
    }
  })

  it("counts are derived from projection, not hardcoded", () => {
    const projection = getLibraryProjection()
    const components = projection.filter(p => p.sourceKind === "COMPONENT")
    const resources = projection.filter(p => p.sourceKind === "CREATIVE_RESOURCE")
    
    assert.equal(projection.length, components.length + resources.length)
    assert.equal(components.length, registryComponents.length)
    assert.equal(resources.length, RESOURCE_REGISTRY.length)
  })
})
