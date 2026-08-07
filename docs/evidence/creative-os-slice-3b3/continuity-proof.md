# Continuity Proof

Continuation compatibility classification:
- NONE: first run
- MATCH: same project, same ProjectBrain fingerprint
- STALE: same projectId, different ProjectBrain fingerprint
- INCOMPATIBLE: different projectId

Fingerprints are distinct: integrationFingerprint represents the decision pipeline, continuationFingerprint represents the continuation state itself.