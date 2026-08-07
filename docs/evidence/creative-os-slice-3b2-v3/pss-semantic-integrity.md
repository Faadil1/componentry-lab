# PSS Semantic Integrity & Transformation Grounding (Slice 3B.2 V3)

This document details the grounded transformation evidence and semantic isolation corrections made to the Physical Situation Storyboarder (PSS).

## 1. Grounded Transformation Evidence (Reasoning Layer)
To ensure that physical actions explicitly demonstrate the desired transformation without relying on text-label shortcuts, PSS now generates a structured reasoning layer before drafting the scene beats:
* **desiredTransformation**: The target transformation input.
* **behavioralMeaning**: The human behavioral translation of the transformation.
* **observableEvidenceRequired**: The physical conditions necessary to prove the transformation to a silent viewer.
* **actionEvidence**: The concrete action the character takes to manifest the change.
* **relationshipChange**: The spatial adjustment resulting from the action.
* **endingEvidence**: The final visual frame state confirming the transformation.
* **reasoning**: Logical validation explaining how the physical behavior represents the transformation.

## 2. Dynamic Physical Manifestations (Non-Coaching)
Physical actions are derived dynamically from the desired transformation to avoid generic disengagement:
* **Visible Ownership**: Pulls the prop closer, clears the workspace, and stabilizer it with both hands (0cm).
* **Abandonment**: Pushes the prop away, turns, and walks out of the room (infinite distance).
* **Repair Commitment**: Installs structural support braces/tape to reinforce the joints (10cm).

## 3. Added Quality Gates
* `pss.transformation-behaviorally-realized`: PASS only when the ending physical behavior actually provides concrete visual evidence of the transformation.
* `pss.transformation-contrast-material`: PASS only when different desired transformations produce materially distinct physical actions (contrast regression checked across ownership, abandonment, and repair commitment).
* `pss.no-action-transformation-contradiction`: PASS only when physical action is semantically compatible with the desired transformation (e.g., flags contradiction if `visible ownership` is paired with walking out or abandoning).
