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
// Sacred Rules Breaker — V3 Spec Tests
// ───────────────────────────────────────────────────────────────

const srbInput = {
  methodId: SACRED_RULES_BREAKER_ID,
  projectMode: "DAY_CHALLENGE" as const,
  phase: "verify" as const,
  subjectDescription: "Premium renovation A",
  subjectContext: "renovation",
  capabilityGap: "category-differentiation",
  supplementaryFields: {
    objective: "make expertise and accountability feel tangible",
    audience: "homeowners",
    desiredPosition: "premium, human, high-trust",
    trustRequirements: "reliability, competence, price confidence"
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

test("Sacred Rules Breaker all quality gates pass in V3", () => {
  const result = runSacredRulesBreaker(srbInput)
  assert.strictEqual(result.allGatesPassed, true)
  for (const gate of result.qualityResults) {
    assert.strictEqual(gate.passed, true, `Gate ${gate.gateId} failed: ${gate.failReasons.join(", ")}`)
  }
})

test("Sacred Rules Breaker: trust requirement does not automatically imply SACRED (price-opacity is BEND/BREAK)", () => {
  const result = runSacredRulesBreaker(srbInput)
  const classification = result.result.rawOutputs.sacredVsHabitClassification ?? ""
  assert.ok(classification.includes("[NATURE: HABIT] [ACTION: BREAK] price-opacity") || classification.includes("[NATURE: HABIT] [ACTION: BEND] price-opacity"))
})

test("Sacred Rules Breaker: trust requirement maps to belief and evaluates supports/weakens", () => {
  const result = runSacredRulesBreaker(srbInput)
  const classification = result.result.rawOutputs.sacredVsHabitClassification ?? ""
  assert.ok(classification.includes("Trust Impact Evaluation:"))
  assert.ok(classification.includes("Convention Effect: WEAKENS"))
})

test("Sacred Rules Breaker: nature and action are separate for every convention", () => {
  const result = runSacredRulesBreaker(srbInput)
  const classification = result.result.rawOutputs.sacredVsHabitClassification ?? ""
  assert.ok(classification.includes("[NATURE: SACRED] [ACTION: KEEP]"))
})

test("Sacred Rules Breaker: SACRED + BREAK is invalid and corrected by governance to BEND", () => {
  const result = runSacredRulesBreaker({
    ...srbInput,
    subjectDescription: "Skincare Campaign",
    subjectContext: "skincare",
    supplementaryFields: {
      objective: "campaign",
      audience: "skincare buyers",
      desiredPosition: "authenticity", // challenges clinical-efficacy-frame (default SACRED)
      trustRequirements: ""
    }
  })
  const classification = result.result.rawOutputs.sacredVsHabitClassification ?? ""
  // clinical-efficacy-frame is default SACRED, and challenged by position.
  // Instead of breaking, it should BEND.
  assert.ok(classification.includes("[NATURE: SACRED] [ACTION: BEND] clinical-efficacy-frame"))
})

test("Sacred Rules Breaker: category-recognition-preserved gate passes", () => {
  const result = runSacredRulesBreaker(srbInput)
  const gateResult = result.qualityResults.find(g => g.gateId === "srb.category-recognition-preserved")
  assert.ok(gateResult?.passed)
})

test("Sacred Rules Breaker: objective-link-explicit gate passes", () => {
  const result = runSacredRulesBreaker(srbInput)
  const gateResult = result.qualityResults.find(g => g.gateId === "srb.objective-link-explicit")
  assert.ok(gateResult?.passed)
})

test("Sacred Rules Breaker: scalable-beyond-single-visual gate passes", () => {
  const result = runSacredRulesBreaker(srbInput)
  const gateResult = result.qualityResults.find(g => g.gateId === "srb.scalable-beyond-single-visual")
  assert.ok(gateResult?.passed)
})

test("Sacred Rules Breaker: same category with different trust requirements may produce different action", () => {
  const resA = runSacredRulesBreaker({
    ...srbInput,
    supplementaryFields: {
      objective: "renovate",
      audience: "homeowners",
      desiredPosition: "premium, human, high-trust",
      trustRequirements: "price confidence" // maps to price-opacity (WEAKENS)
    }
  })
  const resB = runSacredRulesBreaker({
    ...srbInput,
    supplementaryFields: {
      objective: "renovate",
      audience: "homeowners",
      desiredPosition: "premium, human, high-trust",
      trustRequirements: "reliability" // maps to certification-years-in-business (SUPPORTS)
    }
  })
  // Compare classification text outputs since fingerprint might match format
  assert.notDeepEqual(resA.result.rawOutputs.sacredVsHabitClassification, resB.result.rawOutputs.sacredVsHabitClassification)
})

test("Sacred Rules Breaker: same category with different positioning produces different inversions", () => {
  const resA = runSacredRulesBreaker({
    ...srbInput,
    subjectDescription: "Skincare Campaign Alpha",
    supplementaryFields: {
      objective: "create a distinctive campaign",
      audience: "skincare buyers",
      desiredPosition: "youth activism and cultural energy",
      trustRequirements: "environmental credibility"
    }
  })
  const resB = runSacredRulesBreaker({
    ...srbInput,
    subjectDescription: "Skincare Campaign Beta",
    supplementaryFields: {
      objective: "create a distinctive campaign",
      audience: "skincare buyers",
      desiredPosition: "clinical proof and radical transparency",
      trustRequirements: "efficacy"
    }
  })
  assert.notDeepEqual(resA.result.rawOutputs.differentiationInsight, resB.result.rawOutputs.differentiationInsight)
})

test("Sacred Rules Breaker: contradiction resolves toward trust preservation (BEND/KEEP instead of BREAK)", () => {
  const res = runSacredRulesBreaker({
    ...srbInput,
    subjectDescription: "Skincare Campaign",
    supplementaryFields: {
      objective: "campaign",
      audience: "skincare buyers",
      desiredPosition: "authenticity", // challenges clinical-efficacy-frame
      trustRequirements: "efficacy"    // clinical-efficacy-frame maps to efficacy, effect: SUPPORTS
    }
  })
  const classification = res.result.rawOutputs.sacredVsHabitClassification ?? ""
  // Contradiction: desiredPosition wants to challenge, but trust requirement is efficacy (SUPPORTS).
  // It must resolve to BEND or KEEP, NOT break.
  assert.ok(classification.includes("[NATURE: SACRED] [ACTION: BEND] clinical-efficacy-frame"))
})

// ───────────────────────────────────────────────────────────────
// Somatic Response Design — V3 Spec Tests
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

test("Somatic Response Design all quality gates pass in V3 (including traceability and override gates)", () => {
  const result = runSomaticResponseDesign(srdInput)
  assert.strictEqual(result.allGatesPassed, true)
  for (const gate of result.qualityResults) {
    assert.strictEqual(gate.passed, true, `Gate ${gate.gateId} failed: ${gate.failReasons.join(", ")}`)
  }
})

test("Somatic Response Design perceptual principles and options exist", () => {
  const result = runSomaticResponseDesign(srdInput)
  const principles = result.result.rawOutputs.perceptualPrinciples ?? ""
  const options = result.result.rawOutputs.formalOptions ?? ""
  assert.ok(principles.includes("Principle:"))
  assert.ok(options.includes("Option:"))
})

test("Somatic Response Design traces selection back to bodily response", () => {
  const result = runSomaticResponseDesign(srdInput)
  const rationale = result.result.rawOutputs.selectedDirectionRationale ?? ""
  assert.ok(rationale.includes("perceptual principles"))
})

test("Somatic Response Design: same descriptor in different contexts produces materially different directions", () => {
  const perfumeRes = runSomaticResponseDesign({
    ...srdInput,
    subjectDescription: "premium perfume landing page",
    subjectContext: "perfume"
  })
  const dashboardRes = runSomaticResponseDesign({
    ...srdInput,
    subjectDescription: "luxury financial dashboard",
    subjectContext: "dashboard"
  })
  assert.notDeepEqual(perfumeRes.result.rawOutputs.selectedDirectionChosen, dashboardRes.result.rawOutputs.selectedDirectionChosen)
})

test("Somatic Response Design: eye-catching renovation has non-neon valid route", () => {
  const result = runSomaticResponseDesign({
    ...srdInput,
    subjectDescription: "premium home renovation service",
    subjectContext: "renovation",
    supplementaryFields: {
      targetSensoryExperience: "eye-catching"
    }
  })
  const chosen = result.result.rawOutputs.selectedDirectionChosen ?? ""
  assert.ok(!chosen.toLowerCase().includes("neon"))
  assert.ok(chosen.includes("architectural detail crop"))
})

test("Somatic Response Design unknown descriptors dynamic generation", () => {
  const result = runSomaticResponseDesign({
    ...srdInput,
    supplementaryFields: {
      targetSensoryExperience: "defiant but intimate"
    }
  })
  assert.strictEqual(result.result.rawOutputs.descriptor, "defiant but intimate")
  assert.ok(result.result.rawOutputs.observableReaction.includes("breath hold"))
})

test("Somatic Response Design stereotype risk reporting is active", () => {
  const result = runSomaticResponseDesign(srdInput)
  const risk = result.result.rawOutputs.stereotypeRisk ?? ""
  const reason = result.result.rawOutputs.stereotypeRiskReason ?? ""
  assert.ok(risk === "LOW" || risk === "MEDIUM" || risk === "HIGH")
  assert.ok(reason.length > 5)
})

test("Somatic Response Design 5-second test checks observable behaviors", () => {
  const result = runSomaticResponseDesign(srdInput)
  const testStr = result.result.rawOutputs.fiveSecondValidationTest ?? ""
  assert.ok(testStr.includes("viewer exhibit") || testStr.includes("eyes track"))
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
