# Episode State Card â€” Approval Review

**Component:** Episode State Card
**Version:** 1.0.0
**Decision:** APPROVED
**Approved at:** 2026-08-06T23:00:00Z

---

## Verified Gates

| Gate | Result |
|------|--------|
| Visual review | PASS |
| Accessibility review (WCAG 2.2 AA) | PASS |
| API stabilization | PASS |
| TypeScript (`npx tsc --noEmit`) | PASS â€” EXIT 0 |
| Unused `@ts-expect-error` directives | 0 |
| Lint (`npm run lint`) | PASS â€” 0 errors, 0 warnings |
| Build (`npm run build`) | PASS â€” EXIT 0 |
| API tests | 20/20 PASS â€” EXIT 0 |
| Remote deployment | SUCCESS |

---

## Provenance

**Strict implementation commit:**
```
41026169529285101a2fcccf7ce63b281142d044
fix(api): enforce Episode State Card variant contracts
```

**Final evidence HEAD:**
```
0c26d96e00607b0509672f3749dff47f542ed168
test(api): close Episode State Card type-contract gaps
```

---

## Public API Contract

**Union:** 6-member discriminated union on `variant`

| Variant | Key invariant |
|---------|---------------|
| `default` | `humanReviewStatus`: `"not-required" \| "completed"` |
| `blocked` | `blockers`: non-empty tuple required |
| `human-review-required` | `humanReviewStatus`: exactly `"required"` |
| `approved` | `humanReviewStatus`: exactly `"completed"` |
| `published` | `youtubeVideoId` + `publishedAt` required; `humanReviewStatus`: `"completed"` |
| `unavailable` | All canonical/workflow props forbidden (`never`) |

**HumanReviewStatus:** `"not-required" | "required" | "completed"` â€” excludes `"unavailable"`

**Removed from public API:** `reduceMotion`, `episodeId`, `updatedAt`

**Motion handling:** Always respects system `prefers-reduced-motion` via `useReducedMotion()`

---

## Evidence References

- Visual review: `docs/reviews/episode-state-card-visual-review.md`
- Accessibility review: `docs/reviews/episode-state-card-accessibility-review.md`
- API reference: `docs/components/episode-state-card-api.md`
- ADR: `docs/decisions/ADR-episode-state-card-api-stabilization.md`
- Migration guide: `docs/migrations/episode-state-card-experimental-to-stable.md`
- API surface: `artifacts/episode-state-card/api-stabilization/api-surface.json`
- API tests: `tests/episode-state-card-api.test.ts`
- Type-contract tests: `tests/episode-state-card-types.test.ts`

---

## Next Phase

**PROMOTION_REVIEW** â€” Component is approved and ready for promotion consideration.

`approved: true` / `promoted: false`
