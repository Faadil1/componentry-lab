# 29 — Anti-AI-Slop Pass

Purpose: detect and correct generic AI-generated UI before it becomes the final direction.

Core rule: clarity is mandatory, but blandness is not.

## Use when

- The UI looks like a template.
- Cards feel interchangeable.
- Icons are random.
- Buttons are flat and generic.
- The palette is default blue/purple gradient without role.
- The hero headline could belong to any product.
- Proof is visually hidden.
- Motion is decorative rather than useful.
- The page looks “clean” but forgettable.

## Slop signals

- Generic headline: “Transform your workflow with AI.”
- Repeated 3-card sections with vague icons.
- Random glassmorphism.
- Gradient blobs with no meaning.
- CTA color not connected to hierarchy.
- All sections have the same density.
- Stock icons from multiple styles.
- Dashboard starts with raw logs instead of result/proof.
- Evidence card hidden below decorative sections.
- Dark premium style applied by default.

## Anti-slop correction block

```md
Anti-slop diagnosis:
- What feels generic:
- What reference would improve it:
- What should be more specific:
- What visual risk is worth taking:
- What must remain unchanged:
- Acceptance check:
```

## Fix order

1. Specific promise.
2. Strong evaluator path.
3. Proof visible.
4. Typography hierarchy.
5. Button/CTA treatment.
6. Color role.
7. Icon language.
8. Composition rhythm.
9. Motion/micro-interactions.
10. Decorative polish only after the above.

## Rules

- Do not rewrite the whole UI unless the structure is broken.
- Fix 1–3 high-leverage issues first.
- Preserve evidence labels exactly.
- Do not hide limitations.
- Do not make LOCAL_STUB, SIMULATED, MOCKED, PRESEEDED, PROJECTED, or FAILED look LIVE.
- Keep mobile and screenshots readable.
