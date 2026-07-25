# HACKATHON EVIDENCE

## Purpose

Store verified, decision-relevant evidence for the current hackathon.

This file is the canonical source for:

- evidence classification;
- claim strength;
- source confidence;
- proof limitations;
- unresolved questions;
- source conflicts;
- evidence required by gates, demo, submission, and audit.

Keep only evidence that affects:

- eligibility;
- scoring;
- differentiation;
- feasibility;
- sponsor causality;
- technical credibility;
- demo reliability;
- submission;
- venture;
- funding.

Do not store broad notes that do not change a decision.

---

## Core Rule

Evidence quality cannot be upgraded through:

- narration;
- UI polish;
- screenshots;
- video editing;
- persuasive copy;
- confidence language;
- architecture diagrams;
- agent-generated summaries.

A result remains what the underlying proof supports.

```text
LOCAL_STUB does not become LIVE.
PRESEEDED does not become VERIFIED.
SIMULATED does not become MEASURED.
PARTIAL does not become COMPLETE.
UNKNOWN does not become LIKELY without evidence.
```

---

# Canonical Evidence Taxonomy

Use exactly one primary evidence label per claim or artifact.

## LIVE

The real target system, service, chain, API, deployment, or workflow executed
successfully in the intended environment.

Requirements:

- real execution;
- real dependency;
- observable result;
- reproducible or captured proof;
- no hidden substitution.

Examples:

- successful production or testnet transaction;
- deployed API called successfully;
- real browser workflow against the live backend;
- real sponsor API response.

---

## LOCAL

The real implementation executed locally without replacing the core mechanism.

Use when:

- the actual code runs locally;
- the actual model or dependency is local;
- no fake external response is inserted;
- the claim is limited to local execution.

Examples:

- local model inference;
- local signed receipt verification;
- local end-to-end workflow.

Do not describe `LOCAL` as deployed or externally verified.

---

## LOCAL_STUB

The local workflow runs, but one or more external dependencies are replaced by
a stub, mock, fake response, or simulated facilitator.

Use when the implementation proves:

- interface shape;
- control flow;
- local signing;
- error handling;
- internal logic;

but not the real external integration.

---

## PRESEEDED

The displayed result was created, captured, or prepared in advance.

Use when:

- a fallback result is loaded;
- a demonstration dataset is pre-populated;
- a fixed result is shown;
- a captured run is replayed.

Pre-seeded evidence may support UX, demo flow, or fallback readiness.

It does not prove live execution.

---

## SIMULATED

The environment, data, behavior, transaction, user, or outcome is intentionally
simulated.

Use when simulation is part of the product or test design.

Examples:

- synthetic transaction dataset;
- simulated robot environment;
- simulated fraud events;
- simulated sponsor sandbox response.

Always state what is simulated.

---

## PARTIAL

Some required parts are proven, but the full claim is not.

Use when:

- one environment works but the intended environment does not;
- some steps pass and others fail;
- deployment exists but the full workflow does not;
- sponsor integration is present but not end-to-end;
- browser path works with a fallback only.

State both:

- what passed;
- what remains unproven.

---

## NOT_IMPLEMENTED

The capability does not exist in the current build.

Use instead of vague wording such as:

- planned;
- almost done;
- available soon;
- easy to add.

Future work must not appear in feature claims.

---

## UNKNOWN

No sufficient evidence exists.

Use when:

- the status was not checked;
- sources conflict;
- the artifact is missing;
- the result is stale;
- memory is the only source;
- a previous session may have changed the state.

`UNKNOWN` is blocking when a mandatory decision depends on it.

---

# Evidence Metadata

Project-specific values may be stored as metadata, not as new primary labels.

Examples:

```yaml
metadata:
  execution_subtype: LIVE_AI
  environment: CLOUD_SHELL
  verification_subtype: CLOUDSHELL_VERIFIED
  provisioning_status: NOT_PROVISIONED
  model: claude-haiku-4-5-20251001
```

Examples such as `LIVE_AI`, `CLOUDSHELL_VERIFIED`, or `NOT_PROVISIONED` must not
replace the canonical evidence label.

---

# Claim Strength

Claim strength and evidence label are separate dimensions.

Use exactly one claim-strength value:

## UNSUPPORTED

No usable evidence.

Do not publish the claim.

## DESCRIBED

The system, design, or intended behavior is documented.

May be stated cautiously.

## DEMONSTRATED

The behavior is shown in a test, demo, local run, or captured workflow.

May be stated directly within the demonstrated boundary.

## VERIFIED

The claim was independently checked through tests, reproducible artifacts,
external systems, signed evidence, or multiple consistent proof sources.

May be emphasized.

## MEASURED

The claim is supported by a defined metric, method, dataset, and result.

Required for strong quantitative impact claims.

---

# Source Confidence

Use:

```text
CONFIRMED
LIKELY
UNCERTAIN
NOT_FOUND
```

## CONFIRMED

Supported by a reliable source or direct evidence.

## LIKELY

Supported by indirect but credible evidence.

Do not use for mandatory eligibility or compliance conclusions.

## UNCERTAIN

Evidence is incomplete, stale, ambiguous, or conflicting.

## NOT_FOUND

A targeted search or inspection did not find the required information.

`NOT_FOUND` does not prove absence unless the source is authoritative and
complete.

---

# Source Types

Recommended values:

```text
OFFICIAL_RULE
OFFICIAL_DOC
OFFICIAL_EMAIL
OFFICIAL_PORTAL
REPOSITORY
COMMIT
TEST
HARNESS
BROWSER_TEST
DEPLOYMENT
API_RESPONSE
CHAIN_TRANSACTION
SIGNED_RECEIPT
LOG
DATASET
SCREENSHOT
VIDEO
ARCHITECTURE
USER_REPORT
THIRD_PARTY_SOURCE
MEMORY
```

Rules:

- `MEMORY` alone cannot confirm current mutable facts.
- `USER_REPORT` is valid evidence of what the user observed, but may still
  require external verification for eligibility, rules, scores, or system state.
- Screenshots and video prove only what is visible in the capture.
- Architecture proves design, not execution.
- Repository code proves implementation presence, not successful execution.

---

# Evidence Item Format

Use:

```yaml
evidence_item:
  id:
  claim:
  primary_label: LIVE | LOCAL | LOCAL_STUB | PRESEEDED | SIMULATED | PARTIAL | NOT_IMPLEMENTED | UNKNOWN
  claim_strength: UNSUPPORTED | DESCRIBED | DEMONSTRATED | VERIFIED | MEASURED
  source:
  source_type:
  artifact:
  environment:
  date:
  freshness:
  reproducible:
  verification_method:
  result:
  limitation:
  confidence: CONFIRMED | LIKELY | UNCERTAIN | NOT_FOUND
  implication:
  affected_gates:
  affected_artifacts:
  owner:
  status: ACTIVE | SUPERSEDED | STALE | INVALID
```

Every important evidence item must state its limitation.

---

# Evidence Pack

```yaml
evidence_pack:
  event_id:
  project_id:
  updated_at:
  research_status:

  confirmed:
    - id:
      claim:
      primary_label:
      claim_strength:
      source:
      source_type:
      artifact:
      environment:
      date:
      confidence:
      limitation:
      implication:
      affected_gates:

  unresolved:
    - id:
      question:
      current_label: UNKNOWN
      why_it_matters:
      blocking:
      next_source:
      owner:
      deadline:

  conflicts:
    - id:
      topic:
      sources:
      conflict:
      impact:
      resolution_method:
      status:

  invalidated:
    - id:
      prior_claim:
      reason:
      replaced_by:
      affected_artifacts:

  evidence_summary:
    live:
    local:
    local_stub:
    preseeded:
    simulated:
    partial:
    not_implemented:
    unknown:
```

---

# Evidence Gate Rules

## Eligibility and Compliance

Mandatory facts require:

```text
CONFIRMED
```

Do not approve eligibility with `LIKELY`.

---

## Mandatory Technology

Must show:

- real presence;
- role in the core workflow;
- causal contribution;
- visible or inspectable proof;
- correct primary label.

An installed dependency alone is `DESCRIBED`, not `VERIFIED`.

---

## Core Functionality

Must map the main workflow to evidence for:

- trigger;
- system action;
- Signature Behavior;
- proof;
- outcome;
- fallback.

---

## Demo

Every major demo claim must have:

- claim-strength classification;
- primary evidence label;
- visible artifact;
- fallback classification;
- disclosed limitation.

Fallback footage must not be labeled live.

---

## Submission

README, video, screenshots, repository, and submission copy must use consistent
evidence labels.

A claim cannot be stronger in the submission than in this file.

---

## Audit

A mandatory gate cannot pass when its controlling evidence is:

```text
UNSUPPORTED
UNKNOWN
NOT_IMPLEMENTED
```

`PARTIAL`, `LOCAL_STUB`, `PRESEEDED`, or `SIMULATED` may pass only when the
official requirement and claim are explicitly limited to that evidence level.

---

# Sponsor Causality Evidence

Use:

```yaml
sponsor_evidence:
  sponsor_technology:
  enabled_behavior:
  removal_consequence:
  primary_label:
  claim_strength:
  visible_artifact:
  repository_artifact:
  verification_method:
  limitation:
  result: PASS | PARTIAL | FAIL
```

A sponsor logo, package import, or architecture box alone does not prove
causality.

---

# Distinction Evidence

Use:

```yaml
distinction_evidence:
  judge_memory_sentence:
  signature_behavior_claim:
  trigger_evidence:
  visible_state_change_evidence:
  proof_artifact:
  signature_moment_capture:
  head_to_head_advantage_evidence:
  primary_label:
  claim_strength:
  limitation:
  result: PASS | PARTIAL | FAIL
```

A Distinction Brief alone proves design intent, not working distinction.

---

# Antigravity Evidence

Antigravity-created artifacts are provisional until Claude Code audit.

Use:

```yaml
antigravity_evidence:
  role:
  branch:
  commit:
  artifact:
  source_type:
  primary_label:
  claim_strength:
  protected_paths_clean:
  tests:
  browser_evidence:
  claude_audit_verdict: PASS | PASS_WITH_FIXES | REJECT | NOT_AUDITED
  accepted_into_evidence_pack:
```

Rules:

- `NOT_AUDITED` evidence cannot support a mandatory gate.
- Antigravity cannot change a primary evidence label.
- Claude Code validates technical truth before merge or submission use.
- No Antigravity write evidence is accepted for a `SUBMITTED / FROZEN`
  project unless the project was explicitly reopened.

---

# Evidence Freshness

Mark evidence `STALE` when:

- a mutable deployment may have changed;
- a portal status may have changed;
- a deadline or rule may have changed;
- a repository moved beyond the cited commit;
- the evidence is more than one session old and was not written back;
- a new implementation invalidates the prior result.

Before using stale evidence for a decision:

```text
verify
or
downgrade to UNKNOWN
```

---

# Conflict Resolution

When sources conflict:

1. prefer official primary sources;
2. prefer direct execution evidence over description;
3. prefer the final repository commit over older screenshots;
4. prefer reproducible tests over narration;
5. preserve both sources until resolved;
6. mark the controlling claim `UNCERTAIN`;
7. block dependent mandatory decisions when necessary.

Do not silently choose the more favorable source.

---

# Evidence Bundle

For final audit or submission, produce:

```yaml
evidence_bundle:
  project:
  repository_commit:
  deployment:
  demo:
  video:
  screenshots:
  architecture:
  tests:
  harnesses:
  sponsor_proof:
  distinction_proof:
  fallback_proof:
  claim_map:
  limitations:
  unresolved:
  generated_at:
```

Reference artifacts rather than embedding large outputs.

---

# HACKATHON-STATE Update

After a material evidence change, update only the delta:

```yaml
phase_update:
  phase: EVIDENCE
  evidence_added:
  evidence_invalidated:
  labels_changed:
  claims_strengthened:
  claims_weakened:
  unresolved_added:
  unresolved_resolved:
  conflicts_added:
  conflicts_resolved:
  affected_gates:
  affected_scores:
  affected_artifacts:
  exact_next_action:
```

A label may change only when new evidence justifies it.

---

# Token Efficiency Rules

1. Store only decision-relevant evidence.
2. Reference artifacts instead of copying logs.
3. Keep one canonical record per claim.
4. Mark superseded evidence instead of duplicating it.
5. Update only affected claims and gates.
6. Do not repeat full research summaries.
7. Do not preserve low-value browsing notes.
8. Stop research when new evidence will not change a decision.

---

# Failure Modes

## Evidence Inflation

Failure:

A weak result is presented with a stronger label.

Fix:

Restore the canonical label and downgrade affected claims.

---

## Screenshot as Execution Proof

Failure:

A screenshot is treated as proof of the underlying live mechanism.

Fix:

Classify the screenshot separately and require execution evidence.

---

## Code as Runtime Proof

Failure:

Repository code is treated as proof that the workflow succeeded.

Fix:

Require test, harness, log, deployment, or transaction evidence.

---

## Architecture as Sponsor Proof

Failure:

A diagram shows the sponsor technology, but no causal behavior is verified.

Fix:

Add sponsor-causality evidence.

---

## Hidden Fallback

Failure:

Pre-seeded or recorded output is shown without disclosure.

Fix:

Label it and update demo, submission, and audit artifacts.

---

## Stale State

Failure:

An old result controls a current decision.

Fix:

Reverify or downgrade to `UNKNOWN`.

---

## Agent Evidence Without Audit

Failure:

Antigravity output is accepted as authoritative without Claude audit.

Fix:

Audit, reject, or remove it from the evidence pack.

---

## Conflicting Evidence Ignored

Failure:

The favorable source is selected without resolving the conflict.

Fix:

Record the conflict and block dependent claims.

---

# Final Evidence Decision

Return exactly one:

```text
EVIDENCE PACK READY
EVIDENCE PACK READY WITH GAPS
TARGETED VERIFICATION REQUIRED
EVIDENCE BLOCKED
```

---

# Final Rule

This file must answer:

- What is proven?
- At what evidence level?
- How strong is the claim?
- What source supports it?
- In which environment was it observed?
- What limitation applies?
- Is it current?
- What remains unknown?
- Which gate or decision does it affect?
- Can judges independently verify it?
- Is the same label used in the demo, submission, audit, and state?

If those answers are unclear, the evidence is not decision-ready.
