# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = PHASE_OPEN / SLICE-I-AUTHORIZED
SOURCE_OF_TRUTH = GitHub feature/governed-action-write-plane-01
BASE_PRODUCTION_HEAD = e1be1978fb6109e2d7c302efcffc373c2ae91730
PRODUCTION_RUNTIME_BASELINE = PRODUCTION_PROMOTION_COMPLETE / RUNTIME_QA_PASS
```

## Why this phase exists

The governed collaboration mesh is Production-verified, but most collaborators are intentionally read-only/advisory. The next phase introduces bounded, auditable mutation without collapsing collaboration into unrestricted cross-system writes.

Core invariant:

> COLLABORATION MAY PROPOSE; ONLY A GOVERNED ACTION GATE MAY AUTHORIZE A WRITE; ONLY THE TARGET OWNER MAY APPLY IT.

## Authority architecture

The collaboration mesh remains unchanged as the read/analyze/recommend plane.

A new action/write plane will mediate state mutation:

```text
Collaborator proposal
  -> Governed Action Proposal
  -> deterministic validation + before/after preview
  -> explicit owner approval
  -> canonical write-access check
  -> target-owned executor
  -> mutation
  -> immutable execution receipt
  -> collaboration/audit feedback
```

No collaborator receives unrestricted write authority.

## Slice I — first bounded writable capability

The first executable mutation is intentionally narrow:

```text
PROJECT_BRAIN_APPEND_NEXT_ACTION
```

Rationale:
- additive rather than destructive;
- easy to preview before execution;
- reversible by identity;
- naturally derived from Creative Director's one canonical next action;
- does not itself alter project phase, decisions, evidence, gates, or external systems.

Required scope:

```text
project:next-action:append
```

Required authority:

```text
LOCAL_REVERSIBLE
explicit human approval
canonical owner authentication
```

## Explicitly blocked in Slice I

- arbitrary JSON Patch / arbitrary field mutation;
- project phase mutation;
- project status mutation;
- decision approval/rejection mutation;
- evidence promotion or truth-status mutation;
- Registry V2 mutation;
- Component Library mutation;
- Film Kit execution/publishing;
- external provider execution;
- network/external side effects;
- writes initiated solely because a method/reference/playbook recommends them;
- implicit authority elevation through collaboration routing.

## Slice I acceptance gates

1. Versioned Governed Action proposal/approval/receipt contracts.
2. Fail-closed validation for unknown operations, unknown systems, insufficient authority, missing explicit approval, scope mismatch, project mismatch, stale precondition fingerprint, duplicate action identity, and external effects.
3. Deterministic canonical serialization/fingerprinting.
4. Project Brain target-owned append executor for `nextActions` only.
5. Local and Postgres repository parity.
6. Existing `requireCanonicalWriteAccess()` remains the human-owner authentication boundary.
7. No hidden mutation during proposal/preview.
8. Execution receipt records before/after fingerprints, provenance, authority, and mutation result.
9. Collaboration mesh remains read-only unless a validated governed action reaches the target-owned executor.
10. Tests added to the existing `test:collaboration` / prebuild gate.

## HANDOVER

Resume on `feature/governed-action-write-plane-01`.

Do not modify `master` until preview QA passes and Production promotion is explicitly authorized.

Do not reopen the completed governed collaboration mesh or weaken its read-only defaults. This phase layers a governed write plane on top of it.

## Exactly one next action

```text
SLICE I — IMPLEMENT GOVERNED ACTION CONTRACT + PROJECT_BRAIN_APPEND_NEXT_ACTION + TESTS
```
