export type ResourceImplementationStatus =
  | "IMPLEMENTED"
  | "PARTIAL_IMPLEMENTATION"
  | "METADATA_ONLY"
  | "DISCOVERY_ONLY"

export type ResourceExecutionBoundary =
  | "INTERNAL_METHOD"
  | "PLANNING_ONLY"
  | "EXTERNAL_ADAPTER"
  | "NONE"

export type ResourceAdapterEvidenceStatus =
  | "NOT_APPLICABLE"
  | "NOT_PRESENT"
  | "PRESENT_UNVERIFIED"
  | "VERIFIED"

export type ResourceExecutionReadiness =
  | "NOT_EXECUTABLE"
  | "PLANNING_ONLY"
  | "EXECUTION_STRUCTURALLY_AVAILABLE"

export interface ResourceExecutionEvidence {
  resourceId: string
  implementationStatus: ResourceImplementationStatus
  executionBoundary: ResourceExecutionBoundary
  adapterEvidenceStatus: ResourceAdapterEvidenceStatus
  executionReadiness: ResourceExecutionReadiness
  evidenceReferences: string[]
  notes?: string[]
}
