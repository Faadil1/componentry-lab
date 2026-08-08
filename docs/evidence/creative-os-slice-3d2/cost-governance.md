# Cost Governance

## Cost Model

| Field | Value |
|---|---|
| `subscriptionRequirement` | REQUIRED |
| `subscriptionPricingEvidence` | Observed at 7 USD/month (2026-08). Not hard-coded as permanent truth. |
| `incrementalExecutionCost` | UNKNOWN — must be verified before live call authorized |
| `subscriptionCeilingUSD` | 7 |
| `downstreamGenerationBudgetUSD` | 0 |

## Governance Rules

- UNKNOWN incremental cost for PRODUCTION adapter → `COST_BLOCKED`. New human approval required.
- estimatedCost > costCeiling → `COST_BLOCKED`.
- Downstream generation budget: **0 USD**.
- Image/video generation: **0 USD**.
- Live API request budget: **not yet approved**.

## Per-Request Pricing Discovery
If per-request pricing is discovered: **BLOCK** and require new human approval before any live call.

## Test Proof
Test 5 demonstrates that `costStatus: "UNKNOWN"` for a PRODUCTION adapter returns `COST_BLOCKED` with zero transport calls.
