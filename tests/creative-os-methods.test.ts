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
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"


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
// Physical Situation Storyboarder — V1 Tests
// ───────────────────────────────────────────────────────────────

const pssInput = {
  methodId: PHYSICAL_SITUATION_STORYBOARDER_ID,
  projectMode: "MARA" as const,
  phase: "build" as const,
  subjectDescription: "Mara's eight-bar journey",
  subjectContext: "Short film",
  capabilityGap: "narrative-staging",
  supplementaryFields: {
    projectObjective: "observe and mirror incompleteness",
    narrativeBeat: "accepting incompleteness",
    subjectOrCharacter: "Mara",
    emotionalTension: "existential anxiety / incompleteness",
    desiredTransformation: "acceptance",
    locationConstraints: "interior pottery studio",
    propConstraints: "unfinished clay pot"
  }
}

test("Physical Situation Storyboarder executes and returns COMPLETE", () => {
  const result = runPhysicalSituationStoryboarder(pssInput)
  assert.strictEqual(result.status, "COMPLETE")
  assert.strictEqual(result.isReadOnly, true)
  assert.strictEqual(result.result.outputSections.length, 5)
})

test("Physical Situation Storyboarder all quality gates pass", () => {
  const result = runPhysicalSituationStoryboarder(pssInput)
  assert.strictEqual(result.allGatesPassed, true)
  for (const gate of result.qualityResults) {
    assert.strictEqual(gate.passed, true, `Gate ${gate.gateId} failed: ${gate.failReasons.join(", ")}`)
  }
})

test("Physical Situation Storyboarder: idea-becomes-physical converts abstract to object", () => {
  const result = runPhysicalSituationStoryboarder(pssInput)
  const pm = result.result.rawOutputs.physicalMetaphor ?? ""
  const keyObj = result.result.rawOutputs.keyObject ?? ""
  assert.ok(pm.includes("clay") || pm.includes("object"))
  assert.strictEqual(keyObj, "unfinished clay pot")
})

test("Physical Situation Storyboarder: transformation is physically visible between start and end states", () => {
  const result = runPhysicalSituationStoryboarder(pssInput)
  const start = result.result.rawOutputs.startingPhysicalState ?? ""
  const end = result.result.rawOutputs.endingPhysicalState ?? ""
  assert.notStrictEqual(start, end)
})

test("Physical Situation Storyboarder: no-exposition-dependence enforces silent subtext", () => {
  const result = runPhysicalSituationStoryboarder(pssInput)
  const unspoken = result.result.rawOutputs.whatMustRemainUnspoken ?? ""
  assert.ok(unspoken.includes("Do not speak"))
})

test("Physical Situation Storyboarder: context sensitivity (pottery vs invisible labor)", () => {
  const resA = runPhysicalSituationStoryboarder(pssInput)
  const resB = runPhysicalSituationStoryboarder({
    ...pssInput,
    supplementaryFields: {
      ...pssInput.supplementaryFields,
      narrativeBeat: "labor",
      emotionalTension: "invisible labor",
      propConstraints: "brass plates"
    }
  })
  assert.notDeepEqual(resA.result.rawOutputs.sceneNodes, resB.result.rawOutputs.sceneNodes)
})

// ───────────────────────────────────────────────────────────────
// Relationship-Preserving Abstraction — V1 Tests
// ───────────────────────────────────────────────────────────────

const rpaInput = {
  methodId: RELATIONSHIP_PRESERVING_ABSTRACTION_ID,
  projectMode: "DATA_STORY" as const,
  phase: "build" as const,
  subjectDescription: "High-rise structural photo",
  subjectContext: "Editorial poster",
  capabilityGap: "editorial-abstraction",
  supplementaryFields: {
    sourceDescription: "architectural photograph of grid facade",
    projectObjective: "convey vertical architectural height",
    communicationIntent: "highlight grid scale ratios",
    sourceType: "architectural",
    abstractionLevel: "high"
  }
}

test("Relationship-Preserving Abstraction executes and passes all quality gates", () => {
  const result = runRelationshipPreservingAbstraction(rpaInput)
  assert.strictEqual(result.status, "COMPLETE")
  assert.strictEqual(result.allGatesPassed, true)
})

test("Relationship-Preserving Abstraction: relationships-not-contours forces geometric relationships", () => {
  const result = runRelationshipPreservingAbstraction(rpaInput)
  const facts = result.result.rawOutputs.selectedFacts ?? ""
  assert.ok(facts.includes("scale") || facts.includes("rhythm") || facts.includes("occlusion"))
})

test("Relationship-Preserving Abstraction limits mark families to avoid visual noise", () => {
  const result = runRelationshipPreservingAbstraction(rpaInput)
  const supporting = result.result.rawOutputs.supportingMarkFamilies ?? ""
  const count = supporting.split("|").filter(Boolean).length
  assert.ok(count <= 2)
})

test("Relationship-Preserving Abstraction context sensitivity (architectural vs human)", () => {
  const resA = runRelationshipPreservingAbstraction(rpaInput)
  const resB = runRelationshipPreservingAbstraction({
    ...rpaInput,
    supplementaryFields: {
      ...rpaInput.supplementaryFields,
      sourceType: "human",
      sourceDescription: "portrait of staring athlete"
    }
  })
  assert.notDeepEqual(resA.result.rawOutputs.primaryMarkFamily, resB.result.rawOutputs.primaryMarkFamily)
})

// ───────────────────────────────────────────────────────────────
// Cognitive Metaphor Illustrator — V1 Tests
// ───────────────────────────────────────────────────────────────

const cmiInput = {
  methodId: COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
  projectMode: "DATA_STORY" as const,
  phase: "build" as const,
  subjectDescription: "invisible technical debt accumulation",
  subjectContext: "Developer roadmap",
  capabilityGap: "visual-metaphor",
  supplementaryFields: {
    concept: "technical debt",
    projectObjective: "convey structural load instability",
    audience: "product managers",
    projectSymbols: "granite blocks, wooden support sticks"
  }
}

test("Cognitive Metaphor Illustrator executes and passes all quality gates", () => {
  const result = runCognitiveMetaphorIllustrator(cmiInput)
  assert.strictEqual(result.status, "COMPLETE")
  assert.strictEqual(result.allGatesPassed, true)
})

test("Cognitive Metaphor Illustrator: cliche-risk-reviewed audits and rejects common cliches", () => {
  const result = runCognitiveMetaphorIllustrator(cmiInput)
  const audit = result.result.rawOutputs.clicheRiskAssessment ?? ""
  assert.ok(audit.includes("rejected"))
  assert.ok(result.result.rawOutputs.alternativeRejectedMetaphors.includes("plant"))
})

test("Cognitive Metaphor Illustrator: one-image-one-cognitive-action focuses on one relation", () => {
  const result = runCognitiveMetaphorIllustrator(cmiInput)
  const action = result.result.rawOutputs.oneCognitiveAction ?? ""
  assert.ok(action.length > 5 && !action.toLowerCase().includes("multiple"))
})

test("Cognitive Metaphor Illustrator context sensitivity (tech debt vs trust erosion)", () => {
  const resA = runCognitiveMetaphorIllustrator(cmiInput)
  const resB = runCognitiveMetaphorIllustrator({
    ...cmiInput,
    subjectDescription: "trust erosion",
    supplementaryFields: {
      ...cmiInput.supplementaryFields,
      concept: "trust erosion"
    }
  })
  assert.notDeepEqual(resA.result.rawOutputs.selectedPhysicalMetaphor, resB.result.rawOutputs.selectedPhysicalMetaphor)
})

// ───────────────────────────────────────────────────────────────
// Library-First Composition Router — V1 Tests
// ───────────────────────────────────────────────────────────────

const lfcrInput = {
  methodId: LIBRARY_FIRST_COMPOSITION_ROUTER_ID,
  projectMode: "HACKATHON" as const,
  phase: "route" as const,
  subjectDescription: "simple fade transition",
  subjectContext: "UI layout",
  capabilityGap: "library-composition",
  supplementaryFields: {
    requestedCapability: "simple fade",
    projectObjective: "minimize asset weight",
    artifactType: "composition-tree"
  }
}

test("Library-First Composition Router executes and passes all gates", () => {
  const result = runLibraryFirstCompositionRouter(lfcrInput)
  assert.strictEqual(result.status, "COMPLETE")
  assert.strictEqual(result.allGatesPassed, true)
})

test("Library-First Composition Router: native-first prefers native route for simple transition", () => {
  const result = runLibraryFirstCompositionRouter(lfcrInput)
  assert.strictEqual(result.result.rawOutputs.selectedRoute, "USE_NATIVE")
  assert.strictEqual(result.result.rawOutputs.selectedResource, "none")
})

test("Library-First Composition Router: recommends experimental resource for complex animation", () => {
  const result = runLibraryFirstCompositionRouter({
    ...lfcrInput,
    supplementaryFields: {
      ...lfcrInput.supplementaryFields,
      requestedCapability: "web-component-animation"
    }
  })
  assert.strictEqual(result.result.rawOutputs.selectedRoute, "CONSIDER_EXPERIMENTAL_RESOURCE")
  assert.ok(result.result.rawOutputs.selectedResource === "res_originkit" || result.result.rawOutputs.selectedResource === "res_remocn")
})

test("Library-First Composition Router reports UNKNOWN for missing metrics evidence", () => {
  const result = runLibraryFirstCompositionRouter(lfcrInput)
  const perf = result.result.rawOutputs.performanceConsiderations ?? ""
  const lic = result.result.rawOutputs.licenseConsiderations ?? ""
  assert.ok(perf.includes("UNKNOWN"))
  assert.ok(lic.includes("UNKNOWN"))
})

test("Library-First Composition Router: discovery feeds can never be direct implementation winners", () => {
  const result = runLibraryFirstCompositionRouter({
    ...lfcrInput,
    supplementaryFields: {
      ...lfcrInput.supplementaryFields,
      requestedCapability: "yummy design sprint backlog" // matches design sprint feed gap
    }
  })
  const res = result.result.rawOutputs.selectedResource ?? "none"
  assert.ok(res !== "res_yummy_design_sprint")
})

// ───────────────────────────────────────────────────────────────
// Cross-Method Governance & Lifecycle Integrity Tests
// ───────────────────────────────────────────────────────────────

test("cross-method governance: all six methods resolve through the same runtime structure", () => {
  const allMethods = [
    runSacredRulesBreaker,
    runSomaticResponseDesign,
    runPhysicalSituationStoryboarder,
    runRelationshipPreservingAbstraction,
    runCognitiveMetaphorIllustrator,
    runLibraryFirstCompositionRouter
  ]
  assert.strictEqual(allMethods.length, 6)
  for (const run of allMethods) {
    assert.strictEqual(typeof run, "function")
  }
})

test("cross-method governance: all four new methods remain in TEST_CANDIDATE lifecycleState", () => {
  const pss = RESOURCE_REGISTRY.find(r => r.id === "res_physical_situation_storyboarder")!
  const rpa = RESOURCE_REGISTRY.find(r => r.id === "res_relationship_preserving_abstraction")!
  const cmi = RESOURCE_REGISTRY.find(r => r.id === "res_cognitive_metaphor_illustrator")!
  const lfcr = RESOURCE_REGISTRY.find(r => r.id === "res_library_first_composition_router")!

  assert.strictEqual(pss.lifecycleState, "TEST_CANDIDATE")
  assert.strictEqual(rpa.lifecycleState, "TEST_CANDIDATE")
  assert.strictEqual(cmi.lifecycleState, "TEST_CANDIDATE")
  assert.strictEqual(lfcr.lifecycleState, "TEST_CANDIDATE")
})

test("cross-method governance: only SRB and SRD are VALIDATED", () => {
  const srb = RESOURCE_REGISTRY.find(r => r.id === "res_sacred_rules_breaker")!
  const srd = RESOURCE_REGISTRY.find(r => r.id === "res_somatic_response_design")!

  assert.strictEqual(srb.lifecycleState, "VALIDATED")
  assert.strictEqual(srd.lifecycleState, "VALIDATED")
})

test("cross-method governance: zero methods are APPROVED", () => {
  for (const res of RESOURCE_REGISTRY) {
    assert.notStrictEqual(res.lifecycleState, "APPROVED", `${res.id} must not be APPROVED`)
  }
})


