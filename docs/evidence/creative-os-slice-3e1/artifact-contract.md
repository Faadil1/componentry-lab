# Slice 3E.1: Artifact & Manifest Contract

## Overview
This slice proves the physical artifact spine required for durable receipts and tracking outputs.

## Schema Definition
### ProductionArtifact
- `artifactId`
- `artifactType`
- `projectId`
- `sourceRouteId`
- `sourceResourceId`
- `provenance`
- `localPath`
- `externalReference`
- `contentFingerprint`
- `licenseState`
- `privacyClass`
- `createdBy`
- `createdFrom`
- `version`
- `status`
- `qualityEvidence`
- `executionReceiptFingerprint`

### ProductionArtifactManifest
- `manifestId`
- `projectId`
- `projectMode`
- `requestedArtifacts`
- `artifacts`
- `routes`
- `missingArtifacts`
- `nextAssemblyStep`

## Invariants Proven via Tests
1. **Deterministic Identity**: Content fingerprinting incorporates data, project ID, and route provenance to yield a stable `artifactId`.
2. **Provenance Bound**: Every artifact correctly captures `sourceRouteId` and `sourceResourceId` if produced via a governed route.
3. **No Fabricated Native Receipts**: External routes retain the provided `executionReceiptFingerprint`, but native routes explicitly drop external receipt mocks.
4. **Manifest Completeness Semantics**: `missingArtifacts` accurately calculates fulfillment gaps by ignoring `REJECTED` or `SUPERSEDED` existing artifacts.
5. **Assembly Safe Status**: `getAssemblyCandidates` only selects artifacts in the `APPROVED` or `PRODUCED` statuses, rejecting temporary or superseded variants.
