# Execution Intent

## Overview
Execution Intent (`ExternalExecutionIntent`) acts as the immutable payload built just before an adapter executes. It guarantees that what is executed exactly matches the sandbox bounds.

## Composition
The intent is constructed from:
- canonical `planFingerprint`
- canonical `approvalFingerprint`
- executing `providerAdapterId`
- executing `projectId`
- executing `projectBrainFingerprint`

## Fingerprint
A deterministic `sha256` hash over sorted keys generates `executionIntentFingerprint`. As proven in Test 10, identical intents produce identical fingerprints, enabling deterministic caching and idempotency.
