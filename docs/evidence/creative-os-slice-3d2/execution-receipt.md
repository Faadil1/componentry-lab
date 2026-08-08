# Execution Receipt

## Required Fields (All Present)

| Field | Source |
|---|---|
| `receiptFingerprint` | SHA-256 of all other receipt fields |
| `executionIntentFingerprint` | From intent |
| `approvalFingerprint` | From approval |
| `planFingerprint` | From plan |
| `inputFingerprint` | SHA-256 of `plan.requiredInputs` |
| `resourceId` | From plan |
| `capabilityId` | From plan |
| `providerAdapterId` | From adapter |
| `authorityUsed` | From execution context |
| `executionStatus` | `EXECUTED` / `PROVIDER_ERROR` / etc. |
| `providerOutputFingerprint` | SHA-256 of `rawOutput` on success; `null` on error |
| `providerReference` | Share link ID or adapter ID |
| `cost` | `{ estimated, actual, currency, status }` |

## Never Included
- `CINEPROMPT_API_KEY`
- Authorization header values
- Raw HTTP headers

## providerOutputFingerprint Rules
- `EXECUTED` → non-null SHA-256 of rawOutput
- `PROVIDER_ERROR` → `null` (never fabricated)
- `PROVIDER_OUTCOME_UNKNOWN` → `null`

## Test Proof
Test 28 verifies all provenance fields are present on mock success.
Test 29 verifies `providerOutputFingerprint` is not fabricated on UNKNOWN outcome.
