# Idempotency and Network Uncertainty

## Idempotency Contract (Preserved from 3D.1)

Same `executionIntentFingerprint`:
- First call → `EXECUTED`, transport called once
- Second call → `ALREADY_EXECUTED`, transport NOT called again
- `R1.receiptFingerprint === R2.receiptFingerprint`

## Network Uncertainty: PROVIDER_OUTCOME_UNKNOWN

Critical case: POST may have reached CinePrompt but connection dropped before response.

### Behavior
- Transport returns `{ outcome: "ERROR", error: { code: "PROVIDER_OUTCOME_UNKNOWN" } }`
- Adapter returns `FAILED` with `PROVIDER_OUTCOME_UNKNOWN` in error
- `providerOutputFingerprint` is `null` — not fabricated
- **No automatic retry** — Creative OS cannot know whether the share link was created

### Why No Retry
Retrying would risk creating a duplicate share link on the provider's side.
The canonical position is: outcome unknown → human review required.

## Test Proof
- Test 15: `FakeOutcome = { outcome: "UNKNOWN" }` → result contains `PROVIDER_OUTCOME_UNKNOWN`
- Test 16: `fake.callCount` remains 1 after result — no internal retry loop
- Test 17: Idempotency — second call returns `ALREADY_EXECUTED`, transport call count stays ≤ 1
- Test 29: `shareUrl` absent from `rawOutput` on UNKNOWN outcome
