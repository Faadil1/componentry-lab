# Lifecycle Policy

## Overview
Test capability artifacts must remain explicitly scoped. A `PRODUCTION` adapter cannot be invoked under any circumstance during this phase (3D.1).

## Invariant
Only adapters with `environment === "TEST_ONLY"` are executable. If a `PRODUCTION` adapter is somehow authorized by the integration layer, the sandbox drops it and returns `ADAPTER_NOT_EXECUTABLE`.

## Evidence
Test 8 registers a production adapter and creates a valid approval binding to it. The sandbox intercepts the attempt and correctly rejects it before building the execution intent.
