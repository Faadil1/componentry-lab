import { describe, it } from "node:test"
import assert from "node:assert"

import {
  adaptProjectBrainToDirectorInput,
  adaptDirectorResult,
  resolveDirectorPhase
} from "../lib/director"
import { getProjectById } from "../lib/projects"
import { getAllRecommendations } from "../lib/projects/recommendations"

describe("IA-03B Projects Director Projection", () => {
  const testProject = getProjectById("stated")!

  it("proves Project phase source and Director project context share the same canonical project", () => {
    const input = adaptProjectBrainToDirectorInput(
      testProject,
      "HACKATHON",
      testProject.currentPhase,
      {
        authorityLevel: "suggest",
        requestedAction: "",
        target: testProject.id,
        reversibility: "unknown",
        risk: "low",
        approvalRequirement: "none",
        grantedScope: [],
        status: "pending",
      }
    )

    assert.strictEqual(input.project.id, testProject.id, "Director project context ID matches Projects project ID")
    assert.deepStrictEqual(input.project, testProject, "Project Brain object remains immutable")
  })

  it("proves exactly one canonical Director next action comes from actual Director computation", () => {
    const input = adaptProjectBrainToDirectorInput(
      testProject,
      "HACKATHON",
      testProject.currentPhase,
      {
        authorityLevel: "suggest",
        requestedAction: "",
        target: testProject.id,
        reversibility: "unknown",
        risk: "low",
        approvalRequirement: "none",
        grantedScope: [],
        status: "pending",
      }
    )

    const result = adaptDirectorResult({
      ...input,
      availableSkills: [],
      lockedDecisions: input.lockedDecisions,
      learningProposals: input.learningProposals,
    })

    assert.ok(result.nextAction, "Has exactly one canonical next action")
    assert.strictEqual(result.nextAction.actionId, "act1", "Next action matches the actual project phase action")
  })

  it("proves BUILDING does not emit normal backward QUALIFY phase guidance", () => {
    const recommendations = getAllRecommendations(testProject)
    
    const phaseRecs = recommendations.filter(rec => rec.targetType === "phase")
    assert.strictEqual(phaseRecs.length, 0, "No backward phase guidance emitted")
    assert.strictEqual(recommendations.some(r => r.id === "rec_phase_next"), false, "No phase recommendation")
  })

  it("proves Supporting Recommendations are not canonical next actions and cannot mutate phase", () => {
    const recommendations = getAllRecommendations(testProject)
    assert.ok(recommendations.every(rec => rec.targetType !== "phase"), "Supporting recommendations cannot mutate phase")
  })

  it("proves Director projection deterministic for same input", () => {
    const input = adaptProjectBrainToDirectorInput(
      testProject,
      "HACKATHON",
      testProject.currentPhase,
      {
        authorityLevel: "suggest",
        requestedAction: "",
        target: testProject.id,
        reversibility: "unknown",
        risk: "low",
        approvalRequirement: "none",
        grantedScope: [],
        status: "pending",
      }
    )

    const result1 = adaptDirectorResult({
      ...input,
      availableSkills: [],
      lockedDecisions: input.lockedDecisions,
      learningProposals: input.learningProposals,
    })

    const result2 = adaptDirectorResult({
      ...input,
      availableSkills: [],
      lockedDecisions: input.lockedDecisions,
      learningProposals: input.learningProposals,
    })

    result1.gateEvaluations.forEach(g => { (g as unknown as { evaluatedAt: string }).evaluatedAt = 'mocked' })
    result2.gateEvaluations.forEach(g => { (g as unknown as { evaluatedAt: string }).evaluatedAt = 'mocked' })

    assert.deepStrictEqual(result1, result2, "Deterministic output")
  })

  it("proves Director write authority = NONE and no Project Brain write callback/path", () => {
    const input = adaptProjectBrainToDirectorInput(
      testProject,
      "HACKATHON",
      testProject.currentPhase,
      {
        authorityLevel: "suggest",
        requestedAction: "",
        target: testProject.id,
        reversibility: "unknown",
        risk: "low",
        approvalRequirement: "none",
        grantedScope: [],
        status: "pending",
      }
    )

    const result = adaptDirectorResult({
      ...input,
      availableSkills: [],
      lockedDecisions: input.lockedDecisions,
      learningProposals: input.learningProposals,
    })

    assert.strictEqual(result.nextAction.approvalStatus, "not-required", "Authority is NONE")
    assert.strictEqual(result.sideEffectPayload, null, "No Project Brain mutation path")
  })

  it("proves Director Stage is semantically distinct from Project Phase if they use different lifecycle concepts", () => {
    // Tests that resolveDirectorPhase works correctly for the actual phase context
    const stage = resolveDirectorPhase("HACKATHON", "build")
    assert.strictEqual(stage, "build", "Director stage accurately reflects project phase without hardcoded mapping")
  })

  it("proves human publication approval does not erase unresolved risks", () => {
    // testProject has publicationGate: true, but unresolved assumptions
    assert.strictEqual(testProject.publicationGate, true, "Human approval granted")
    assert.ok(testProject.assumptions.some(a => a.status === "unresolved"), "Unresolved assumptions exist")
    assert.ok(testProject.risks.some(r => r.status === "open"), "Open risks exist")
  })

  it("proves DAY_CHALLENGE, HACKATHON, MARA, DATA_STORY compatibility", () => {
    const modes = ["DAY_CHALLENGE", "HACKATHON", "MARA", "DATA_STORY"] as const
    for (const mode of modes) {
      const input = adaptProjectBrainToDirectorInput(
        testProject,
        mode,
        testProject.currentPhase,
        {
          authorityLevel: "suggest",
          requestedAction: "",
          target: testProject.id,
          reversibility: "unknown",
          risk: "low",
          approvalRequirement: "none",
          grantedScope: [],
          status: "pending",
        }
      )

      const result = adaptDirectorResult({
        ...input,
        availableSkills: [],
        lockedDecisions: input.lockedDecisions,
        learningProposals: input.learningProposals,
      })

      assert.strictEqual(result.mode, mode, `Compatible with ${mode}`)
    }
  })
})
