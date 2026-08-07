# Before vs After Output Comparison

## 1. Physical Situation Storyboarder (PSS)
* **Before (V2)**:
  - Input `narrativeBeat: "accountability drift"`, `desiredTransformation: "acceptance"`
  - Output nodes hardcoded pottery studio layout and tools (`Mara reaches for smoothing rib tool...`).
  - The final scene resulted in a transition to `acceptance`.
* **After (V3)**:
  - Input `narrativeBeat: "accountability drift"`, `desiredTransformation: "visible ownership"`, `propConstraints: "broken office desk"`, `locationConstraints: "broken office desk"`
  - Output nodes are completely office-themed.
  - Beat #1 establishes the structural strain of the `broken office desk` within the environment.
  - Beat #2 shows a deliberate step back representing the transformation to `visible ownership` with no pottery tools or default acceptance leakages.

## 2. Relationship-Preserving Abstraction (RPA)
* **Before (V2)**:
  - Input `sourceDescription: "Exponential line chart"`
  - Output fabricated visual spatial facts (like clusters in the top-right quadrant) to satisfy the 3-fact complete requirement.
* **After (V3)**:
  - Input `sourceDescription: "Exponential line chart"` without explicit spatial relationships.
  - Output selects 0 fabricated facts, derives exactly 1 fact (`Exponential height curve of vertical nodes`), and returns `PARTIAL` status with `INSUFFICIENT_HIGH_INFORMATION_RELATIONSHIPS` gate failure.
  - Specifying explicit `knownSpatialRelationships` in the input enables `COMPLETE` status with fully grounded fact provenance.
