import type { AuthorityCeiling } from "../types"
import type { PrivacyStatus } from "../film-kit/types"
import type { CreativeProjectMode } from "../../director/types"

export type ProductionRouteType =
  | "NATIVE"
  | "INTERNAL_COMPONENT"
  | "LOCAL_PRODUCTION"
  | "EXTERNAL_PROVIDER"
  | "EXTERNAL_PIPELINE"
  | "ASSET_SOURCE"
  | "NO_MATCH"

export type ProductionState =
  | "PLANNED"
  | "READY"
  | "BLOCKED"
  | "IN_PRODUCTION"
  | "PRODUCED"
  | "QA_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "SUPERSEDED"

export interface ProductionRoute {
  routeId: string
  projectId: string
  planFingerprint: string | null
  requestedArtifactType: string
  productionCapability: string | null
  routeType: ProductionRouteType
  resourceId: string | null
  providerAdapterId: string | null
  authorityRequired: AuthorityCeiling
  executionMode: "NOT_EXECUTED" | "SIMULATED" | "LIVE"
  estimatedCost: string | null
  licenseState: string
  privacyClass: PrivacyStatus
  inputArtifacts: string[]
  expectedOutputArtifacts: string[]
  heroDemoContribution: "PRIMARY" | "SUPPORTING" | "NONE"
  qualityGates: string[]
  evidenceRequired: string[]
  reversibility: "LOCAL_REVERSIBLE" | "IRREVERSIBLE" | "UNKNOWN"
  status: ProductionState
}

export interface ProductionArtifact {
  artifactId: string
  artifactType: string
  projectId: string
  sourceRouteId: string | null
  sourceResourceId: string | null
  provenance: string
  localPath: string | null
  externalReference: string | null
  contentFingerprint: string
  licenseState: string
  privacyClass: PrivacyStatus
  createdBy: string
  createdFrom: string[]
  version: string
  status: ProductionState
  qualityEvidence: string[]
  executionReceiptFingerprint: string | null
}

export interface ProductionArtifactManifest {
  manifestId: string
  projectId: string
  projectMode: CreativeProjectMode
  requestedArtifacts: string[]
  artifacts: ProductionArtifact[]
  routes: ProductionRoute[]
  missingArtifacts: string[]
  nextAssemblyStep: string | null
}
