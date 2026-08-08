# Provider Selection

## Selected Provider
**CinePrompt** — Developer API

## Criteria Satisfied

| Criterion | CinePrompt Status |
|---|---|
| No per-request credits | UNKNOWN (must verify before live call) |
| Reversibility | Share link only — no persistent media artifacts |
| Artifact type | URL reference (EXTERNAL_SHARE_REFERENCE) |
| Auth scope | API key only, no OAuth |
| Privacy | Synthetic content only — no PII required |
| Downstream providers | NONE — no image/video generation chaining |

## What CinePrompt Provides (Pilot Scope)
One share URL per request via POST https://cineprompt.io/api/share.

## What CinePrompt Does NOT Provide in Pilot
- Image generation (not authorized)
- Video generation (not authorized)
- Provider chaining (not authorized)
- File rendering (not authorized)

## Resource Governance
Adapter existence does NOT promote CinePrompt resource lifecycle state.
`ADAPTER_AVAILABLE ≠ RESOURCE_VALIDATED ≠ RESOURCE_APPROVED`
CinePrompt remains in its actual lifecycle state. No promotion.
