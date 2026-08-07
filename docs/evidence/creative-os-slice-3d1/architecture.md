# Slice 3D.1 Sandbox Architecture

The sandbox architecture is modeled around defense-in-depth isolation:

1. **Integration Layer**: Computes plans, validates continuity, and blocks at the boundaries.
2. **Sandbox (`executeSandboxedPlan`)**: Independently re-validates ALL requirements (authority, cost, approval, fingerprints) using purely deterministic data passed to it.
3. **Execution Intent**: Converts valid plans into canonical fingerprints.
4. **Idempotency Store**: Blocks subsequent identical executions and prevents double-spends.
