# Creative OS Slice 3A V2 — Authority Model

This document specifies the decoupled suggestion and execution authority model.

---

## Authority Levels Definition

* **READ_ONLY**: Basic visibility, no actions suggested.
* **SUGGEST**: Suggestions can be proposed for human review.
* **PREPARE**: Local files can be staged or compiled (non-destructive).
* **LOCAL_REVERSIBLE**: Execution is permitted if reversible (e.g. running local unit tests).
* **EXPLICIT_EXTERNAL**: Invoking third-party webhooks, spending API budgets.
* **PROHIBITED**: Blocked under all conditions.

---

## Separation Matrix

A resource may require high authority for execution but expose capabilities for suggestions:

| Resource ID | Max Execution Authority | Capability Action | Required Suggestion Authority | Recommendable Status under SUGGEST |
| :--- | :--- | :--- | :--- | :--- |
| `res_cineprompt` | `EXPLICIT_EXTERNAL` | `prompt-camera-path` | `SUGGEST` | **YES** (labeled `EXPERIMENTAL_CANDIDATE`) |
| `res_remocn` | `LOCAL_REVERSIBLE` | `recommend-component` | `SUGGEST` | **YES** (labeled `EXPERIMENTAL_CANDIDATE`) |
| `res_gbro_collage_b_roll` | `EXPLICIT_EXTERNAL` | `compile-collage-broll` | `SUGGEST` | **YES** (labeled `EXPERIMENTAL_CANDIDATE`) |
| `res_ai_world_builder` | `PROHIBITED` | `generate-3d-scene` | `SUGGEST` | **YES** (visible but execution prohibited) |
