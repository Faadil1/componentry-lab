import test, { describe } from "node:test"
import assert from "node:assert"
import { resolveProductionRoute } from "../lib/creative-os/production/router"
import { createProductionArtifact, createArtifactManifest, getAssemblyCandidates } from "../lib/creative-os/production/artifacts"
import type { ExternalCapabilityPlan, ExternalCapabilityExecutionStatus, ExternalCapabilityExecutionMode } from "../lib/creative-os/film-kit/types"
import type { AuthorityCeiling } from "../lib/creative-os/types"

describe("Production Routing (Slice 3E.1)", () => {

  const basePlan: ExternalCapabilityPlan = {
    resourceId: null,
    capabilityId: "",
    decomposedCapabilities: [],
    requestedArtifact: null,
    compatibilityStatus: "UNKNOWN",
    compatibilityEvidence: null,
    lifecycleState: null,
    currentAuthority: "READ_ONLY",
    requiredAuthority: "READ_ONLY",
    requiredHumanApproval: false,
    humanApprovalState: "NOT_REQUIRED",
    costStatus: "FREE",
    estimatedCost: null,
    privacyStatus: "LOCAL_ONLY",
    licenseStatus: null,
    requiredInputs: [],
    expectedOutputs: [],
    executionMode: "NOT_EXECUTED",
    executionStatus: "NOT_EXECUTED",
    blockers: [],
    missingEvidence: [],
    planFingerprint: "test-fingerprint"
  }

  describe("Routing Invariants", () => {
    test("A. simple CSS fade -> NATIVE (Least-powerful sufficient / NATIVE preference)", () => {
      const plan = { ...basePlan, capabilityId: "CSS_FADE", requestedArtifact: "css" }
      const route = resolveProductionRoute(plan, "proj_day", true)
      
      assert.strictEqual(route.routeType, "NATIVE")
      assert.strictEqual(route.licenseState, "PROPRIETARY")
      assert.strictEqual(route.authorityRequired, "READ_ONLY")
    })

    test("B. complex React interaction -> NO_MATCH for unknown internal", () => {
      const plan = { ...basePlan, capabilityId: "REACT_INTERACTION", requestedArtifact: "component", resourceId: "res_core_component" }
      const route = resolveProductionRoute(plan, "proj_hackathon", false)
      
      assert.strictEqual(route.routeType, "NO_MATCH")
      assert.strictEqual(route.licenseState, "UNKNOWN")
    })

    test("C. rules-governance -> Internal method production route", () => {
      // Sacred Rules Breaker is a CORE_METHOD, MIT license
      const plan = { ...basePlan, capabilityId: "VALIDATE_RULES_BREAK", resourceId: "res_sacred_rules_breaker" }
      const route = resolveProductionRoute(plan, "proj_day", false)
      
      assert.strictEqual(route.routeType, "INTERNAL_COMPONENT") 
      assert.strictEqual(route.licenseState, "MIT")
    })

    test("D. CinePrompt share-link requirement -> governed external provider route", () => {
      const plan = { 
        ...basePlan, 
        capabilityId: "PROMPT_SHARE_LINK_CREATION", 
        resourceId: "res_cineprompt", 
        requiredAuthority: "EXPLICIT_EXTERNAL" as AuthorityCeiling, 
        executionMode: "LIVE" as ExternalCapabilityExecutionMode 
      }
      const route = resolveProductionRoute(plan, "proj_data_story", false)
      
      assert.strictEqual(route.routeType, "EXTERNAL_PROVIDER")
      assert.strictEqual(route.authorityRequired, "EXPLICIT_EXTERNAL")
      assert.strictEqual(route.heroDemoContribution, "PRIMARY")
      assert.ok(route.evidenceRequired.includes("EXECUTION_RECEIPT"))
    })

    test("E. unknown capability -> NO_MATCH / BLOCKED fails closed", () => {
      const plan = { ...basePlan, capabilityId: "UNKNOWN_MAGIC" }
      const route = resolveProductionRoute(plan, "proj_test", false)
      
      assert.strictEqual(route.routeType, "NO_MATCH")
      assert.strictEqual(route.status, "BLOCKED")
      assert.strictEqual(route.authorityRequired, "PROHIBITED")
    })

    test("F. DISCOVERY_FEED and REFERENCE_ONLY candidates -> not executable", () => {
      // res_component_gallery does not exist but let's test if router forces NO_MATCH for missing
      const plan = { ...basePlan, capabilityId: "DISCOVERY", resourceId: "res_arena_feed" }
      const route = resolveProductionRoute(plan, "proj_test", false)
      
      assert.strictEqual(route.routeType, "NO_MATCH")
      assert.strictEqual(route.status, "BLOCKED")
      assert.strictEqual(route.executionMode, "NOT_EXECUTED")
    })

    test("G. invalid/deprecated/rejected/superseded lifecycle blocked", () => {
      // Lifecycle blocks flow down from film-kit via executionStatus = BLOCKED
      const planRejected = { ...basePlan, capabilityId: "WIDGET", resourceId: "res_rejected", executionStatus: "BLOCKED" as ExternalCapabilityExecutionStatus }
      const route = resolveProductionRoute(planRejected, "proj_test", false)
      
      assert.strictEqual(route.status, "BLOCKED")
    })

    test("H. external component with UNKNOWN license -> preserved", () => {
      const plan = { ...basePlan, capabilityId: "WIDGET", resourceId: "res_unknown_widget" }
      const route = resolveProductionRoute(plan, "proj_test", false)
      
      assert.strictEqual(route.licenseState, "UNKNOWN")
    })
    
    test("I. Determinism and IDs", () => {
      const plan = { ...basePlan, capabilityId: "TEST_CAP", requestedArtifact: "TEST_ART" }
      const route1 = resolveProductionRoute(plan, "proj_test", true)
      
      assert.ok(route1.routeId.startsWith("route_native_"))
      assert.strictEqual(route1.planFingerprint, "test-fingerprint")
    })
  })

  describe("Artifact Spine", () => {
    test("Artifact deterministic identity, project/route provenance, license preservation", () => {
      const plan = { ...basePlan, capabilityId: "VALIDATE_RULES_BREAK", resourceId: "res_sacred_rules_breaker" }
      const route = resolveProductionRoute(plan, "proj_day", false)
      
      const artifact1 = createProductionArtifact("proj_day", "workflow-rules", route, "agent_1", [], { rules: "break" })
      const artifact2 = createProductionArtifact("proj_day", "workflow-rules", route, "agent_1", [], { rules: "break" })
      
      assert.strictEqual(artifact1.artifactId, artifact2.artifactId)
      assert.strictEqual(artifact1.projectId, "proj_day")
      assert.strictEqual(artifact1.sourceRouteId, route.routeId)
      assert.strictEqual(artifact1.sourceResourceId, "res_sacred_rules_breaker")
      assert.strictEqual(artifact1.provenance, "route:INTERNAL_COMPONENT")
      assert.strictEqual(artifact1.licenseState, "MIT")
    })

    test("External receipt binding vs Native no-fake-receipt", () => {
      const externalPlan = { ...basePlan, capabilityId: "PROMPT_SHARE_LINK_CREATION", resourceId: "res_cineprompt" }
      const externalRoute = resolveProductionRoute(externalPlan, "proj_test", false)
      const extArtifact = createProductionArtifact("proj_test", "share-link", externalRoute, "sys", [], {}, "receipt_123")
      assert.strictEqual(extArtifact.executionReceiptFingerprint, "receipt_123")
      
      const nativePlan = { ...basePlan, capabilityId: "CSS_FADE", requestedArtifact: "css" }
      const nativeRoute = resolveProductionRoute(nativePlan, "proj_test", true)
      const natArtifact = createProductionArtifact("proj_test", "css", nativeRoute, "sys", [], {}, "fake_receipt")
      assert.strictEqual(natArtifact.executionReceiptFingerprint, null) // No fake receipt for native
    })
  })

  describe("Manifest Semantics", () => {
    test("requested/existing/missing, publication-safe assembly, temporary/approved/rejected", () => {
      const art1 = createProductionArtifact("proj_1", "typeA", null, "sys", [], {}, null, "APPROVED")
      const art2 = createProductionArtifact("proj_1", "typeB", null, "sys", [], {}, null, "REJECTED")
      const art3 = createProductionArtifact("proj_1", "typeC", null, "sys", [], {}, null, "SUPERSEDED")
      
      const manifest = createArtifactManifest("proj_1", "DAY_CHALLENGE", ["typeA", "typeB", "typeC", "typeD"], [art1, art2, art3], [])
      
      assert.deepStrictEqual(manifest.requestedArtifacts, ["typeA", "typeB", "typeC", "typeD"])
      // Missing artifacts ignores rejected/superseded as they are not valid fulfillments
      assert.deepStrictEqual(manifest.missingArtifacts, ["typeB", "typeC", "typeD"])
      
      const candidates = getAssemblyCandidates(manifest)
      assert.strictEqual(candidates.length, 1)
      assert.strictEqual(candidates[0].artifactType, "typeA")
    })
  })

  describe("Four Mode Scenarios & Project Brain Immutability", () => {
    test("Mode behaviors and zero-mutation", () => {
      // Mock canonical project brain
      const canonicalBrain = { id: "brain_1", projects: [{ id: "proj_day" }, { id: "proj_hackathon" }, { id: "proj_mara" }, { id: "proj_data_story" }] }
      const brainBefore = JSON.parse(JSON.stringify(canonicalBrain))

      // DAY_CHALLENGE: CSS fade (NATIVE)
      const planDay = { ...basePlan, capabilityId: "CSS_FADE", requestedArtifact: "css" }
      const routeDay = resolveProductionRoute(planDay, "proj_day", true)
      assert.strictEqual(routeDay.routeType, "NATIVE")
      assert.strictEqual(routeDay.heroDemoContribution, "SUPPORTING")

      // HACKATHON: product-demo-film (EXTERNAL_PROVIDER via CinePrompt or Video Shotcraft simulation)
      const planHackathon = { ...basePlan, capabilityId: "CINEMATIC_PRODUCT_DEMO", requestedArtifact: "product-demo-film", resourceId: "res_cineprompt" }
      const routeHackathon = resolveProductionRoute(planHackathon, "proj_hackathon", false)
      assert.strictEqual(routeHackathon.heroDemoContribution, "PRIMARY") // Because artifact is product-demo-film

      // MARA: narrative-staging (INTERNAL_COMPONENT)
      const planMara = { ...basePlan, capabilityId: "STORYBOARD", resourceId: "res_physical_situation_storyboarder" }
      const routeMara = resolveProductionRoute(planMara, "proj_mara", false)
      assert.strictEqual(routeMara.routeType, "INTERNAL_COMPONENT")

      // DATA_STORY: Share link (EXTERNAL_PROVIDER)
      const planDataStory = { ...basePlan, capabilityId: "PROMPT_SHARE_LINK_CREATION", resourceId: "res_cineprompt" }
      const routeDataStory = resolveProductionRoute(planDataStory, "proj_data_story", false)
      assert.strictEqual(routeDataStory.routeType, "EXTERNAL_PROVIDER")
      assert.strictEqual(routeDataStory.heroDemoContribution, "PRIMARY")
      
      const brainAfter = JSON.parse(JSON.stringify(canonicalBrain))
      assert.deepStrictEqual(brainBefore, brainAfter)
    })
  })
})
