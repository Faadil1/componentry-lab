import { createArtifactManifest, createProductionArtifact } from "../creative-os/production/artifacts"
import { resolveProductionRoute } from "../creative-os/production/router"
import type { ProductionArtifact, ProductionArtifactManifest, ProductionRoute, ProductionState } from "../creative-os/production/types"
import type { ExternalCapabilityPlan } from "../creative-os/film-kit/types"
import type { FilmProject, FilmAsset } from "./types"

function createMockPlan(projectId: string, artifactType: string): ExternalCapabilityPlan {
  return {
    projectId,
    planFingerprint: `plan_${artifactType}_${Date.now()}`,
    capabilityId: `CAPABILITY_${artifactType.toUpperCase()}`,
    resourceId: null,
    decomposedCapabilities: [],
    requestedArtifact: artifactType,
    compatibilityStatus: "UNKNOWN",
    compatibilityEvidence: null,
    lifecycleState: "TEST_CANDIDATE",
    currentAuthority: "LOCAL_REVERSIBLE",
    requiredAuthority: "READ_ONLY",
    requiredHumanApproval: false,
    humanApprovalState: "NOT_REQUIRED",
    costStatus: "FREE",
    estimatedCost: "0.00",
    privacyStatus: "LOCAL_ONLY",
    licenseStatus: "PROPRIETARY",
    requiredInputs: [],
    expectedOutputs: [artifactType],
    executionMode: "NOT_EXECUTED",
    executionStatus: "NOT_EXECUTED",
    blockers: [],
    missingEvidence: []
  }
}

export function buildFilmProductionManifest(film: FilmProject): ProductionArtifactManifest {
  const routes: ProductionRoute[] = []
  const artifacts: ProductionArtifact[] = []
  const requestedArtifacts: string[] = []

  // 1. Process Film Assets -> Artifacts
  film.assets.forEach((asset: FilmAsset) => {
    // Determine route based on asset type or provenance
    const plan = createMockPlan(film.id, asset.kind)
    let route = resolveProductionRoute(plan, film.id, true) // Force NATIVE for local assets to start
    
    // Check if the asset is tied to an external provider in Film Kit (like ai33)
    if (asset.providerTaskId && asset.providerTaskId !== "none") {
      plan.resourceId = `res_${asset.model || "external"}`
      plan.executionMode = "SIMULATED"
      route = resolveProductionRoute(plan, film.id, false)
    }

    if (!routes.find(r => r.routeId === route.routeId)) {
        routes.push(route)
    }

    if (!requestedArtifacts.includes(asset.kind)) {
      requestedArtifacts.push(asset.kind)
    }

    let status: ProductionState = "PRODUCED"
    if (asset.approvalState === "pending") status = "QA_REQUIRED"
    if (asset.approvalState === "approved") status = "APPROVED"
    if (asset.approvalState === "rejected") status = "REJECTED"
    if (asset.status === "needs-review") status = "QA_REQUIRED"
    if (asset.status === "blocked") status = "BLOCKED"
    if (asset.status === "unknown") status = "PLANNED"
    
    const isPlanned = status === "PLANNED" || status === "BLOCKED" || !asset.filePath

    const artifact = createProductionArtifact(
      film.id,
      asset.kind,
      route,
      asset.source,
      [asset.prompt].filter(Boolean),
      { id: asset.id },
      asset.providerTaskId && asset.providerTaskId !== "none" ? `receipt_${asset.providerTaskId}` : null,
      status
    )
    
    // Override localPath based on actual file existence intent in Film Kit
    if (isPlanned) {
        artifact.localPath = null
        artifact.contentFingerprint = "PENDING_RENDER"
    } else {
        artifact.localPath = asset.filePath || null
    }

    artifact.qualityEvidence = asset.provenanceNotes ? [asset.provenanceNotes] : []

    artifacts.push(artifact)
  })

  // 2. Process Capture Queue -> Planned Routes/Artifacts
  film.captureQueue.forEach(item => {
    const artifactType = "screen-capture"
    if (!requestedArtifacts.includes(artifactType)) {
      requestedArtifacts.push(artifactType)
    }
    
    const plan = createMockPlan(film.id, artifactType)
    const route = resolveProductionRoute(plan, film.id, true)
    
    if (!routes.find(r => r.routeId === route.routeId)) {
        routes.push(route)
    }
    
    // If it's pending in capture queue, it's missing
    if (item.status === "pending" || item.status === "ready") {
        const artifact = createProductionArtifact(
            film.id,
            artifactType,
            route,
            "FilmKit_CaptureQueue",
            [item.shotId],
            { id: item.id },
            null,
            "PLANNED"
        )
        artifact.localPath = null
        artifact.contentFingerprint = "PENDING_RENDER"
        artifacts.push(artifact)
    }
  })

  // 3. Narrative -> Subtitles/Voiceovers (planned)
  if (film.brief.format) {
    if (!requestedArtifacts.includes("product-demo-film")) {
        requestedArtifacts.push("product-demo-film")
        const plan = createMockPlan(film.id, "product-demo-film")
        const route = resolveProductionRoute(plan, film.id, true)
        routes.push(route)
        
        const artifact = createProductionArtifact(
            film.id,
            "product-demo-film",
            route,
            "FilmKit_Assembly",
            [],
            { assemble: true },
            null,
            "PLANNED"
        )
        artifact.localPath = null
        artifact.contentFingerprint = "PENDING_RENDER"
        artifacts.push(artifact)
    }
  }

  // 4. Incorporate Video Shotcraft Canonical Fixture IF applicable
  // User says: Only if canonical source resolves it. We don't have canonical source, so we won't inject fake.

  // Use director mode conceptually for manifest
  const mode = "HACKATHON"

  const manifest = createArtifactManifest(
    film.id,
    mode,
    requestedArtifacts,
    artifacts,
    routes
  )
  
  // Enforce nextAssemblyStep is not confused with Director action.
  if (manifest.missingArtifacts.length > 0) {
      manifest.nextAssemblyStep = "PRODUCE_MISSING"
  } else if (manifest.artifacts.some(a => a.status === "QA_REQUIRED")) {
      manifest.nextAssemblyStep = "PERFORM_QA"
  } else {
      manifest.nextAssemblyStep = "ASSEMBLY_READY"
  }

  return manifest
}
