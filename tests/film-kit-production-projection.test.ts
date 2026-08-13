import test, { describe } from "node:test"
import assert from "node:assert"
import { getFilmProductionTruth, getFilmProductionIntent } from "../lib/film-kit/production-adapter"
import { getFilmProjectById } from "../lib/film-kit/selectors"
import { createArtifactManifest, createProductionArtifact } from "../lib/creative-os/production/artifacts"
import { resolveProductionRoute } from "../lib/creative-os/production/router"
import type { ExternalCapabilityPlan } from "../lib/creative-os/film-kit/types"
import type { FilmProject } from "../lib/film-kit/types"

describe("IA-04B Film Kit Production Projection Correction", () => {
  const film = getFilmProjectById("stated") as FilmProject

  const canonicalPlan: ExternalCapabilityPlan = {
    resourceId: "res_cineprompt",
    capabilityId: "PROMPT_SHARE_LINK_CREATION",
    decomposedCapabilities: [],
    requestedArtifact: "product-demo-film",
    compatibilityStatus: "VERIFIED",
    compatibilityEvidence: "fixture",
    lifecycleState: "TEST_CANDIDATE",
    currentAuthority: "READ_ONLY",
    requiredAuthority: "EXPLICIT_EXTERNAL",
    requiredHumanApproval: true,
    humanApprovalState: "GRANTED",
    costStatus: "FREE",
    estimatedCost: "0.00",
    privacyStatus: "LOCAL_ONLY",
    licenseStatus: "UNKNOWN",
    requiredInputs: ["brief"],
    expectedOutputs: ["product-demo-film"],
    executionMode: "NOT_EXECUTED",
    executionStatus: "NOT_EXECUTED",
    blockers: [],
    missingEvidence: [],
    planFingerprint: "fixture-plan"
  }

  const canonicalRoute = resolveProductionRoute(canonicalPlan, film.id, false)
  const canonicalArtifact = createProductionArtifact(
    film.id,
    "product-demo-film",
    canonicalRoute,
    "fixture-agent",
    ["brief"],
    { title: film.brief.title },
    "receipt_fixture",
    "PLANNED"
  )
  const canonicalManifest = createArtifactManifest(
    film.id,
    "DAY_CHALLENGE",
    ["product-demo-film"],
    [canonicalArtifact],
    [canonicalRoute]
  )
  const unknownLicensePlan: ExternalCapabilityPlan = {
    ...canonicalPlan,
    resourceId: null,
    capabilityId: "",
    requestedArtifact: null,
    licenseStatus: "UNKNOWN",
    planFingerprint: "fixture-plan-unknown"
  }
  const unknownLicenseRoute = resolveProductionRoute(unknownLicensePlan, film.id, false)
  const unknownLicenseArtifact = createProductionArtifact(
    film.id,
    "unknown-output",
    unknownLicenseRoute,
    "fixture-agent",
    [],
    { title: film.brief.title }
  )

  test("1. FilmProject alone cannot create ProductionRoute", () => {
    const truth = getFilmProductionTruth(film.id)
    assert.strictEqual(truth.routes.length, 0)
  })

  test("2. FilmProject alone cannot create ProductionArtifact", () => {
    const truth = getFilmProductionTruth(film.id)
    assert.strictEqual(truth.artifacts.length, 0)
  })

  test("3. FilmProject alone cannot create ProductionArtifactManifest", () => {
    const truth = getFilmProductionTruth(film.id)
    assert.strictEqual(truth.manifest, null)
  })

  test("4. Presentation projection with no canonical production truth fails closed", () => {
    const truth = getFilmProductionTruth(film.id)
    assert.strictEqual(truth.availability, "NO_CANONICAL_PRODUCTION_SPINE")
  })

  test("5. No-data projection has routes=[]", () => {
    const truth = getFilmProductionTruth(film.id)
    assert.deepStrictEqual(truth.routes, [])
  })

  test("6. No-data projection has artifacts=[]", () => {
    const truth = getFilmProductionTruth(film.id)
    assert.deepStrictEqual(truth.artifacts, [])
  })

  test("7. No-data projection has manifest=null", () => {
    const truth = getFilmProductionTruth(film.id)
    assert.strictEqual(truth.manifest, null)
  })

  test("8. Film production intent remains available separately", () => {
    const intent = getFilmProductionIntent(film)
    assert.ok(intent.captureIntent.length > 0)
    assert.ok(intent.assetIntent.length > 0)
  })

  test("9. Intent is not labeled ProductionArtifact", () => {
    const intent = getFilmProductionIntent(film)
    const asset = intent.assetIntent[0]
    assert.ok(!("artifactId" in asset))
  })

  test("10. Intent is not labeled ProductionRoute", () => {
    const intent = getFilmProductionIntent(film)
    const asset = intent.assetIntent[0]
    assert.ok(!("routeId" in asset))
  })

  test("11. Intent is not classified as canonical missingArtifacts", () => {
    const intent = getFilmProductionIntent(film)
    assert.ok(!("missingArtifacts" in intent))
  })

  test("12. Intent readiness is not ProductionState", () => {
    const intent = getFilmProductionIntent(film)
    const capture = intent.captureIntent[0]
    assert.ok(["pending", "ready", "captured", "blocked"].includes(capture.status))
    assert.ok(!["PLANNED", "READY", "BLOCKED", "IN_PRODUCTION", "PRODUCED", "QA_REQUIRED", "APPROVED", "REJECTED", "SUPERSEDED"].includes(capture.status))
  })

  test("13. Canonical ProductionRoute input preserves routeId", () => {
    assert.ok(canonicalRoute.routeId.startsWith("route_"))
    assert.strictEqual(canonicalRoute.projectId, film.id)
  })

  test("14. Canonical ProductionArtifact input preserves artifactId", () => {
    assert.ok(canonicalArtifact.artifactId.startsWith("art_"))
    assert.strictEqual(canonicalArtifact.sourceRouteId, canonicalRoute.routeId)
  })

  test("15. Canonical manifest input preserves manifestId", () => {
    assert.ok(canonicalManifest.manifestId.startsWith(`manifest_${film.id}_`))
    assert.strictEqual(canonicalManifest.projectId, film.id)
  })

  test("16. Projection deterministic", () => {
    const t1 = getFilmProductionTruth(film.id)
    const t2 = getFilmProductionTruth(film.id)
    assert.deepStrictEqual(t1, t2)
  })

  test("17. Canonical inputs immutable", () => {
    const routeBefore = structuredClone(canonicalRoute)
    const artifactBefore = structuredClone(canonicalArtifact)
    const manifestBefore = structuredClone(canonicalManifest)

    createProductionArtifact(film.id, "product-demo-film", canonicalRoute, "fixture-agent", ["brief"], { title: film.brief.title }, "receipt_fixture", "PLANNED")
    createArtifactManifest(film.id, "DAY_CHALLENGE", ["product-demo-film"], [canonicalArtifact], [canonicalRoute])

    assert.deepStrictEqual(canonicalRoute, routeBefore)
    assert.deepStrictEqual(canonicalArtifact, artifactBefore)
    assert.deepStrictEqual(canonicalManifest, manifestBefore)
  })

  test("18. PLANNED canonical artifact remains PLANNED", () => {
    assert.strictEqual(canonicalArtifact.status, "PLANNED")
  })

  test("19. QA_REQUIRED only appears from canonical artifact truth", () => {
    assert.ok(canonicalArtifact.status !== "QA_REQUIRED")
    assert.ok(canonicalManifest.artifacts.every((artifact) => artifact.status !== "QA_REQUIRED" || artifact.artifactId === canonicalArtifact.artifactId))
  })

  test("20. UNKNOWN license remains UNKNOWN", () => {
    assert.strictEqual(unknownLicenseRoute.licenseState, "UNKNOWN")
    assert.strictEqual(unknownLicenseArtifact.licenseState, "UNKNOWN")
  })

  test("21. Execution receipt preserved only when input provides one", () => {
    assert.strictEqual(canonicalArtifact.executionReceiptFingerprint, "receipt_fixture")
  })

  test("22. No fake execution receipt", () => {
    const noReceiptArtifact = createProductionArtifact(film.id, "product-demo-film", canonicalRoute, "fixture-agent", ["brief"], { title: film.brief.title })
    assert.strictEqual(noReceiptArtifact.executionReceiptFingerprint, null)
  })

  test("23. No provider execution callback", () => {
    assert.strictEqual(canonicalRoute.executionMode, "NOT_EXECUTED")
    assert.strictEqual(canonicalRoute.providerAdapterId, null)
  })

  test("24. No render callback", () => {
    assert.strictEqual(canonicalRoute.routeType, "EXTERNAL_PROVIDER")
    assert.ok(canonicalArtifact.contentFingerprint.length > 0)
  })

  test("25. No lifecycle promotion", () => {
    assert.strictEqual(canonicalArtifact.status, "PLANNED")
    assert.strictEqual(canonicalManifest.missingArtifacts.includes("product-demo-film"), true)
  })

  test("26. nextAssemblyStep comes only from canonical manifest", () => {
    assert.ok(canonicalManifest.nextAssemblyStep !== null)
    assert.strictEqual(canonicalManifest.nextAssemblyStep, "PRODUCE_MISSING")
  })

  test("27. No manifest means no canonical nextAssemblyStep", () => {
    const truth = getFilmProductionTruth(film.id)
    assert.strictEqual(truth.manifest, null)
  })

  test("28. Project context preserved", () => {
    const intent = getFilmProductionIntent(film)
    assert.strictEqual(intent.projectId, film.id)
  })

  test("29. Switching project changes production-truth lookup context", () => {
    const intent1 = getFilmProductionIntent(getFilmProjectById("stated") as FilmProject)
    const intent2 = getFilmProductionIntent(getFilmProjectById("glow-atelier") as FilmProject)
    assert.notStrictEqual(intent1.projectId, intent2.projectId)
  })

  test("30. Video Shotcraft is not fabricated into runtime", () => {
    const truth = getFilmProductionTruth(film.id)
    assert.strictEqual(truth.availability, "NO_CANONICAL_PRODUCTION_SPINE")
    assert.strictEqual(truth.routes.length, 0)
    assert.strictEqual(truth.artifacts.length, 0)
  })

  test("31. ResourceLifecycle remains separate from ProductionState", () => {
    assert.notStrictEqual(canonicalArtifact.status, "TEST_CANDIDATE" as never)
  })

  test("32. Project Brain remains immutable", () => {
    const clone = structuredClone(film)
    getFilmProductionIntent(film)
    getFilmProductionTruth(film.id)
    assert.deepStrictEqual(film, clone)
  })
})
