import type { ProductionArtifact, ProductionArtifactManifest, ProductionRoute, ProductionState } from "./types"
import type { CreativeProjectMode } from "../../director/types"
import crypto from "crypto"

function hash(obj: unknown): string {
  const stableStr = JSON.stringify(obj, Object.keys(obj as object).sort())
  return crypto.createHash("sha256").update(stableStr).digest("hex").slice(0, 16)
}

export function createProductionArtifact(
  projectId: string,
  artifactType: string,
  route: ProductionRoute | null,
  createdBy: string,
  createdFrom: string[],
  contentData: unknown,
  externalReceipt: string | null = null,
  status: ProductionState = "PRODUCED"
): ProductionArtifact {
  // Fingerprint is deterministic based on content and provenance
  const contentFingerprint = hash({ contentData, projectId, routeId: route?.routeId })
  
  // No fake receipt for native/local
  const finalReceipt = (route?.routeType === "EXTERNAL_PROVIDER" || route?.routeType === "EXTERNAL_PIPELINE") ? externalReceipt : null
  
  return {
    artifactId: `art_${contentFingerprint}`,
    artifactType,
    projectId,
    sourceRouteId: route?.routeId || null,
    sourceResourceId: route?.resourceId || null,
    provenance: route ? `route:${route.routeType}` : "manual",
    localPath: null,
    externalReference: null,
    contentFingerprint,
    licenseState: route?.licenseState || "UNKNOWN",
    privacyClass: route?.privacyClass || "LOCAL_ONLY",
    createdBy,
    createdFrom,
    version: "1.0",
    status,
    qualityEvidence: [],
    executionReceiptFingerprint: finalReceipt
  }
}

export function createArtifactManifest(
  projectId: string,
  projectMode: CreativeProjectMode,
  requestedArtifacts: string[],
  existingArtifacts: ProductionArtifact[],
  routes: ProductionRoute[]
): ProductionArtifactManifest {
  
  const manifestId = `manifest_${projectId}_${Date.now()}`
  
  const missingArtifacts = requestedArtifacts.filter(req => 
    !existingArtifacts.some(art => art.artifactType === req && (art.status === "APPROVED" || art.status === "PRODUCED"))
  )
  
  return {
    manifestId,
    projectId,
    projectMode,
    requestedArtifacts,
    artifacts: existingArtifacts,
    routes,
    missingArtifacts,
    nextAssemblyStep: missingArtifacts.length > 0 ? "PRODUCE_MISSING" : "ASSEMBLY_READY"
  }
}

export function getAssemblyCandidates(manifest: ProductionArtifactManifest): ProductionArtifact[] {
  // Must be publication-safe: not REJECTED, not SUPERSEDED, not BLOCKED
  // Usually APPROVED or PRODUCED
  return manifest.artifacts.filter(art => 
    art.status === "APPROVED" || art.status === "PRODUCED"
  )
}
