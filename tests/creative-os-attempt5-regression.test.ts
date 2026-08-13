import assert from "node:assert"
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"
import { evaluateResource } from "../lib/creative-os/evaluation"
import { planExternalCapability } from "../lib/creative-os/film-kit/planner"
import { registerProductionAdapters } from "../lib/creative-os/film-kit/adapters/index"
import { getProviderAdapterForPlan, clearProviderAdapters } from "../lib/creative-os/film-kit/adapters"
import test, { describe } from "node:test"

describe("Attempt 5 Regression - Planner Decomposition and Fail-Closed Binding", () => {
  test("CinePrompt PROMPT_SHARE_LINK_CREATION discovers adapter correctly", () => {
    // 1. Isolate test environment
    const prevEnabled = process.env.CINEPROMPT_PROVIDER_ENABLED
    const prevKey = process.env.CINEPROMPT_API_KEY
    try {
      process.env.CINEPROMPT_PROVIDER_ENABLED = "true"
      process.env.CINEPROMPT_API_KEY = "test_key"
      clearProviderAdapters()
      
      // 2. Canonical production bootstrap
      registerProductionAdapters()
      
      // 3. evaluateResource
      const resource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt")
      assert.ok(resource, "res_cineprompt should exist in registry")
      const selected = evaluateResource(resource, "DAY_CHALLENGE", "build", {
        capabilityGap: "PROMPT_SHARE_LINK_CREATION",
        artifactType: "EXTERNAL_SHARE_REFERENCE",
        currentAuthority: "EXPLICIT_EXTERNAL"
      })
      
      // 4. planExternalCapability
      const plan = planExternalCapability({
        capabilityGap: "PROMPT_SHARE_LINK_CREATION",
        artifactType: "EXTERNAL_SHARE_REFERENCE",
        projectMode: "DAY_CHALLENGE",
        phase: "build",
        currentAuthority: "EXPLICIT_EXTERNAL"
      }, selected)
      
      // 5. Assert canonical decomposition
      assert.deepStrictEqual(plan.decomposedCapabilities, ["CINEMATIC_PROMPTING"])
      
      // 6. getProviderAdapterForPlan
      const adapter = getProviderAdapterForPlan(plan)
      assert.ok(adapter, "Adapter should be found")
      assert.strictEqual(adapter.id, "adapter_cineprompt_share_link_v2")
      
    } finally {
      process.env.CINEPROMPT_PROVIDER_ENABLED = prevEnabled
      process.env.CINEPROMPT_API_KEY = prevKey
      clearProviderAdapters()
    }
  })

  test("Unknown capability gap fails closed (empty array) and does not map to SHOT_PLANNING", () => {
    const resource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt")
    assert.ok(resource)
    const selected = evaluateResource(resource, "DAY_CHALLENGE", "build", {
      capabilityGap: "UNKNOWN_GIBBERISH_GAP",
      currentAuthority: "EXPLICIT_EXTERNAL"
    })
    
    const plan = planExternalCapability({
      capabilityGap: "UNKNOWN_GIBBERISH_GAP",
      projectMode: "DAY_CHALLENGE",
      phase: "build",
      currentAuthority: "EXPLICIT_EXTERNAL"
    }, selected)
    
    assert.deepStrictEqual(plan.decomposedCapabilities, [])
    
    // Ensure no adapter is accidentally selected
    clearProviderAdapters()
    process.env.CINEPROMPT_PROVIDER_ENABLED = "true"
    process.env.CINEPROMPT_API_KEY = "test_key"
    try {
      registerProductionAdapters()
      const adapter = getProviderAdapterForPlan(plan)
      assert.strictEqual(adapter, null)
    } finally {
      process.env.CINEPROMPT_PROVIDER_ENABLED = undefined
      process.env.CINEPROMPT_API_KEY = undefined
      clearProviderAdapters()
    }
  })

  test("Legitimate camera gap preserves explicit SHOT_PLANNING decomposition", () => {
    const resource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt")
    assert.ok(resource)
    const selected = evaluateResource(resource, "DAY_CHALLENGE", "build", {
      capabilityGap: "camera-movement",
      currentAuthority: "EXPLICIT_EXTERNAL"
    })
    
    const plan = planExternalCapability({
      capabilityGap: "camera-movement",
      projectMode: "DAY_CHALLENGE",
      phase: "build",
      currentAuthority: "EXPLICIT_EXTERNAL"
    }, selected)
    
    assert.ok(plan.decomposedCapabilities.includes("SHOT_PLANNING"), "Should contain SHOT_PLANNING")
  })
})
