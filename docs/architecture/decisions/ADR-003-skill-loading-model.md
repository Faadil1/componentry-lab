# ADR-003: Skill loading model

## Status
PROPOSED

## Context

The repository needs a governed way to discover and activate skills without loading a monolithic prompt bundle. The audit identified missing metadata-first progressive loading and missing conflict and authority handling.

## Decision

Skills are discovered from metadata first, then loaded progressively only when mode, phase, scope, dependency, and authority checks pass.

## Decision details

Minimal metadata schema proposal:

```typescript
type SkillMetadata = {
  id: string
  name: string
  description: string
  modes: string[]
  phases: string[]
  dependencies?: string[]
  conflicts?: string[]
  requiredAuthority?: string[]
  provenance: {
    sourceId: string
    sourceHash: string
    importedAt: string
  }
}
```

Rules:
- discovery is description-first and metadata-first;
- loading is progressive, not monolithic;
- activation requires scope matching;
- conflicts must be resolved before activation;
- provenance must stay attached;
- authority requirements are checked before use;
- a skill may be excluded instead of force-loaded.

## Alternatives considered

- Load full prompts up front: rejected because it hides provenance and increases coupling.
- Infer skill behavior from free text alone: rejected because it is not auditable enough.

## Consequences

### Positive

- Clear activation rules.
- Better provenance.
- Lower risk of accidental overreach.

### Negative

- More metadata to maintain.
- More up-front tooling work.

### Risks

- Incomplete metadata may prevent a needed skill from loading.
- Conflicting skills may need a resolver.

## Compatibility and migration

Existing capability surfaces remain compatible through adapters that emit metadata. No monolithic prompt loader is introduced in the first slice.

## Validation criteria

- Skills can be listed without loading implementation content.
- A skill cannot activate outside declared scope.
- Conflicts and authority checks are enforced.

## Open questions

- Whether dependencies are transitive or only direct.
- Whether provenance should include canonical source bundle IDs in addition to hashes.

## Source evidence

- Audit findings on missing metadata-first progressive loading.
- Attached source bundles and repository skill-related documentation.
