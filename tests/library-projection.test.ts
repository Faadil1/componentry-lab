import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { getLibraryProjection } from "../lib/library/types"
import { registryComponents } from "../lib/registry/components"
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"

describe("IA-01 Unified Library Projection", () => {
  it("projects all components into LibraryProjectionItem", () => {
    const projection = getLibraryProjection()
    const components = projection.filter(p => p.sourceKind === "COMPONENT")
    assert.equal(components.length, registryComponents.length)

    for (const comp of components) {
      assert.ok(comp.projectionId.startsWith("comp_"))
      assert.equal(comp.canonicalOwner, "ComponentRegistry")
      assert.equal(comp.status.namespace, "COMPONENT_MATURITY")
      assert.ok(comp.componentDetails)
      assert.ok(!comp.resourceDetails)
    }
  })

  it("projects all creative resources into LibraryProjectionItem", () => {
    const projection = getLibraryProjection()
    const resources = projection.filter(p => p.sourceKind === "CREATIVE_RESOURCE")
    assert.equal(resources.length, RESOURCE_REGISTRY.length)

    for (const res of resources) {
      assert.ok(res.projectionId.startsWith("res_"))
      assert.equal(res.canonicalOwner, "CreativeOsResourceRegistry")
      assert.equal(res.status.namespace, "RESOURCE_LIFECYCLE")
      assert.ok(res.resourceDetails)
      assert.ok(!res.componentDetails)
    }
  })

  it("aggregates and retains immutability", () => {
    const projection = getLibraryProjection()
    assert.equal(projection.length, registryComponents.length + RESOURCE_REGISTRY.length)
  })
})
