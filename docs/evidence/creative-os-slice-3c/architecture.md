# Slice 3C — Architecture & System Boundaries

## Boundary Principle
Slice 3C is strictly limited to **EXTERNAL CAPABILITY + FILM KIT ROUTING / PLANNING**.
Sandbox provider execution is deferred entirely to Slice 3D.

```
Project Brain
  └── Director Projection
        └── Capability Gap Detection
              └── Governed Resource Router
                    └── Film Kit Capability Decomposition
                          └── ExternalCapabilityPlan (NOT_EXECUTED)
                                └── Director Advisory Evidence
                                      └── Exactly One Next Action
                                            └── Deterministic Continuation State
```

## Guarantees
1. `executionMode` = `NOT_EXECUTED`
2. `executionStatus` = `PLAN_ONLY` / `EXTERNAL_PLAN_READY` / `HUMAN_APPROVAL_REQUIRED` / `DISCOVERY_REQUIRED` / `BLOCKED` / `NO_MATCH`
3. Provider execution count = 0 across all production runs.
