# Slice 3E.1: Production Route Contract

## Overview
The `ProductionRoute` interface defines the exact intent, governance boundaries, and destination for a resolved capability.

## Schema Definition
The proven schema contains the following actual fields:
- `routeId`
- `projectId`
- `planFingerprint`
- `requestedArtifactType`
- `productionCapability`
- `routeType`
- `resourceId`
- `providerAdapterId`
- `authorityRequired`
- `executionMode`
- `estimatedCost`
- `licenseState`
- `privacyClass`
- `inputArtifacts`
- `expectedOutputArtifacts`
- `heroDemoContribution`
- `qualityGates`
- `evidenceRequired`
- `reversibility`
- `status`

## Route Types
Resolved actual values for `ProductionRouteType`:
`"NATIVE" | "INTERNAL_COMPONENT" | "LOCAL_PRODUCTION" | "EXTERNAL_PROVIDER" | "EXTERNAL_PIPELINE" | "ASSET_SOURCE" | "NO_MATCH"`

## Invariants Proven via Tests
1. **Deterministic IDs**: Generated using timestamp-seeded strings for unique execution requests.
2. **Native Preference**: Evaluates true native paths first, overriding complex resource requirements.
3. **Fail-Closed Strategy**: Unknown capabilities always resolve to `"NO_MATCH"` and `"BLOCKED"`.
4. **License Preservation**: A requested resource with an `"UNKNOWN"` license preserves the exact `"UNKNOWN"` string without coercing to a permissive state. Wait, no, `res_sacred_rules_breaker` preserves `MIT`. Unknown widget preserves `UNKNOWN`.
5. **Non-executable resources**: `DISCOVERY_FEED` and `REFERENCE_ONLY` resolve strictly to `NO_MATCH` and block execution.
