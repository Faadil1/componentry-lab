# CANONICAL HANDOVER — Sitewide Editorial / Technical UI V1

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = SITEWIDE EDITORIAL / TECHNICAL UI SYSTEM
PHASE_CODE = COMPONENTRY_SITEWIDE_EDITORIAL_TECHNICAL_UI_V1
TRACK = VISUAL SYSTEM / PRODUCT SHELL
STATUS = IMPLEMENTED_ON_FEATURE_BRANCH / BUILD_QA_PENDING
SOURCE_OF_TRUTH = GitHub branch feature/sitewide-editorial-technical-ui-v1
BASE_MASTER = b01c60303edceff1ac1fe589ba90a53e5a2de3d4
PRODUCTION_CODE_MUTATION = NONE
PROJECT_BRAIN_MUTATION = NONE
WRITE_AUTHORITY_CHANGE = NONE
VERCEL_PROMOTION = NONE
```

## Intent

Apply the selected Componentry Lab visual direction across the product rather than only `/director/live`.

The system combines:
- Gantry: governance interlocks as product logic;
- Folio: editorial hierarchy and calm whitespace;
- Shop Drawing: technical rules, provenance, state annotation and precision;
- Canon Rail / Temporal Ledger inheritance: an explicit canonical frontier where proven state must be distinguished from proposed state.

This is a product-wide visual system, not a decorative theme.

## Locked visual language

```text
BACKGROUND = warm paper / mineral surface
PRIMARY INK = near-black warm ink
FUNCTIONAL ACCENT = cobalt blue
CONFLICT / FAIL-CLOSED = signal red
SUCCESS = restrained green
WARNING = restrained ochre
PURPLE AI GRADIENT = PROHIBITED
DECORATIVE GLOW = PROHIBITED
CARD GRID AS DEFAULT IA = DISCOURAGED
HEAVY SHADOWS = DISCOURAGED
```

Typography:
- Inter / Geist Sans = interface / navigation / operational copy;
- Newsreader = editorial display moments and dominant recommendations;
- Geist Mono = state, provenance, fingerprints, labels, receipts.

## Sitewide strategy

The implementation is deliberately layered:

1. `app/globals.css`
   - reinterprets global Tailwind stone/neutral/blue/red/green/amber tokens;
   - warm paper and ink become the default product palette;
   - global radii become much smaller;
   - shadows become nearly flat;
   - dark mode remains graphite/ivory rather than purple/AI;
   - accessibility focus and reduced-motion rules remain explicit;
   - adds reusable classes `cl-display`, `cl-kicker`, `cl-panel`, `cl-spec-grid`, `cl-frontier` and semantic status classes.

2. `app/layout.tsx`
   - adds Newsreader as the editorial display family;
   - applies the global `componentry-system` scope on `<body>`.

3. `components/navigation/lab-navigation.tsx`
   - removes the primary pill-navigation grammar;
   - converts navigation to rule-based technical tabs;
   - Labs menu becomes a ruled reference surface rather than a floating rounded card.

4. `app/page.tsx` (Command)
   - converts Command into an editorial/technical orchestration surface;
   - dominant project title + one Director recommendation;
   - system state shown with ruled specification rows, not stacked cards.

5. `app/projects/page.tsx` + `components/projects/project-hero.tsx`
   - Project Brain adopts the same global shell and editorial project hierarchy;
   - fact scanning remains compact but uses rule-separated cells.

6. `app/director/live/page.tsx`
   - implements the selected reference most directly;
   - dominant recommendation;
   - contextual deadline/proof/risk/authority column;
   - governance interlock row;
   - explicit `CANONICAL FRONTIER` separating completed canonical work from proposed work;
   - typed governed append/start/complete actions remain unchanged in authority.

7. `components/director/governed-action-panel.tsx`
   - visual rewrite only;
   - exact typed mutation, fingerprint, OAuth owner, stale-state and evidence semantics remain intact.

## Governance invariants

This phase MUST NOT change:
- Project Brain state;
- append/start/complete writer behavior;
- OAuth owner rules;
- proposal fingerprint generation;
- stale-state rejection;
- evidence truth or completion requirements;
- Registry authority;
- Film Kit authority;
- provider execution;
- external side-effect contracts.

```text
VISUAL CHANGE != AUTHORITY CHANGE
DESIGN SYSTEM != WRITE SYSTEM
```

## Canonical Frontier rule

Use `Canonical Frontier` only where it expresses a real semantic boundary:

```text
PROVEN / CANONICAL HISTORY
---------------- CANONICAL FRONTIER ----------------
PROPOSED / NOT YET AUTHORIZED
```

Do not repeat the frontier as decoration on unrelated pages.

## Files in this implementation slice

```text
app/globals.css
app/layout.tsx
components/navigation/lab-navigation.tsx
app/page.tsx
app/projects/page.tsx
components/projects/project-hero.tsx
components/director/governed-action-panel.tsx
app/director/live/page.tsx
tests/sitewide-editorial-technical-ui.test.ts
docs/evidence/sitewide-editorial-technical-ui-v1/CANONICAL-HANDOVER.md
```

## Build QA

At handover creation time:

```text
BUILD_QA = PENDING
REASON = commit not yet created / Vercel build availability must be checked after atomic commit
EXPECTED TEST COUNT = prior suite + 3 sitewide UI contract tests
```

Do not claim build PASS until TypeScript, node tests and Next build have actually completed.

## Exactly one next action

```text
CREATE ATOMIC FEATURE COMMIT
→ inspect exact master...feature diff
→ attempt Preview / Build QA
→ if Vercel build-rate-limit persists, record environment blocker without promoting
→ if build succeeds, perform visual/runtime QA on Command, Project Brain and Director Live
→ only then open Production Promotion Decision Gate
```
