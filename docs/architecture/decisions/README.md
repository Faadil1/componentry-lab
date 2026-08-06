# Architecture Decisions

This directory contains the architectural decisions for the Creative Director foundation.

## Invariants

1. Project Brain is the canonical project-state authority.
2. Director Core is deterministic and read-only in the first slice.
3. The Director produces exactly one authorized next action.
4. No external action occurs without explicit authority.
5. No learning rule becomes canonical without human approval.
6. No source document silently overwrites a canonical source.
7. Existing routes and consumers remain compatible.
8. Mode behavior remains meaningfully distinct.
9. Evidence must support quality-gate claims.
10. The first slice excludes integrations, vector memory, autonomous publishing, multi-agent orchestration, and production deployment.

## Decisions

- [ADR-001: Creative Director boundaries](./ADR-001-creative-director-boundaries.md)
- [ADR-002: Project Brain source of truth](./ADR-002-project-brain-source-of-truth.md)
- [ADR-003: Skill loading model](./ADR-003-skill-loading-model.md)
- [ADR-004: Learning and rule governance](./ADR-004-learning-and-rule-governance.md)
- [ADR-005: Authority and approval model](./ADR-005-authority-and-approval-model.md)
- [ADR-006: Mode and phase routing](./ADR-006-mode-and-phase-routing.md)
- [ADR-007: Quality gates and evidence](./ADR-007-quality-gates-and-evidence.md)
- [ADR-008: Source import versioning](./ADR-008-source-import-versioning.md)
