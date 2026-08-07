# Slice 3C — Film Kit Capability Decomposition

## Capability Model
Production needs are decomposed into one or more primitive Film Kit capabilities prior to provider evaluation:

- `SHOT_PLANNING`
- `CAMERA_LANGUAGE`
- `UI_CAPTURE`
- `PRODUCT_FILM`
- `MOTION_COMPOSITION`
- `B_ROLL`
- `CINEMATIC_PROMPTING`
- `SOUND_DESIGN`
- `ASSEMBLY`

## Decomposition Pipeline
A project requirement (e.g. `capabilityGap: "remocn-render"`) maps to decomposed capabilities (`["MOTION_COMPOSITION", "UI_CAPTURE"]`). Providers are evaluated against these decomposed capability dimensions rather than being hardcoded by project mode.
