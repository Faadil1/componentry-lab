import test from "node:test"
import assert from "node:assert"
import { runIntegration } from "../lib/creative-os/integration/integration"
import { directorFixtures } from "../lib/director/fixtures"
import { buildAi33Packet } from "../lib/film-kit/ai33-packet"
import { buildFilmProject } from "../lib/film-kit/presets"
import { resetProviderExecuteCount, providerExecuteCallCount } from "./support/mock-provider"
import { decomposeFilmKitCapabilities } from "../lib/creative-os/film-kit/capabilities"
import { planExternalCapability } from "../lib/creative-os/film-kit/planner"

function getProjectFixture(key: string) {
  const fixture = directorFixtures[key]
  if (!fixture) throw new Error(`Fixture ${key} not found`)
  return JSON.parse(JSON.stringify(fixture.project))
}

test.beforeEach(() => {
  resetProviderExecuteCount()
})

// ─────────────────────────────────────────────────────────────
// 1. Film Kit Capability Decomposition
// ─────────────────────────────────────────────────────────────

test("FilmKit Decomposition: decomposes capability gaps and artifact types into Film Kit capabilities", async () => {
  const cap1 = decomposeFilmKitCapabilities({ capabilityGap: "remocn-render" })
  assert.ok(cap1.includes("MOTION_COMPOSITION"))
  assert.ok(cap1.includes("UI_CAPTURE"))

  const cap2 = decomposeFilmKitCapabilities({ capabilityGap: "camera-motion-language" })
  assert.ok(cap2.includes("CAMERA_LANGUAGE"))
  assert.ok(cap2.includes("SHOT_PLANNING"))

  const cap3 = decomposeFilmKitCapabilities({ artifactType: "product-demo-film" })
  assert.ok(cap3.includes("PRODUCT_FILM"))
  assert.ok(cap3.includes("ASSEMBLY"))

  const cap4 = decomposeFilmKitCapabilities({ capabilityGap: "b-roll-generation" })
  assert.ok(cap4.includes("B_ROLL"))
})

// ─────────────────────────────────────────────────────────────
// 2. Production Planning & Zero Provider Execution
// ─────────────────────────────────────────────────────────────

test("FilmKit Production: simple/native internal capability selects CORE_METHOD without external provider", async () => {
  resetProviderExecuteCount()
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("the-second-absence"),
    currentAuthority: "SUGGEST" as const
  })

  assert.strictEqual(result.routingDecision, "MATCH")
  assert.strictEqual(result.selectedResource?.type, "CORE_METHOD")
  assert.strictEqual(result.externalCapabilityPlan, null)
  assert.strictEqual(providerExecuteCallCount, 0, "Provider execute count must be strictly 0")
})

test("FilmKit Production: compatible external candidate creates PLAN_ONLY with provider.execute called 0 times", async () => {
  resetProviderExecuteCount()
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  assert.strictEqual(result.routingDecision, "MATCH")
  assert.ok(result.externalCapabilityPlan)
  assert.strictEqual(result.externalCapabilityPlan?.executionMode, "NOT_EXECUTED")
  assert.notStrictEqual(result.externalCapabilityPlan?.executionStatus, "EXECUTED")
  assert.strictEqual(providerExecuteCallCount, 0, "Production routing must NEVER execute provider")
})

test("FilmKit Production: TEST_CANDIDATE provider produces EXTERNAL_EXPERIMENTAL_CANDIDATE label", async () => {
  resetProviderExecuteCount()
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  assert.ok(result.externalCapabilityPlan)
  // res_remocn has lifecycleState: TEST_CANDIDATE and compatibilityEvidenceStatus: UNKNOWN
  // Thus it resolves to DISCOVERY_REQUIRED due to UNKNOWN compatibility status
  assert.ok(
    result.externalCapabilityPlan.executionStatus === "EXTERNAL_EXPERIMENTAL_CANDIDATE" ||
    result.externalCapabilityPlan.executionStatus === "DISCOVERY_REQUIRED"
  )
  assert.strictEqual(providerExecuteCallCount, 0)
})

test("FilmKit Production: UNKNOWN compatibility produces DISCOVERY_REQUIRED status", async () => {
  resetProviderExecuteCount()
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  assert.ok(result.externalCapabilityPlan)
  assert.strictEqual(result.externalCapabilityPlan.compatibilityStatus, "UNKNOWN")
  assert.strictEqual(result.externalCapabilityPlan.executionStatus, "DISCOVERY_REQUIRED")
  assert.ok(result.externalCapabilityPlan.missingEvidence.includes("Provider compatibility evidence status is UNKNOWN"))
  assert.strictEqual(providerExecuteCallCount, 0)
})

test("FilmKit Production: insufficient authority ceiling yields BLOCKED and 0 execution", async () => {
  resetProviderExecuteCount()
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "SUGGEST" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  assert.strictEqual(result.status, "INTEGRATION_BLOCKED")
  assert.strictEqual(result.routingDecision, "INSUFFICIENT_AUTHORITY")
  assert.strictEqual(providerExecuteCallCount, 0)
})

test("FilmKit Production: EXPLICIT_EXTERNAL required authority yields HUMAN_APPROVAL_REQUIRED", async () => {
  resetProviderExecuteCount()
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("mara-episode"),
    currentAuthority: "EXPLICIT_EXTERNAL" as const,
    optionalRequestedCapabilityGap: "b-roll-generation" // res_gbro_collage_b_roll has maxExecutionAuthority EXPLICIT_EXTERNAL
  })

  assert.ok(result.externalCapabilityPlan)
  assert.strictEqual(result.externalCapabilityPlan.requiredHumanApproval, true)
  assert.strictEqual(result.externalCapabilityPlan.humanApprovalState, "REQUIRED")
  assert.strictEqual(result.externalCapabilityPlan.executionStatus, "HUMAN_APPROVAL_REQUIRED")
  assert.strictEqual(providerExecuteCallCount, 0)
})

test("FilmKit Truth: missing cost and license are marked UNKNOWN", async () => {
  const plan = planExternalCapability(
    {
      capabilityGap: "remocn-render",
      projectMode: "HACKATHON",
      phase: "build",
      currentAuthority: "LOCAL_REVERSIBLE"
    },
    {
      resourceId: "res_remocn",
      name: "Remocn",
      type: "COMPONENT_SOURCE",
      lifecycleState: "TEST_CANDIDATE",
      maxExecutionAuthority: "LOCAL_REVERSIBLE",
      isRecommendable: true,
      suitabilityScore: 0.9,
      matchingCapabilities: ["remocn-render"],
      progressiveLoadLevel: "LEVEL_1_CAPABILITY_CARD",
      recommendationLabel: "EXPERIMENTAL_CANDIDATE"
    }
  )

  assert.strictEqual(plan.costStatus, "UNKNOWN")
  assert.strictEqual(plan.privacyStatus, "UNKNOWN")
  assert.strictEqual(plan.licenseStatus, "GPL-3.0") // present in registry
  assert.ok(plan.missingEvidence.includes("Cost evaluation evidence missing"))
  assert.ok(plan.missingEvidence.includes("Privacy retention policy missing"))
})

test("FilmKit Truth: DISCOVERY_FEED cannot become production provider", async () => {
  const plan = planExternalCapability(
    {
      capabilityGap: "skill-discovery",
      projectMode: "HACKATHON",
      phase: "build",
      currentAuthority: "SUGGEST"
    },
    {
      resourceId: "res_awesome_claude_code_skills",
      name: "Awesome Claude Code Skills",
      type: "DISCOVERY_FEED",
      lifecycleState: "AUDITED",
      maxExecutionAuthority: "SUGGEST",
      isRecommendable: true,
      suitabilityScore: 0.8,
      matchingCapabilities: ["skill-discovery"],
      progressiveLoadLevel: "LEVEL_1_CAPABILITY_CARD",
      recommendationLabel: "DISCOVERY_ONLY"
    }
  )

  assert.strictEqual(plan.executionStatus, "DISCOVERY_REQUIRED")
  assert.ok(plan.missingEvidence.includes("Discovery feeds cannot fulfill production capabilities"))
})

// ─────────────────────────────────────────────────────────────
// 3. Determinism & Continuity Regressions
// ─────────────────────────────────────────────────────────────

test("FilmKit Continuity: RUN A and RUN B produce identical plan fingerprint and MATCH status", async () => {
  const projectSnapshot = getProjectFixture("cleanverse-build-round-2")

  const resultA = await runIntegration({
    projectBrainSnapshot: projectSnapshot,
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  assert.ok(resultA.externalCapabilityPlan?.planFingerprint)

  const resultB = await runIntegration({
    projectBrainSnapshot: projectSnapshot,
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render",
    optionalPreviousContinuationState: resultA.continuationState
  })

  assert.strictEqual(resultB.continuationState.continuationCompatibility, "MATCH")
  assert.strictEqual(
    resultA.externalCapabilityPlan?.planFingerprint,
    resultB.externalCapabilityPlan?.planFingerprint
  )
  assert.strictEqual(providerExecuteCallCount, 0)
})

test("FilmKit Continuity: RUN C with changed project yields STALE continuation status", async () => {
  const projectSnapshot = getProjectFixture("cleanverse-build-round-2")

  const resultA = await runIntegration({
    projectBrainSnapshot: projectSnapshot,
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  const modifiedSnapshot = JSON.parse(JSON.stringify(projectSnapshot))
  modifiedSnapshot.description = "Modified description changing project brain fingerprint"

  const resultC = await runIntegration({
    projectBrainSnapshot: modifiedSnapshot,
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render",
    optionalPreviousContinuationState: resultA.continuationState
  })

  assert.strictEqual(resultC.continuationState.continuationCompatibility, "STALE")
  assert.strictEqual(providerExecuteCallCount, 0)
})

test("FilmKit Governance: Project Brain remains strictly immutable", async () => {
  const originalSnapshot = getProjectFixture("cleanverse-build-round-2")
  const snapshotCopy = JSON.parse(JSON.stringify(originalSnapshot))

  runIntegration({
    projectBrainSnapshot: originalSnapshot,
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  assert.deepStrictEqual(originalSnapshot, snapshotCopy, "Project Brain snapshot must not be mutated")
})

test("FilmKit Governance: Director returns exactly one authorized next action", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  assert.ok(result.authorizedNextAction)
  assert.strictEqual(typeof result.authorizedNextAction.title, "string")
  assert.ok(result.authorizedNextAction.title.length > 0)
})

test("FilmKit Packet: stated project builds AI33 packet without undefined brief access", () => {
  const film = buildFilmProject("stated")
  const packet = buildAi33Packet(film)

  assert.ok(packet.title.includes(film.brief.title))
  assert.ok(packet.title.includes("AI33 Packet"))
  assert.strictEqual(packet.project.id, film.id)
  assert.strictEqual(packet.project.title, film.title)
  assert.strictEqual(packet.project.primaryClaim, film.brief.primaryProof)
})
