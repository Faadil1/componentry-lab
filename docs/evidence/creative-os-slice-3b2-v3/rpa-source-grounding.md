# RPA Source Grounding and Fabrication Prevention

This document details the provenance and grounding constraints implemented in the Relationship-Preserving Abstraction (RPA).

## Provenance Model
We have introduced a provenance rating system for every relational fact:
* **PROVIDED**: The relationship is explicitly specified in the `knownSpatialRelationships` input.
* **DERIVED**: The relationship is logically inferred from structural parameters in `sourceDescription` (e.g. vertical scaling in a high-rise).
* **UNKNOWN**: The relationship requires visual evidence not supplied by the input.

## Fabrication Prevention
* **Rule**: Facts with `UNKNOWN` provenance are excluded from `selectedFacts` and do not count towards the 3-6 selection count required for COMPLETE status.
* **Result**:
  - A minimalist input description like `"a portrait"` yields 0 facts, leading to `PARTIAL` status.
  - An `"exponential line chart"` with no supplementary context yields only 1 derived fact, returning `PARTIAL` status rather than inventing quadrants or horizontal intervals.
  - Adding explicit `knownSpatialRelationships` inside the fixture input provides correct provenance and allows the method to successfully reach `COMPLETE` status.
