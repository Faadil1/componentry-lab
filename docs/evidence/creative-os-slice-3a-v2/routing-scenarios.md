# Creative OS Slice 3A V2 — Routing Scenarios

This document records the positive and null matching scenarios across the 4 modes.

---

## 1. Positive Routing Matches

### DAY_CHALLENGE (category-differentiation)
* **Inputs**: Mode: `DAY_CHALLENGE`, Gap: `category-differentiation`
* **Result**: `res_sacred_rules_breaker`
* **Label**: `EXPERIMENTAL_CANDIDATE`

### DAY_CHALLENGE (bodily-response-art-direction)
* **Inputs**: Mode: `DAY_CHALLENGE`, Gap: `bodily-response-art-direction`
* **Result**: `res_somatic_response_design`
* **Label**: `EXPERIMENTAL_CANDIDATE`

### MARA (narrative-staging)
* **Inputs**: Mode: `MARA`, Gap: `narrative-staging`
* **Result**: `res_physical_situation_storyboarder`
* **Label**: `EXPERIMENTAL_CANDIDATE`

### MARA (camera-motion-language)
* **Inputs**: Mode: `MARA`, Gap: `camera-motion-language`
* **Result**: `res_ai_camera_movements`
* **Label**: `EXPERIMENTAL_CANDIDATE`

### HACKATHON (cinematic-product-demo)
* **Inputs**: Mode: `HACKATHON`, Artifact: `product-demo-film`, Gap: `cinematic-product-demo`
* **Result**: `res_video_shotcraft`
* **Label**: `EXPERIMENTAL_CANDIDATE`

### HACKATHON (web-component-animation)
* **Inputs**: Mode: `HACKATHON`, Gap: `web-component-animation`
* **Result**: `res_originkit` (OriginKit and Remocn match; OriginKit sorted ahead alphabetically)
* **Label**: `EXPERIMENTAL_CANDIDATE`

### DATA_STORY (editorial-abstraction)
* **Inputs**: Mode: `DATA_STORY`, Gap: `editorial-abstraction`
* **Result**: `res_relationship_preserving_abstraction`
* **Label**: `EXPERIMENTAL_CANDIDATE`

---

## 2. Null Routing Matches (Unrelated Gaps)

Each mode returns `null` for the top suggestion when querying unrelated/unsupported gaps:

* **DAY_CHALLENGE** + Gap: `unsupported-unrelated-capability` → `topSuggestion: null`
* **HACKATHON** + Gap: `unsupported-unrelated-capability` → `topSuggestion: null`
* **MARA** + Gap: `unsupported-unrelated-capability` → `topSuggestion: null`
* **DATA_STORY** + Gap: `unsupported-unrelated-capability` → `topSuggestion: null`
