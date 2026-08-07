# Approval Binding Proof

## Invariant
The Sandbox enforces that execution only proceeds if the human approval explicitly matches:
1. `projectId`
2. `projectBrainFingerprint`
3. `planFingerprint`
4. `resourceId`
5. `capabilityId`
6. `providerAdapterId`

## Evidence
Test suite cases 5a to 5f explicitly mutate each of these properties in the approval payload and verify that the sandbox strictly returns `APPROVAL_INVALID`.

The fingerprint `approvalFingerprint` enforces that tampered objects without a recomputed hash also fail (Test 6).
