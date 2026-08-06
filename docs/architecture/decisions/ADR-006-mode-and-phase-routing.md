# ADR-006: Mode and phase routing

## Status
PROPOSED

## Context

The audit identified that mode and phase must stay separate. The first supported modes are Day Challenge, Hackathon, MARA, and Data Story, and each needs distinct evaluation behavior.

## Decision

Mode selects the governing workflow family. Phase selects progress within that mode. Status reports execution state. Kind identifies the project family. These are related but not interchangeable.

## Decision details

Supported modes:
- `DAY_CHALLENGE`
- `HACKATHON`
- `MARA`
- `DATA_STORY`

Mode definitions:

| Mode | Purpose | Evaluator | Expected proof | Scope behavior | Phase vocabulary | Completion criteria |
| --- | --- | --- | --- | --- | --- | --- |
| DAY_CHALLENGE | narrow daily delivery | deterministic core | concise evidence packet | tightly bounded | idea, draft, review, done | one accepted outcome |
| HACKATHON | competitive submission | governed review | submission-ready bundle | artifact-heavy | intake, build, polish, submit | approved submission package |
| MARA | multi-stage narrative or campaign work | structured narrative evaluator | milestone evidence | stage-aware | research, develop, validate, finalize | coherent milestone closure |
| DATA_STORY | analytical storytelling | evidence and insight evaluator | data-backed narrative | dataset-linked | discover, analyze, compose, verify | verified story and claims |

Rules:
- route by mode first;
- route by phase only within the selected mode;
- do not fall back to a generic mode that erases distinctions;
- mode-specific evaluators may reuse shared helpers but not erase mode semantics;
- exactly one authorized next action must still be produced.

## Alternatives considered

- Collapse mode and phase into one field: rejected because it loses routing precision.
- Use a single generic evaluator: rejected because it blurs meaning across workflows.

## Consequences

### Positive

- Clear separation of concerns.
- Easier routing tests.
- Better compatibility for future modes.

### Negative

- More routing logic.
- More mode-specific contract work.

### Risks

- If mode vocabulary drifts, route selection can become inconsistent.
- Shared helper logic may accidentally flatten mode behavior.

## Compatibility and migration

Existing routes and consumers remain compatible through explicit adapters. Legacy project records must map cleanly into one of the supported modes or fail closed.

## Validation criteria

- Mode and phase are independently testable.
- Each supported mode produces distinct behavior.
- No generic fallback erases the mode.

## Open questions

- Whether project kind should remain a public contract or become internal only.
- Whether all four modes share the same authority matrix.

## Source evidence

- Repository audit on overlapping project state concepts.
- Attached source bundles and the accepted Phase 1 findings.
