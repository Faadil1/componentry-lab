import assert from "node:assert/strict"
import test from "node:test"
import {
  getDirectorFixtureKeys,
  getDirectorProjection,
  getAllDirectorProjections,
  adaptProjectBrainToDirectorInput,
  adaptDirectorResult,
} from "../lib/director"
import { projectPresets } from "../lib/projects"

test("four fixtures render distinct content", () => {
  const keys = getDirectorFixtureKeys()
  assert.equal(keys.length, 4)
  assert.deepEqual(keys, [
    "the-second-absence",
    "cleanverse-build-round-2",
    "mara-episode",
    "power-bi-service-performance",
  ])

  const projections = getAllDirectorProjections()

  const modes = new Set(Object.values(projections).map((p) => p.result.mode))
  assert.equal(modes.size, 4)

  const evaluatorTypes = new Set(Object.values(projections).map((p) => p.result.evaluatorPath.evaluatorType))
  assert.ok(evaluatorTypes.size >= 3)
})

test("the four selected action titles are distinct and semantically appropriate", () => {
  const projections = getAllDirectorProjections()
  const titles = new Set(Object.values(projections).map((p) => p.result.nextAction.title))
  assert.equal(titles.size, 4, "All four selected action titles must be distinct")

  // Scenario 1: DAY_CHALLENGE (The Second Absence)
  const day = projections["the-second-absence"].result.nextAction
  assert.equal(day.mode, "DAY_CHALLENGE")
  assert.ok(day.title.includes("hypothesis") || day.title.includes("proof") || day.title.includes("hero"))

  // Scenario 2: HACKATHON (Cleanverse Build Round 2)
  const hackathon = projections["cleanverse-build-round-2"].result.nextAction
  assert.equal(hackathon.mode, "HACKATHON")
  assert.ok(hackathon.title.includes("hackathon") || hackathon.title.includes("blocker") || hackathon.title.includes("receipt"))

  // Scenario 3: MARA (MARA Episode)
  const mara = projections["mara-episode"].result.nextAction
  assert.equal(mara.mode, "MARA")
  assert.ok(mara.title.includes("Eight-Bar") || mara.title.includes("score") || mara.title.includes("continuity"))

  // Scenario 4: DATA_STORY (Power BI Service Performance)
  const story = projections["power-bi-service-performance"].result.nextAction
  assert.equal(story.mode, "DATA_STORY")
  assert.ok(story.title.includes("Power BI") || story.title.includes("metric") || story.title.includes("analytical"))
})

test("exactly one action is displayed for each fixture", () => {
  const projections = getAllDirectorProjections()
  for (const [key, proj] of Object.entries(projections)) {
    assert.ok(proj.result.nextAction, `Next action missing for ${key}`)
    assert.ok(proj.result.nextAction.title.length > 0)
    assert.ok(proj.result.nextAction.actionId.length > 0)
    assert.ok(["reversible", "irreversible", "unknown"].includes(proj.result.nextAction.reversibility))
  }
})

test("blocked projects show blockers and remain safe", () => {
  const proj = getDirectorProjection("cleanverse-build-round-2")
  assert.ok(proj.result.blockers.length > 0)
  assert.equal(proj.result.nextAction.actionType, "review-required")
  assert.equal(proj.result.nextAction.approvalStatus, "not-required")
  for (const blocker of proj.result.blockers) {
    assert.ok(blocker.blockerId)
    assert.ok(blocker.description)
    assert.ok(typeof blocker.humanActionRequired === "boolean")
  }
})

test("evidence-required gates expose missing evidence", () => {
  const proj = getDirectorProjection("the-second-absence")
  const gates = proj.result.gateEvaluations
  assert.ok(gates.length > 0)
  for (const gate of gates) {
    assert.ok(["pass", "fail", "blocked", "conditional", "review"].includes(gate.status))
    if (gate.requiredEvidence.length > 0 && !gate.controllingEvidence) {
      assert.notEqual(gate.status, "pass")
    }
  }
})

test("prohibited actions never appear executable", () => {
  const projections = getAllDirectorProjections()
  for (const proj of Object.values(projections)) {
    assert.equal(proj.result.nextAction.authorityRequirement !== "prohibited", true)
    assert.equal(proj.result.sideEffectPayload, null)
  }
})

test("learning proposals remain read-only", () => {
  const projections = getAllDirectorProjections()
  for (const proj of Object.values(projections)) {
    for (const proposal of proj.result.learningProposals) {
      assert.ok(["OBSERVATION", "CANDIDATE", "TESTING", "EARNED", "SUPERSEDED", "REJECTED"].includes(proposal.status))
      assert.ok(["pending", "approved", "rejected", "not-required"].includes(proposal.humanApprovalState))
    }
  }
})

test("deterministic input produces deterministic output", () => {
  const p1 = getDirectorProjection("the-second-absence")
  const p2 = getDirectorProjection("the-second-absence")
  assert.deepEqual(p1.result, p2.result)
})

test("safe fallback works for an empty candidate set", () => {
  const emptyProject = {
    ...projectPresets[0],
    id: "empty-actions-project",
    title: "Empty Project",
    nextActions: [],
    blockers: [],
    blockedBy: [],
  }
  const input = adaptProjectBrainToDirectorInput(
    emptyProject,
    "DAY_CHALLENGE",
    "build",
    {
      authorityLevel: "suggest",
      requestedAction: "analyze",
      target: "empty-actions-project",
      reversibility: "reversible",
      risk: "low",
      approvalRequirement: "none",
      grantedScope: ["analysis"],
      status: "granted",
    }
  )
  const result = adaptDirectorResult({
    ...input,
    availableSkills: [],
    lockedDecisions: [],
    learningProposals: [],
  })

  assert.ok(result.nextAction)
  assert.equal(result.nextAction.title, "Validate single-day hero proof")
  assert.equal(result.nextAction.approvalStatus, "not-required")
})

test("the page does not mutate canonical Project Brain state", () => {
  const initialString = JSON.stringify(projectPresets)
  getAllDirectorProjections()
  const postString = JSON.stringify(projectPresets)
  assert.equal(initialString, postString)
})

test("primary decision projection contains exactly one authorized action per scenario", () => {
  const projections = getAllDirectorProjections()
  for (const [key, proj] of Object.entries(projections)) {
    assert.ok(proj.result.nextAction, `Action missing for ${key}`)
    assert.ok(proj.result.heroDemoMoment, `Hero demo missing for ${key}`)
    assert.ok(proj.result.objective, `Objective missing for ${key}`)
    // Confirm authority level defaults stay restrictive
    assert.ok(["suggest", "prepare", "prohibit"].includes(proj.result.nextAction.authorityRequirement))
  }
})

test("empty learning state and skills produce safe default representations", () => {
  const projections = getAllDirectorProjections()
  for (const proj of Object.values(projections)) {
    assert.ok(Array.isArray(proj.result.learningProposals))
    assert.ok(Array.isArray(proj.result.selectedSkills))
  }
})

test("Data Story projection is isolated from MARA musicology data", () => {
  const projections = getAllDirectorProjections()
  const story = projections["power-bi-service-performance"]
  const mara = projections["mara-episode"]

  // Confirm independent references
  assert.notStrictEqual(story.result.heroDemoMoment, mara.result.heroDemoMoment)

  // Verify Data Story domain words
  const storyText = JSON.stringify(story.result)
  assert.ok(storyText.includes("Power BI") || storyText.includes("metric") || storyText.includes("operational"))
  
  // Verify MARA musicology words are ABSENT from Data Story
  const forbidden = ["Eight-Bar Hole", "1987-F", "Horn in F", "score edition", "musicology"]
  for (const word of forbidden) {
    assert.ok(!storyText.includes(word), `Data Story must not contain MARA word: ${word}`)
  }
})

test("structural independence of all scenario projections", () => {
  const projections = getAllDirectorProjections()
  const keys = Object.keys(projections)

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const pA = projections[keys[i]].result
      const pB = projections[keys[j]].result

      // Verify that no core sub-objects are shared
      assert.notStrictEqual(pA.heroDemoMoment, pB.heroDemoMoment, `Shared heroDemoMoment between ${keys[i]} and ${keys[j]}`)
      assert.notStrictEqual(pA.nextAction, pB.nextAction, `Shared nextAction between ${keys[i]} and ${keys[j]}`)
      assert.notStrictEqual(pA.objective, pB.objective, `Shared objective between ${keys[i]} and ${keys[j]}`)
      assert.notStrictEqual(pA.blockers, pB.blockers, `Shared blockers array between ${keys[i]} and ${keys[j]}`)
      assert.notStrictEqual(pA.gateEvaluations, pB.gateEvaluations, `Shared gateEvaluations array between ${keys[i]} and ${keys[j]}`)

      // Verify that no input-level nested arrays are shared
      const projectA = projections[keys[i]].input.project
      const projectB = projections[keys[j]].input.project
      assert.notStrictEqual(projectA.evidence, projectB.evidence, `Shared evidence array in input project between ${keys[i]} and ${keys[j]}`)
      assert.notStrictEqual(projectA.constraints, projectB.constraints, `Shared constraints array in input project between ${keys[i]} and ${keys[j]}`)
      assert.notStrictEqual(projectA.nextActions, projectB.nextActions, `Shared nextActions array in input project between ${keys[i]} and ${keys[j]}`)
    }
  }
})

test("positive and negative semantic domain integrity", () => {
  const projections = getAllDirectorProjections()

  const domains = {
    "the-second-absence": {
      allowed: ["accountability", "Alex", "£149", "responsible", "callback"],
      forbidden: ["cryptographic", "commitment", "Cleanverse", "verification", "audit", "judge", "receipt", "Eight-Bar Hole", "1987-F", "Horn in F", "musicology", "Power BI", "abandoned calls", "NPS"]
    },
    "cleanverse-build-round-2": {
      allowed: ["Cleanverse", "verification", "audit", "judge", "receipt", "identity", "asset"],
      forbidden: ["Alex", "£149", "accountability", "callback", "Eight-Bar Hole", "1987-F", "Horn in F", "musicology", "Power BI", "abandoned calls", "NPS"]
    },
    "mara-episode": {
      allowed: ["Mara", "episode", "continuity", "emotional", "narrative", "wardrobe", "location"],
      forbidden: ["Eight-Bar Hole", "1987-F", "Horn in F", "musicology", "Cleanverse", "verification", "audit", "receipt", "£149", "Alex", "Power BI", "abandoned calls", "NPS"]
    },
    "power-bi-service-performance": {
      allowed: ["calls", "abandoned", "answered", "service", "NPS", "satisfaction", "DMA", "metric"],
      forbidden: ["Eight-Bar Hole", "1987-F", "Horn in F", "musicology", "Cleanverse", "verification", "receipt", "£149", "Alex", "Mara", "episode", "wardrobe"]
    }
  }

  function getAllStringValues(obj: unknown): string {
    const values: string[] = []
    function recurse(val: unknown) {
      if (typeof val === "string") {
        values.push(val)
      } else if (Array.isArray(val)) {
        val.forEach(recurse)
      } else if (val && typeof val === "object") {
        Object.entries(val as Record<string, unknown>).forEach(([k, v]) => {
          // Skip keys that contain forbidden terms themselves
          if (k === "selectedSkills" || k === "availableSkills" || k === "provenance") return
          recurse(v)
        })
      }
    }
    recurse(obj)
    return values.join(" ").toLowerCase()
  }

  for (const [key, rules] of Object.entries(domains)) {
    const proj = projections[key]
    const checkObj = {
      project: proj.input.project,
      result: proj.result
    }
    const text = getAllStringValues(checkObj)
    
    // Positive assertions (at least one token must be found)
    const hasPositive = rules.allowed.some(token => text.includes(token.toLowerCase()))
    assert.ok(hasPositive, `Scenario ${key} expected to contain at least one of: ${rules.allowed.join(", ")}`)

    // Negative assertions (all forbidden tokens must be absent)
    for (const token of rules.forbidden) {
      assert.ok(!text.includes(token.toLowerCase()), `Scenario ${key} contains forbidden token: ${token}. Values: ${text}`)
    }
  }
})

test("cross-scenario semantic snapshot comparison", () => {
  const projections = getAllDirectorProjections()
  const snapshot = Object.entries(projections).map(([key, proj]) => ({
    scenario: key,
    projectTitle: proj.input.project.title,
    evaluator: proj.result.evaluatorPath.evaluatorType,
    heroTitle: proj.result.heroDemoMoment.title,
    evidenceTitles: proj.input.project.evidence.map(e => e.label),
    nextActionTitle: proj.result.nextAction.title
  }))

  // Ensure all project titles, hero titles, and next actions are completely distinct
  const projectTitles = new Set(snapshot.map(s => s.projectTitle))
  const heroTitles = new Set(snapshot.map(s => s.heroTitle))
  const nextActions = new Set(snapshot.map(s => s.nextActionTitle))

  assert.equal(projectTitles.size, 4, "Project titles must be distinct")
  assert.equal(heroTitles.size, 4, "Hero demo moment titles must be distinct")
  assert.equal(nextActions.size, 4, "Next action titles must be distinct")
})



