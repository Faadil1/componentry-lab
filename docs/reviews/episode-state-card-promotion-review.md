# Episode State Card â€” Promotion Review

**Component:** Episode State Card
**Version:** 1.0.0
**Decision:** PROMOTE
**Promoted at:** 2026-08-06T23:30:00Z

---

## Decision

**PROMOTE** â€” Episode State Card v1.0.0 satisfies all five promotion readiness dimensions and clears all four verification gates.

---

## Readiness Assessment

### 1. Product / Design Readiness

- Covers all six canonical episode states: `default`, `blocked`, `human-review-required`, `approved`, `published`, `unavailable`
- Visual review passed (evidence commit `4b560a5da97bc414fb338e8298488c3ae66ba09d`)
- Accessibility review passed WCAG 2.2 AA (17/17 regression tests pass)
- Motion respects system `prefers-reduced-motion` via `useReducedMotion()` â€” no user-facing override needed

### 2. API Readiness

- API stabilized at 2026-08-06T11:00:00Z â€” `api_stabilized: true`
- 6-member discriminated union on `variant` with variant-specific prop contracts enforced at compile time via TypeScript `never` types
- `HumanReviewStatus`: `"not-required" | "required" | "completed"` â€” intentionally excludes `"unavailable"`
- Removed props documented: `reduceMotion`, `episodeId`, `updatedAt`
- ADR: `docs/decisions/ADR-episode-state-card-api-stabilization.md`
- Migration guide: `docs/migrations/episode-state-card-experimental-to-stable.md`
- API surface: `artifacts/episode-state-card/api-stabilization/api-surface.json`

### 3. Technical Readiness

All four gates PASS on implementation commit `41026169529285101a2fcccf7ce63b281142d044`:

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | EXIT 0 â€” 0 unused `@ts-expect-error` directives |
| `npm run lint` | 0 errors, 0 warnings |
| `npm run build` | EXIT 0 |
| API tests (20/20) | EXIT 0 |

### 4. Reuse Readiness

- Component is read-only display â€” no side effects, no state mutations
- `ssrSafe: true`; `deterministic: true`; `captureReady: true`
- Responsive across all four viewport classes (desktop, laptop, tablet, mobile)
- Exports 12 intentional public symbols â€” no internal helpers leak
- `framer-motion` and `clsx` are the only runtime peer dependencies

### 5. Integration Readiness

- Registered in `lib/registry/components.ts` as `id: "episode-state-card"`, `maturity: "production-candidate"`, `kind: "workflow"`, `categoryId: "workflow"`
- New `"workflow"` category and `"workflow"` kind registered in `lib/registry/types.ts` and `lib/registry/categories.ts`
- Route: `/episode-state-card`
- 12 public exports enumerated in `componentExports`

---

## Provenance

**Implementation commit:**
```
41026169529285101a2fcccf7ce63b281142d044
fix(api): enforce Episode State Card variant contracts
```

**Evidence HEAD at promotion:**
```
(see post-commit SHA after this review commit)
```

---

## Evidence Chain

| Phase | Document |
|-------|----------|
| Visual review | `docs/reviews/episode-state-card-visual-review.md` |
| Accessibility review | `docs/reviews/episode-state-card-accessibility-review.md` |
| Approval review | `docs/reviews/episode-state-card-approval-review.md` |
| API reference | `docs/components/episode-state-card-api.md` |
| ADR | `docs/decisions/ADR-episode-state-card-api-stabilization.md` |
| Migration guide | `docs/migrations/episode-state-card-experimental-to-stable.md` |
| API surface | `artifacts/episode-state-card/api-stabilization/api-surface.json` |
| Type-contract tests | `tests/episode-state-card-types.test.ts` |
| API tests | `tests/episode-state-card-api.test.ts` |

---

## Registry State After Promotion

```yaml
status: PROMOTED
review_status:
  api_stabilized: true
  approved: true
  promoted: true
metadata:
  version: 1.0.0
  next_phase: INTEGRATION_READY
```

**Next phase: INTEGRATION_READY** â€” Component is promoted into the live registry catalog and available for integration into production surfaces.
