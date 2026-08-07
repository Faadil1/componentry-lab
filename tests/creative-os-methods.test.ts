import { test } from "node:test"
import assert from "node:assert"
import {
  METHOD_DEFINITIONS,
  METHOD_RUNTIME_CONTEXT,
  runSacredRulesBreaker,
  runSomaticResponseDesign,
  runRelationshipPreservingAbstraction,
  runCognitiveMetaphorIllustrator,
  runPhysicalSituationStoryboarder,
  runLibraryFirstCompositionRouter,
  SACRED_RULES_BREAKER_ID,
  SOMATIC_RESPONSE_DESIGN_ID,
  RELATIONSHIP_PRESERVING_ABSTRACTION_ID,
  COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
  PHYSICAL_SITUATION_STORYBOARDER_ID,
  LIBRARY_FIRST_COMPOSITION_ROUTER_ID
} from "../lib/creative-os/methods"

// ───────────────────────────────────────────────────────────────
// Registry Tests
// ───────────────────────────────────────────────────────────────

test("method registry contains exactly 6 definitions", () => {
  assert.strictEqual(METHOD_DEFINITIONS.length, 6)
})

test("all methods are registered in runtime context", () => {
  assert.ok(METHOD_RUNTIME_CONTEXT.methods.has(SACRED_RULES_BREAKER_ID))
  assert.ok(METHOD_RUNTIME_CONTEXT.methods.has(SOMATIC_RESPONSE_DESIGN_ID))
  assert.ok(METHOD_RUNTIME_CONTEXT.methods.has(RELATIONSHIP_PRESERVING_ABSTRACTION_ID))
  assert.ok(METHOD_RUNTIME_CONTEXT.methods.has(COGNITIVE_METAPHOR_ILLUSTRATOR_ID))
  assert.ok(METHOD_RUNTIME_CONTEXT.methods.has(PHYSICAL_SITUATION_STORYBOARDER_ID))
  assert.ok(METHOD_RUNTIME_CONTEXT.methods.has(LIBRARY_FIRST_COMPOSITION_ROUTER_ID))
})

test("all definitions are deterministic = true", () => {
  for (const def of METHOD_DEFINITIONS) {
    assert.strictEqual(def.deterministic, true, `${def.id} must be marked deterministic`)
  }
})

test("all definitions use only READ_ONLY or SUGGEST authority", () => {
  for (const def of METHOD_DEFINITIONS) {
    assert.ok(
      def.authorityRequired === "READ_ONLY" || def.authorityRequired === "SUGGEST",
      `${def.id} authorityRequired must be READ_ONLY or SUGGEST, got ${def.authorityRequired}`
    )
  }
})

test("all definitions have a linked resourceId", () => {
  for (const def of METHOD_DEFINITIONS) {
    assert.ok(def.resourceId.startsWith("res_"), `${def.id} resourceId must start with res_`)
  }
})

// ───────────────────────────────────────────────────────────────
// Sacred Rules Breaker — V2 Tests
// ───────────────────────────────────────────────────────────────

const srbInput = {
  methodId: SACRED_RULES_BREAKER_ID,
  projectMode: "DAY_CHALLENGE" as const,
  phase: "verify" as const,
  subjectDescription: "A music documentary about Mara's eight-bar journey",
  subjectContext: "Short-form competition film, 8-minute format, judged panel",
  capabilityGap: "category-differentiation",
  supplementaryFields: {
    objective: "create a distinctive premium campaign",
    audience: "environmentally conscious skincare buyers",
    desiredPosition: "active and culturally relevant rather than quiet naturalism",
    trustRequirements: "efficacy, safety, environmental credibility"
  }
}

test("Sacred Rules Breaker executes and returns COMPLETE status", () => {
  const result = runSacredRulesBreaker(srbInput)
  assert.strictEqual(result.status, "COMPLETE")
  assert.strictEqual(result.isReadOnly, true)
  assert.strictEqual(result.sideEffects, null)
})

test("Sacred Rules Breaker result has 5 output sections", () => {
  const result = runSacredRulesBreaker(srbInput)
  assert.strictEqual(result.result.outputSections.length, 5)
})

test("Sacred Rules Breaker all quality gates pass", () => {
  const result = runSacredRulesBreaker(srbInput)
  assert.strictEqual(result.allGatesPassed, true)
  for (const gate of result.qualityResults) {
    assert.strictEqual(gate.passed, true, `Gate ${gate.gateId} failed: ${gate.failReasons.join(", ")}`)
  }
})

test("Sacred Rules Breaker conventions-inventoried gate passes", () => {
  const result = runSacredRulesBreaker(srbInput)
  const gateResult = result.qualityResults.find(g => g.gateId === "srb.conventions-inventoried")
  assert.ok(gateResult?.passed)
})

test("Sacred Rules Breaker trust-codes-protected gate enforces preservation", () => {
  const result = runSacredRulesBreaker(srbInput)
  const gateResult = result.qualityResults.find(g => g.gateId === "srb.trust-codes-protected")
  assert.ok(gateResult?.passed)
})

test("Sacred Rules Breaker break-candidates-strategic gate passes", () => {
  const result = runSacredRulesBreaker(srbInput)
  const gateResult = result.qualityResults.find(g => g.gateId === "srb.break-candidates-strategic")
  assert.ok(gateResult?.passed)
})

test("Sacred Rules Breaker strategic-inversion-position-sensitive gate passes", () => {
  const result = runSacredRulesBreaker(srbInput)
  const gateResult = result.qualityResults.find(g => g.gateId === "srb.strategic-inversion-position-sensitive")
  assert.ok(gateResult?.passed)
})

test("Sacred Rules Breaker context-sensitivity: different positions produce different inversions in same category", () => {
  const inputA = {
    ...srbInput,
    subjectDescription: "Skincare Campaign Alpha",
    supplementaryFields: {
      objective: "create a distinctive campaign",
      audience: "skincare buyers",
      desiredPosition: "youth activism and cultural energy",
      trustRequirements: "environmental credibility"
    }
  }

  const inputB = {
    ...srbInput,
    subjectDescription: "Skincare Campaign Beta",
    supplementaryFields: {
      objective: "create a distinctive campaign",
      audience: "skincare buyers",
      desiredPosition: "clinical proof and radical transparency",
      trustRequirements: "efficacy"
    }
  }

  const resA = runSacredRulesBreaker(inputA)
  const resB = runSacredRulesBreaker(inputB)

  assert.notDeepEqual(resA.result.rawOutputs.differentiationInsight, resB.result.rawOutputs.differentiationInsight)
})

test("Sacred Rules Breaker is deterministic", () => {
  const r1 = runSacredRulesBreaker(srbInput)
  const r2 = runSacredRulesBreaker(srbInput)
  assert.deepStrictEqual(r1.result.rawOutputs, r2.result.rawOutputs)
})

// ───────────────────────────────────────────────────────────────
// Somatic Response Design — V2 Tests
// ───────────────────────────────────────────────────────────────

const srdInput = {
  methodId: SOMATIC_RESPONSE_DESIGN_ID,
  projectMode: "DAY_CHALLENGE" as const,
  phase: "verify" as const,
  subjectDescription: "A live performance pitch for Glow Atelier skincare brand",
  subjectContext: "Competition pitch, 5-minute format, audience of brand judges",
  capabilityGap: "bodily-response-art-direction",
  supplementaryFields: {
    targetSensoryExperience: "luxurious"
  }
}

test("Somatic Response Design executes and returns COMPLETE status", () => {
  const result = runSomaticResponseDesign(srdInput)
  assert.strictEqual(result.status, "COMPLETE")
  assert.strictEqual(result.isReadOnly, true)
  assert.strictEqual(result.sideEffects, null)
})

test("Somatic Response Design all quality gates pass (including new dark-pattern safeguard gate)", () => {
  const result = runSomaticResponseDesign(srdInput)
  assert.strictEqual(result.allGatesPassed, true)
  for (const gate of result.qualityResults) {
    assert.strictEqual(gate.passed, true, `Gate ${gate.gateId} failed: ${gate.failReasons.join(", ")}`)
  }
})

test("Somatic Response Design unknown adjective behavior fallback generator", () => {
  const result = runSomaticResponseDesign({
    ...srdInput,
    supplementaryFields: {
      targetSensoryExperience: "precise without feeling clinical"
    }
  })
  assert.strictEqual(result.status, "COMPLETE")
  assert.strictEqual(result.result.rawOutputs.descriptor, "precise without feeling clinical")
  assert.ok(result.result.rawOutputs.observableReaction.includes("pupil dilation"))
})

test("Somatic Response Design context sensitivity: luxury perfume vs luxury dashboard", () => {
  const perfumeRes = runSomaticResponseDesign({
    methodId: SOMATIC_RESPONSE_DESIGN_ID,
    projectMode: "DAY_CHALLENGE" as const,
    phase: "verify" as const,
    subjectDescription: "premium perfume landing page",
    subjectContext: "landing page",
    capabilityGap: "bodily-response-art-direction",
    supplementaryFields: {
      targetSensoryExperience: "luxurious"
    }
  })

  const dashboardRes = runSomaticResponseDesign({
    methodId: SOMATIC_RESPONSE_DESIGN_ID,
    projectMode: "DAY_CHALLENGE" as const,
    phase: "verify" as const,
    subjectDescription: "luxury financial dashboard",
    subjectContext: "dashboard",
    capabilityGap: "bodily-response-art-direction",
    supplementaryFields: {
      targetSensoryExperience: "luxurious"
    }
  })

  // The composition and typography details should materially differ
  assert.notDeepEqual(perfumeRes.result.rawOutputs.compositionConsequence, dashboardRes.result.rawOutputs.compositionConsequence)
  assert.notDeepEqual(perfumeRes.result.rawOutputs.typographyConsequence, dashboardRes.result.rawOutputs.typographyConsequence)
})

// ───────────────────────────────────────────────────────────────
// Stub Methods — Contract Tests (methods 3–6)
// ───────────────────────────────────────────────────────────────

const stubBase = {
  phase: "clarify" as const,
  subjectDescription: "Test subject",
  subjectContext: "Test context",
  capabilityGap: "test-gap"
}

test("Relationship-Preserving Abstraction stub returns BLOCKED", () => {
  const result = runRelationshipPreservingAbstraction({ methodId: RELATIONSHIP_PRESERVING_ABSTRACTION_ID, projectMode: "DATA_STORY" as const, ...stubBase })
  assert.strictEqual(result.status, "BLOCKED")
  assert.strictEqual(result.result.outputSections[0]?.content, "Relationship-Preserving Abstraction is a contract stub. Full implementation is deferred.")
})

test("Cognitive Metaphor Illustrator stub returns BLOCKED", () => {
  const result = runCognitiveMetaphorIllustrator({ methodId: COGNITIVE_METAPHOR_ILLUSTRATOR_ID, projectMode: "DATA_STORY" as const, ...stubBase })
  assert.strictEqual(result.status, "BLOCKED")
})

test("Physical Situation Storyboarder stub returns BLOCKED", () => {
  const result = runPhysicalSituationStoryboarder({ methodId: PHYSICAL_SITUATION_STORYBOARDER_ID, projectMode: "MARA" as const, ...stubBase })
  assert.strictEqual(result.status, "BLOCKED")
})

test("Library-First Composition Router stub returns BLOCKED", () => {
  const result = runLibraryFirstCompositionRouter({ methodId: LIBRARY_FIRST_COMPOSITION_ROUTER_ID, projectMode: "HACKATHON" as const, ...stubBase })
  assert.strictEqual(result.status, "BLOCKED")
})
