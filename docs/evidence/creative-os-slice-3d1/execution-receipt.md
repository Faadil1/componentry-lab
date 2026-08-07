# Execution Receipt

## Overview
The Sandbox generates an `ExternalExecutionReceipt` for every executed intent.

## Properties
- `executionId`: The unique ID provided by the external adapter.
- `executionIntentFingerprint`: The deterministic fingerprint representing what was authorized to run.
- `providerOutputFingerprint`: A hash of the actual raw outputs returned from the external adapter. (Remains `null` on failure, proven in Test 12).
- `receiptFingerprint`: A deterministic hash combining the intent and the outputs.
- `timestamp`: ISO timestamp of execution completion.
