# Slice 3E.1: Architecture & Boundaries

## Structural Boundaries
- **Film Kit**: Remains the sole owner of creative intent, capability planning, sandbox validation, and cost/authority governance.
- **Componentry Lab**: Remains the execution and implementation layer (UI, WebGL, animation).
- **Slice 3E Layer**: Owns the intermediate structural translation. It does not generate intent and does not execute code; it maps `ExternalCapabilityPlan` instances into canonical `ProductionRoute` instances, resolving licenses, privacy, and route type preferences.

## Hero Demo Truth
The system rigorously adheres to the single, canonical Hero Demo definition. 3E.1 does **NOT** invent a second Hero Demo object. 
Instead, it references the existing canonical definition through the `heroDemoContribution` field on `ProductionRoute` (`PRIMARY`, `SUPPORTING`, or `NONE`).

**Mechanism Implemented:**
- If the requested capability is explicitly tied to a Hero Moment (e.g., `PROMPT_SHARE_LINK_CREATION` or artifact `product-demo-film`), the contribution maps to `PRIMARY`.
- Otherwise, it maps to `SUPPORTING` or `NONE`.
- This ensures that execution boundaries can prioritize resources based on the Hero Demo impact without duplicating the business logic definition.

## Immutability Guarantee
The production routing layer strictly guarantees that input states are immutable.
During scenario tests across all four modes, canonical `Project Brain` fixtures were deeply cloned before execution, and deep equality assertions confirmed **0 mutations** during the execution of routing and artifact generation logic.
