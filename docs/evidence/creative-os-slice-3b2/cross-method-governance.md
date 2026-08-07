# Cross-Method Governance Specification

All creative reasoning methods are governed by the Slice 3A Registry and execute within a single runtime structure.

---

## 1. Single Runtime Registry Integration
All 6 methods are registered in the central registry [`lib/creative-os/registry.ts`](file:///C:/Users/fboussari/componentry-lab-director/lib/creative-os/registry.ts) and map to corresponding resource records:

| Method ID | Registered Resource ID | Baseline Lifecycle State |
| --- | --- | --- |
| `method_sacred_rules_breaker` | `res_sacred_rules_breaker` | **VALIDATED** |
| `method_somatic_response_design` | `res_somatic_response_design` | **VALIDATED** |
| `method_physical_situation_storyboarder` | `res_physical_situation_storyboarder` | **TEST_CANDIDATE** |
| `method_relationship_preserving_abstraction` | `res_relationship_preserving_abstraction` | **TEST_CANDIDATE** |
| `method_cognitive_metaphor_illustrator` | `res_cognitive_metaphor_illustrator` | **TEST_CANDIDATE** |
| `method_library_first_composition_router` | `res_library_first_composition_router` | **TEST_CANDIDATE** |

---

## 2. Governance Constraints
* **Advisory Only**: Output fields strictly serve as advisory recommendations and return zero execution or file system mutations.
* **No Auto-Promotion**: Transition to `VALIDATED` or `APPROVED` is gated by human review. Passing quality gates or evaluation tests does not promote a resource's lifecycleState.
* **No External Dependencies**: Execution logic contains no API keys, package installers, external imports, or network-bound logic.
