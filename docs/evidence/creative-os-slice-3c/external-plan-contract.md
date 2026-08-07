# Slice 3C — ExternalCapabilityPlan Contract

## Contract Structure
```typescript
export interface ExternalCapabilityPlan {
  resourceId: string | null
  capabilityId: string
  decomposedCapabilities: FilmKitCapabilityType[]
  requestedArtifact: string | null
  compatibilityStatus: "VERIFIED" | "DECLARED" | "UNKNOWN" | "INCOMPATIBLE"
  compatibilityEvidence: string | null
  lifecycleState: string | null
  currentAuthority: AuthorityCeiling
  requiredAuthority: AuthorityCeiling
  requiredHumanApproval: boolean
  humanApprovalState: HumanApprovalState
  costStatus: CostStatus
  estimatedCost: string | null
  privacyStatus: PrivacyStatus
  licenseStatus: string | null
  requiredInputs: string[]
  expectedOutputs: string[]
  executionMode: "NOT_EXECUTED"
  executionStatus: ExternalCapabilityExecutionStatus
  blockers: string[]
  missingEvidence: string[]
  planFingerprint: string
}
```
