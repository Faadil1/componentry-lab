# Creative OS Slice 3A V2 — Architecture Corrections Summary

This document registers the architectural revisions applied during the V2 correction pass.

---

## Factual Lifecycle Corrections

* **Old Baseline**: Resources started with `APPROVED` or `VALIDATED` lifecycle states by default.
* **V2 Corrected Baseline**: Zero resources start as `APPROVED` or `VALIDATED` unless an explicit human review approval record exists. All resources are initialized as `TEST_CANDIDATE`, `AUDITED`, or `CAPTURED`.
* **Expectation**: Active shortlist recommendations evaluate as `EXPERIMENTAL_CANDIDATE` or `DISCOVERY_ONLY` states.

---

## Authority Decoupling

We decoupled suggest authority from execution authority:
* **maxExecutionAuthority**: Enforced ceiling for running mutations or calling external tool APIs (e.g. `EXPLICIT_EXTERNAL`).
* **requiredAuthority**: The authority required for recommending or planning a capability (e.g. `SUGGEST` read-only planning).
* **currentAuthority**: The user's active authority context during routing (e.g. `SUGGEST`).

This allows the router to recommend resources with high execution ceilings (like CinePrompt at `EXPLICIT_EXTERNAL`) under a read-only suggestion request (`SUGGEST`), while blocking any actual execution.

---

## Optional topCandidate

* **Old Baseline**: The router always returned a top candidate suggestion, forcing a low-fit match if nothing else existed.
* **V2 Corrected Baseline**: The `topSuggestion` is `null` if the highest suitability score falls below the threshold of `100`. Unrelated gaps deterministically return no top suggestion.
