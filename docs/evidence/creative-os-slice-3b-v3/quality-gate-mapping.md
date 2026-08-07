# V3 Quality Gate Mapping Specification

All verification checks requested in the V3 architecture review are mapped directly to corresponding quality gates executed synchronously at runtime.

---

## 1. Sacred Rules Breaker V3 Quality Gates

| Gate ID | Enforced Requirement | TypeScript Implementation Method |
| --- | --- | --- |
| `srb.conventions-inventoried` | At least 3 real, domain-specific conventions must be identified. Generic or empty inventories fail. | Checks that `conventionInventory` contains at least 3 entries, and includes formatted ID brackets `[id]`. |
| `srb.trust-requirement-reasoned` | Each trust requirement maps to a belief, evaluates supports/weakens, and rejects keyword SACRED assignment. | Verifies `Trust Impact Evaluation:` and `Trust Reasoning:` are present and asserts `price-opacity` is not `SACRED`. |
| `srb.action-model-valid` | Each convention has nature and action. Prevents SACRED + BREAK. | Asserts every convention lists `[NATURE:` and `[ACTION:`, and checks no instance of `[NATURE: SACRED] [ACTION: BREAK]` is present. |
| `srb.category-recognition-preserved` | Functional category signals remain. | Checks that `categorySignalsPreserved` contains at least one preserved or bended convention. |
| `srb.objective-link-explicit` | BREAK/BEND decisions explicitly serve project objective. | Asserts that `breakCandidates` contains an explicit `Objective link:` reason block. |
| `srb.scalable-beyond-single-visual` | Inversions must scale across visual, verbal, and motion surfaces. | Verifies visual, verbal, and motion implications are fully defined. |

---

## 2. Somatic Response Design V3 Quality Gates

| Gate ID | Enforced Requirement | TypeScript Implementation Method |
| --- | --- | --- |
| `srd.physical-vocabulary-present` | Must include concrete physical, anatomical, or biological markers. | Verifies that `observableReaction` contains markers from the anatomical vocabulary list (breath, pupil, muscles, jaw, etc.). |
| `srd.art-direction-guidance-concrete` | Art direction must contain actionable instructions (composition, whitespace, scale, typography, and color temperature). | Verifies that layout and sensory consequences are detailed and contain concrete stylistic instructions. |
| `srd.risk-areas-identified` | At least one risk area or failure signal must be documented. | Verifies that the failure signals output list contains at least 2 distinct failure scenarios. |
| `srd.no-coercive-patterns` | Safeguard user legibility, controls, and accessibility (no dark patterns). | Verifies that `accessibilitySafeguard` contains specific instructions protecting contrast ratios, motion controls, or layout zoom levels. |
| `srd.response-to-form-traceable` | Recommendations trace back to perceptual principles and bodily targets. | Asserts that the selected direction rationale references perceptual principles and traces form back to response targets. |
| `srd.context-overrides-style-stereotype` | obvious design stereotypes are reported, analyzed, and rejected in favor of high-fit context-specific alternatives. | Verifies that `stereotypeRisk` is evaluated, and low-risk options are selected when fit matches. |
