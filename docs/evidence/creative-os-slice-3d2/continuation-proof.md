# Continuation Proof

## Provenance Fields Recorded on Success

After a mocked successful execution, the continuation record contains:

| Field | Value |
|---|---|
| `externalCapabilityPlanFingerprint` | `plan.planFingerprint` |
| `executionIntentFingerprint` | Deterministic SHA-256 of intent |
| `executionReceiptFingerprint` | Deterministic SHA-256 of receipt |
| `providerOutputFingerprint` | SHA-256 of `rawOutput` (non-null on success) |
| `executionStatus` | `EXECUTED` |
| `providerReference` | CinePrompt share ID |
| `artifactClassification` | `EXTERNAL_SHARE_REFERENCE` |

## Invariants
- Project Brain is NOT mutated — provider results live only in the receipt and continuation
- `CINEPROMPT_API_KEY` never appears in continuation
- On `NOT_EXECUTED`: `providerOutputFingerprint` is `null`
- On `PROVIDER_ERROR`: `providerOutputFingerprint` is `null`

## Test Proof
Test 20 serializes the full sandbox result and asserts `super-secret-key-cont` does not appear.
Test 28 verifies all provenance fingerprint fields are present.
Test 21 and 22 verify Project Brain deep equality after success and error.
