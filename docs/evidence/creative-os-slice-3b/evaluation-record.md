# Creative Method Evaluation Record Specification

Slice 3B defines a structured evaluation record contract to log method execution history, deterministic fingerprints, and quality results.

## Interface Contract
The contract is defined in [`lib/creative-os/methods/types.ts`](file:///C:/Users/fboussari/componentry-lab-director/lib/creative-os/methods/types.ts):

```typescript
export interface CreativeMethodEvaluationRecord {
  methodId: string
  projectId: string
  capabilityGap: string
  inputFingerprint: string
  outputFingerprint: string
  qualityResults: CreativeMethodQualityResult[]
  humanReviewStatus: "PENDING" | "APPROVED" | "REJECTED"
  notes?: string
}
```

## Immutable Audit Trail Policies
1. **Human Status Only**: The `humanReviewStatus` cannot be automated or promoted to `APPROVED` or `VALIDATED` by any unit test or background runner. The default state is always `PENDING` until explicit human sign-off is logged.
2. **Fingerprint Linkage**: The `inputFingerprint` and `outputFingerprint` form a cryptographic-equivalent link, ensuring that any modifications to the method logic or raw output parameters instantly invalidate previous human approvals.
