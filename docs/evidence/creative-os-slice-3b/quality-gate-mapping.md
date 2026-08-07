# Quality Gate Mapping Specification

All verification checks requested in the architecture review are mapped directly to corresponding quality gates executed synchronously at runtime.

---

## 1. Sacred Rules Breaker Quality Gates

| Gate ID | Enforced Requirement | TypeScript Implementation Method |
| --- | --- | --- |
| `srb.conventions-inventoried` | At least 3 real, domain-specific conventions must be identified. Empty or generic placeholders fail. | Checks that `conventionInventory` contains at least 3 entries, and includes formatted ID brackets `[id]`. |
| `srb.trust-codes-protected` | Trust-critical codes (e.g. efficacy, safety, certification) must be protected and never recommended for breaking. At least one convention must remain SACRED. | Verifies `categorySignalsPreserved` is non-empty, and asserts that no convention ID classified as `SACRED` appears in the `breakCandidates` output. |
| `srb.break-candidates-strategic` | Rule-break candidates must have concrete strategic justification tied to the desired position. | Checks that candidates report their `challenge-strength` score and contain custom positioning notes. |
| `srb.strategic-inversion-position-sensitive` | The final inversion must be context-sensitive. Identical output across positions is a defect. | Verifies the inversion text includes the subject name, is position-specific, and varies based on desired position inputs. |

---

## 2. Somatic Response Design Quality Gates

| Gate ID | Enforced Requirement | TypeScript Implementation Method |
| --- | --- | --- |
| `srd.physical-vocabulary-present` | Must include concrete physical, anatomical, or biological markers. | Verifies that `observableReaction` contains markers from the anatomical vocabulary list (breath, pupil, muscles, jaw, etc.). |
| `srd.art-direction-guidance-concrete` | Art direction must contain actionable instructions (composition, whitespace, scale, typography, and color temperature). | Verifies that layout and sensory consequences are detailed and contain concrete stylistic instructions. |
| `srd.risk-areas-identified` | At least one risk area or failure signal must be documented. | Verifies that the failure signals output list contains at least 2 distinct failure scenarios. |
| `srd.no-coercive-patterns` | Safeguard user legibility, controls, and accessibility (no dark patterns). | Verifies that `accessibilitySafeguard` contains specific instructions protecting contrast ratios, motion controls, or layout zoom levels. |
