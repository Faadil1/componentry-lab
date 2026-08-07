# Cost Governance

## Invariant
If a plan contains an estimated cost and an approval contains a cost ceiling, execution MUST fail if the estimated cost exceeds the ceiling.

## Evidence
Test 9 demonstrates that a plan with `estimatedCost = 15` against an approval with `costCeiling = 10` is blocked at the sandbox level, returning `COST_BLOCKED`.

Additionally, non-test environments with `UNKNOWN` costs are strictly blocked.
