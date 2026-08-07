# Idempotency

## Overview
Idempotency ensures that no valid authorized execution can ever be double-spent or re-executed.

## Invariant
The sandbox maintains a `receiptStore` mapped by `executionIntentFingerprint`. Subsequent calls with identical intents must be short-circuited and return `ALREADY_EXECUTED` along with the original receipt.

## Evidence
Test 13 invokes `executeSandboxedPlan` consecutively with the identical parameters. Call 1 returns `EXECUTED` (and `callCount = 1`). Call 2 returns `ALREADY_EXECUTED` (and `callCount = 1`), proving the adapter is completely skipped.
