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
// Sacred Rules Breaker — Full Implementation Tests
// ───────────────────────────────────────────────────────────────

const srbInput = {
  methodId: SACRED_RULES_BREAKER_ID,
  projectMode: "DAY_CHALLENGE" as const,
  phase: "verify" as const,
  subjectDescription: "A music documentary about Mara's eight-bar journey",
  subjectContext: "Short-form competition film, 8-minute format, judged panel",
  capabilityGap: "category-differentiation"
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

test("Sacred Rules Breaker conventions-inventoried gate requires >= 3 conventions", () => {
  const result = runSacredRulesBreaker(srbInput)
  const lines = (result.result.rawOutputs.conventionInventory ?? "").split("\n").filter((l: string) => l.trim())
  assert.ok(lines.length >= 3, `Expected >= 3 conventions, got ${lines.length}`)
})

test("Sacred Rules Breaker identifies at least 1 break candidate", () => {
  const result = runSacredRulesBreaker(srbInput)
  const content = result.result.rawOutputs.breakCandidates ?? ""
  assert.ok(content.trim().length > 0, "No break candidates found")
})

test("Sacred Rules Breaker differentiation insight is domain-specific (references subject)", () => {
  const result = runSacredRulesBreaker(srbInput)
  const insight = result.result.rawOutputs.differentiationInsight ?? ""
  assert.ok(insight.includes('"'), "Insight must contain quoted domain reference")
  assert.ok(insight.length > 50)
})

test("Sacred Rules Breaker produces advisory evidence", () => {
  const result = runSacredRulesBreaker(srbInput)
  assert.ok(result.advisoryEvidence.length > 0, "Advisory evidence must be non-empty")
})

test("Sacred Rules Breaker is deterministic — same input produces identical output", () => {
  const r1 = runSacredRulesBreaker(srbInput)
  const r2 = runSacredRulesBreaker(srbInput)
  assert.deepStrictEqual(r1.result.rawOutputs, r2.result.rawOutputs)
  assert.deepStrictEqual(r1.qualityResults, r2.qualityResults)
})

test("Sacred Rules Breaker is blocked for unsupported mode", () => {
  const result = runSacredRulesBreaker({ ...srbInput, projectMode: "MARA" as const })
  assert.strictEqual(result.status, "BLOCKED")
  assert.strictEqual(result.allGatesPassed, false)
  assert.strictEqual(result.sideEffects, null)
})

test("Sacred Rules Breaker result does not mutate input", () => {
  const inputSnap = JSON.stringify(srbInput)
  runSacredRulesBreaker(srbInput)
  assert.strictEqual(JSON.stringify(srbInput), inputSnap)
})

// ───────────────────────────────────────────────────────────────
// Somatic Response Design — Full Implementation Tests
// ───────────────────────────────────────────────────────────────

const srdInput = {
  methodId: SOMATIC_RESPONSE_DESIGN_ID,
  projectMode: "DAY_CHALLENGE" as const,
  phase: "verify" as const,
  subjectDescription: "A live performance pitch for Glow Atelier skincare brand",
  subjectContext: "Competition pitch, 5-minute format, audience of brand judges",
  capabilityGap: "bodily-response-art-direction"
}

test("Somatic Response Design executes and returns COMPLETE status", () => {
  const result = runSomaticResponseDesign(srdInput)
  assert.strictEqual(result.status, "COMPLETE")
  assert.strictEqual(result.isReadOnly, true)
  assert.strictEqual(result.sideEffects, null)
})

test("Somatic Response Design all quality gates pass", () => {
  const result = runSomaticResponseDesign(srdInput)
  assert.strictEqual(result.allGatesPassed, true)
  for (const gate of result.qualityResults) {
    assert.strictEqual(gate.passed, true, `Gate ${gate.gateId} failed: ${gate.failReasons.join(", ")}`)
  }
})

test("Somatic Response Design physical vocabulary gate — content must be present", () => {
  const result = runSomaticResponseDesign(srdInput)
  const content = result.result.rawOutputs.physicalResponseMap ?? ""
  assert.ok(content.trim().length > 20)
})

test("Somatic Response Design art direction gate — must contain action words", () => {
  const result = runSomaticResponseDesign(srdInput)
  const content = result.result.rawOutputs.artDirectionGuides ?? ""
  const actionWords = ["design", "aim", "hold", "trigger", "provoke", "observable"]
  const hasAction = actionWords.some((w) => content.toLowerCase().includes(w))
  assert.ok(hasAction, "Art direction must contain concrete action verbs")
})

test("Somatic Response Design risk areas gate — must be non-empty", () => {
  const result = runSomaticResponseDesign(srdInput)
  const content = result.result.rawOutputs.riskAreas ?? ""
  assert.ok(content.trim().length > 10)
})

test("Somatic Response Design is deterministic", () => {
  const r1 = runSomaticResponseDesign(srdInput)
  const r2 = runSomaticResponseDesign(srdInput)
  assert.deepStrictEqual(r1.result.rawOutputs, r2.result.rawOutputs)
})

test("Somatic Response Design is blocked for unsupported mode", () => {
  const result = runSomaticResponseDesign({ ...srdInput, projectMode: "DATA_STORY" as const })
  assert.strictEqual(result.status, "BLOCKED")
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

test("Relationship-Preserving Abstraction stub returns BLOCKED with sideEffects: null", () => {
  const result = runRelationshipPreservingAbstraction({ methodId: RELATIONSHIP_PRESERVING_ABSTRACTION_ID, projectMode: "DATA_STORY" as const, ...stubBase })
  assert.strictEqual(result.status, "BLOCKED")
  assert.strictEqual(result.sideEffects, null)
  assert.strictEqual(result.isReadOnly, true)
})

test("Cognitive Metaphor Illustrator stub returns BLOCKED with sideEffects: null", () => {
  const result = runCognitiveMetaphorIllustrator({ methodId: COGNITIVE_METAPHOR_ILLUSTRATOR_ID, projectMode: "DATA_STORY" as const, ...stubBase })
  assert.strictEqual(result.status, "BLOCKED")
  assert.strictEqual(result.sideEffects, null)
})

test("Physical Situation Storyboarder stub returns BLOCKED with sideEffects: null", () => {
  const result = runPhysicalSituationStoryboarder({ methodId: PHYSICAL_SITUATION_STORYBOARDER_ID, projectMode: "MARA" as const, ...stubBase })
  assert.strictEqual(result.status, "BLOCKED")
  assert.strictEqual(result.sideEffects, null)
})

test("Library-First Composition Router stub returns BLOCKED with sideEffects: null", () => {
  const result = runLibraryFirstCompositionRouter({ methodId: LIBRARY_FIRST_COMPOSITION_ROUTER_ID, projectMode: "HACKATHON" as const, ...stubBase })
  assert.strictEqual(result.status, "BLOCKED")
  assert.strictEqual(result.sideEffects, null)
})

test("stub methods have no quality gates", () => {
  const stubs = [
    RELATIONSHIP_PRESERVING_ABSTRACTION_ID,
    COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
    PHYSICAL_SITUATION_STORYBOARDER_ID,
    LIBRARY_FIRST_COMPOSITION_ROUTER_ID
  ]
  for (const id of stubs) {
    const def = METHOD_RUNTIME_CONTEXT.methods.get(id)
    assert.ok(def)
    assert.strictEqual(def.qualityGateIds.length, 0, `${id} stub must have 0 quality gates`)
  }
})

test("no method execution produces external side effects", () => {
  const allResults = [
    runSacredRulesBreaker(srbInput),
    runSomaticResponseDesign(srdInput),
    runRelationshipPreservingAbstraction({ methodId: RELATIONSHIP_PRESERVING_ABSTRACTION_ID, projectMode: "DATA_STORY" as const, ...stubBase }),
    runCognitiveMetaphorIllustrator({ methodId: COGNITIVE_METAPHOR_ILLUSTRATOR_ID, projectMode: "DATA_STORY" as const, ...stubBase }),
    runPhysicalSituationStoryboarder({ methodId: PHYSICAL_SITUATION_STORYBOARDER_ID, projectMode: "MARA" as const, ...stubBase }),
    runLibraryFirstCompositionRouter({ methodId: LIBRARY_FIRST_COMPOSITION_ROUTER_ID, projectMode: "HACKATHON" as const, ...stubBase })
  ]
  for (const r of allResults) {
    assert.strictEqual(r.sideEffects, null)
    assert.strictEqual(r.isReadOnly, true)
  }
})
