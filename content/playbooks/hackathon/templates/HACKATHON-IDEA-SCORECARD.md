# HACKATHON IDEA SCORECARD

## Purpose

Store candidate and finalist scores without repeating full idea descriptions.

This file remains a compact scoring artifact.

It does not replace:

- `HACKATHON-IDEAS.md`
- `HACKATHON-DISTINCTION.md`
- `DISTINCTION-BRIEF.md`

The Distinction fields below are only a pre-screen used before the selected idea
enters the full Distinction Gate.

```yaml
idea_scorecard:
  candidates:
    - id:
      name:

      judging_fit:
      differentiation:
      demo_potential:
      feasibility:
      technical_credibility:
      user_value:
      portfolio_value:
      reliability:

      subtotal:
      penalties:
      total:
      status:

      distinction_pre_screen:
        judge_memory_sentence_candidate:
        non_obvious_truth_candidate:
        signature_behavior_candidate:
        visible_proof_opportunity:
        sponsor_causality:
        competent_generic_baseline:
        head_to_head_advantage:
        ai_slop_risk:
        verdict: PASS | REVISE | FAIL

  selected:
  runner_up:
  strategic_decision:
  confidence:
```

## Scoring Integrity

The numeric score remains the score defined in `HACKATHON-IDEAS.md`.

Do not add the Distinction Pre-Screen as extra points to the same 100-point
score.

Use the pre-screen as a transition gate:

```text
PASS
→ selected idea may proceed to HACKATHON-DISTINCTION.md

REVISE
→ one bounded idea refinement

FAIL
→ compare runner-up or return REFINEMENT REQUIRED
```

## Automatic Distinction Failure Conditions

Set:

```yaml
distinction_pre_screen:
  verdict: FAIL
```

when any of the following is true:

- no plausible Signature Behavior exists;
- sponsor technology is decorative;
- no visible proof can support the central claim;
- differentiation depends only on branding or industry;
- the workflow remains a generic input → model answer pattern;
- the concept requires a fundamentally different product to become memorable.

## Status Values

Candidate status:

```text
REJECTED
HOLD
REFINEMENT_ELIGIBLE
STRONG_FINALIST
EXCEPTIONAL
SELECTED
RUNNER_UP
```

Selection confidence:

```text
HIGH
MEDIUM
LOW
```

Strategic decision:

```text
REUSE
ADAPT
BUILD NEW
DO NOT SUBMIT
```
