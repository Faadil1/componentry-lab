import { test } from "node:test"
import assert from "node:assert"
import {
  CREATIVE_DIVERGENCE_ORCHESTRATOR_ID,
  DIVERGENCE_OPERATOR_FAMILIES,
  METHOD_RUNTIME_CONTEXT,
  runCreativeDivergenceOrchestrator
} from "../lib/creative-os/methods"

const input = {
  methodId: CREATIVE_DIVERGENCE_ORCHESTRATOR_ID,
  projectMode: "HACKATHON" as const,
  phase: "route" as const,
  subjectDescription: "Generate materially distinct solution mechanisms",
  subjectContext: "Concept development before selection",
  capabilityGap: "creative-divergence",
  supplementaryFields: {
    humanSeed: "membership card as belonging artifact",
    requestedScoutCount: "5"
  }
}

test("candidate is runtime discoverable", () => {
  assert.ok(METHOD_RUNTIME_CONTEXT.methods.has(CREATIVE_DIVERGENCE_ORCHESTRATOR_ID))
})

test("orchestrator preserves isolated first pass and delayed critique", () => {
  const result = runCreativeDivergenceOrchestrator(input)
  assert.strictEqual(result.status, "COMPLETE")
  assert.strictEqual(result.allGatesPassed, true)
  assert.strictEqual(result.result.rawOutputs.firstPassPeerVisibility, "FORBIDDEN")
  assert.strictEqual(result.result.rawOutputs.firstPassCommunicationTopology, "ISOLATED_PARALLEL_BRANCHES")
  assert.strictEqual(result.result.rawOutputs.criticTiming, "AFTER_DIVERGENCE_ONLY")
  assert.strictEqual(result.result.rawOutputs.agentCountIsDiversityProxy, "false")
})

test("fanout stays bounded and human seed stays traceable", () => {
  const result = runCreativeDivergenceOrchestrator(input)
  assert.strictEqual(result.result.rawOutputs.scoutCount, "5")
  assert.strictEqual(result.result.rawOutputs.humanSeedPreservation, "REQUIRED_AND_TRACEABLE")
  assert.strictEqual(result.result.rawOutputs.pureRandomStimulusDefault, "REJECTED")
  assert.strictEqual(result.result.rawOutputs.frankensteinMergeDefault, "FORBIDDEN")
})

test("lower-tier operator families are available without external dependency adoption", () => {
  assert.ok(DIVERGENCE_OPERATOR_FAMILIES.includes("SCAMPER_TRANSFORMATION"))
  assert.ok(DIVERGENCE_OPERATOR_FAMILIES.includes("CONTRADICTION_RESOLUTION"))
  assert.ok(DIVERGENCE_OPERATOR_FAMILIES.includes("DESIGN_HEURISTIC_VARIATION"))
  const result = runCreativeDivergenceOrchestrator(input)
  assert.strictEqual(result.result.rawOutputs.externalDependenciesAdopted, "NONE")
})
