# Architecture

## Transport Abstraction

```
CinePromptTransport (interface)
├── ProductionCinePromptTransport   — real HTTPS, NEVER invoked in 3D.2
└── FakeCinePromptTransport         — deterministic, test-only
```

## Execution Path

```
Director
  └─► integration.ts (unchanged)
        └─► sandbox.ts (minimal 3D.2 gate added)
              ├─ authority check          (EXPLICIT_EXTERNAL required for PRODUCTION)
              ├─ approval binding         (all 8 fields enforced)
              ├─ cost governance          (UNKNOWN incremental cost blocks)
              ├─ lifecycle gate           (PRODUCTION allowed only with GRANTED approval)
              ├─ intent fingerprint       (deterministic SHA-256)
              ├─ idempotency check        (receiptStore)
              └─► CinePromptShareLinkAdapter.execute()
                    ├─ SECRET_REQUIRED check (zero calls if key absent)
                    ├─ privacy check          (zero calls if blocked)
                    └─► CinePromptTransport.createShareLink()
                          └─► ExternalExecutionReceipt
```

## Sandbox Change (Minimal)
The 3D.1 `TEST_ONLY`-only gate was extended to allow `PRODUCTION` adapters when:
1. `currentAuthority >= EXPLICIT_EXTERNAL`
2. `approval.approvalState === "GRANTED"`
3. `plan.costStatus !== "UNKNOWN"`

All existing 3D.1 security gates remain unchanged.
