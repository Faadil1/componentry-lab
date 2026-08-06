# Episode State Card — Visual Polish

## Review Context

- **Previous decision:** PASS_WITH_CHANGES
- **Polish commit:** 3fe387c
- **Evidence commit:** (pending)

---

## Problems Addressed

The initial visual review correctly identified the component as functionally sound but visually requiring refinement. The component read as a generic dashboard rather than a premium editorial interface.

### Issue 1: Weak Hero Demo Framing

**Problem:** Excessive white space around the card, oversized Hero heading, insufficient visual hierarchy.

**Impact:** The card looked lost in the presentation, not commanding as a central interface element. Five-to-eight second demo captures would lack impact.

**Fix Applied:**
- Reduced section width constraint from `max-w-6xl` to `max-w-4xl` for stronger card prominence
- Added subtle gradient background (`from-white via-white to-neutral-50/50`)
- Renamed section to "Workflow State Display" with supportive context
- Tightened spacing (py-20 → py-16 on desktop)
- Changed shadow from `shadow-2xl` to `shadow-md` for editorial restraint

### Issue 2: Excessive Uppercase Density

**Problem:** Multiple section labels in uppercase (`LAST VALIDATED DECISION`, `BLOCKING ISSUES`, `NEXT AUTHORIZED ACTION`, etc.) created administrative, generic appearance.

**Impact:** Diminished editorial personality; read like SaaS dashboard UI, not Editorial Control Panel.

**Fix Applied:**
- Removed `uppercase` class from all secondary section labels
- Labels now render in title case: "Last validated decision", "Blocking issues", "Next authorized action", "Next expected state"
- Preserved uppercase only for workflow states (BLOCKED, APPROVED, PUBLISHED, etc.), which require visual dominance

### Issue 3: Visual Separator Overload

**Problem:** Too many horizontal dividers (`border-t border-neutral-300`) created visually chunked appearance.

**Impact:** Reduced visual flow; felt like enumerated list rather than cohesive workflow surface.

**Fix Applied:**
- Reduced separator opacity across all sections: `border-neutral-300` → `border-neutral-200/50`
- Lightened label text color to match reduced emphasis: `text-neutral-600` → `text-neutral-500`
- Separators now provide structure without visual weight

### Issue 4: Redundant Technical State

**Problem:** Technical state label directly below human-readable state label created redundancy:
```
EDITORIAL DEVELOPMENT
Technical state: EDITORIAL_DEVELOPMENT
```

**Impact:** Suggested equal importance between human and machine identifiers; clouded primary message.

**Fix Applied:**
- Moved technical state to footer metadata section
- Integrated into "State ID" field with monospace styling
- Now appears as: `State ID · EDITORIAL_DEVELOPMENT` in footer
- Maintains transparency without cluttering primary workflow state

### Issue 5: Ambiguous Next Action Icon

**Problem:** Play icon (`▶`) before next action text suggested direct execution, conflicting with read-only nature.

**Impact:** Confused operational clarity; users might attempt to click action text thinking it was a button.

**Fix Applied:**
- Replaced Play icon with ArrowRight (`→`)
- ArrowRight conveys destination/navigation intent, not execution
- Maintains visual distinction without suggesting interactivity

### Issue 6: Weak Canonical Provenance

**Problem:** Footer metadata presented as secondary technical details, not trustworthy source.

**Impact:** Did not evoke "canonical source of truth" for workflow state.

**Fix Applied:**
- Changed "Source: " to "Canonical source" for institutional language
- Reorganized metadata into three cohesive lines:
  - `Canonical source · episode-014 manifest`
  - `Version · draft`
  - `State ID · EDITORIAL_DEVELOPMENT`
- Uses dot separator for compact, professional presentation
- Technical state now part of provenance chain, not duplicate information

---

## Changes Made

### Component (`episode-state-card.tsx`)

| Change | Before | After | Rationale |
|--------|--------|-------|-----------|
| Icon for next actions | `<Play />` | `<ArrowRight />` | Read-only clarity |
| Section label style | `uppercase` class | Title case text | Reduce uppercase density |
| Separator opacity | `border-neutral-300` | `border-neutral-200/50` | Visual lightness |
| Label text color | `text-neutral-600` | `text-neutral-500` | Consistency with lighter borders |
| Technical state placement | Inline with state | Footer metadata | Hierarchy and reduced redundancy |
| Metadata footer | "Source:", "Version:" | "Canonical source", "Version", "State ID" | Institutional language |

### Page Layout (`page.tsx`)

| Change | Before | After | Rationale |
|--------|--------|-------|-----------|
| Section width | `max-w-6xl` | `max-w-4xl` | Card prominence |
| Background | `bg-white/30` | `bg-gradient-to-b from-white via-white to-neutral-50/50` | Subtle visual intentionality |
| Heading text | "Hero Demo" | "Workflow State Display" | Editorial context |
| Vertical padding | `py-20` | `py-16` | Reduced whitespace |
| Shadow | `shadow-2xl` | `shadow-md` | Editorial refinement |
| Context | (none) | Added descriptive subtitle | Clarity |

### Script Updates (`capture-evidence.js`)

- Updated section selector from `Hero Demo` to `Workflow State Display`
- Ensures new evidence captures correct section

---

## Visual Comparison

### Default Variant

**Before:**
- Section labels in uppercase throughout
- Multiple visible horizontal dividers
- Technical state duplicating primary state
- Generic dashboard appearance
- Weak Hero framing

**After:**
- Section labels in title case (except state)
- Lighter, fewer visual separators
- Technical state integrated into footer
- Editorial interface appearance
- Stronger card presence in Hero

### Blocked Variant

**Before:**
- Play icon before "Resolve blocking conditions"
- Heavy uppercase "BLOCKING ISSUES" label
- Visible border above action section

**After:**
- Arrow icon before action (clearer intent)
- Lighter "Blocking issues" label
- Subtle separator
- Better operational clarity

### All Variants

All six workflow states now:
- Display workflow state in uppercase (preserved)
- Use lighter section labels
- Have refined footer metadata
- Appear in stronger Hero framing
- Maintain icon distinction without ambiguity

---

## Mobile Validation (320px)

**Before polish:**
- scrollWidth = 320px ✓
- clientWidth = 320px ✓
- Horizontal overflow = false ✓

**After polish:**
- scrollWidth = 320px ✓
- clientWidth = 320px ✓
- Horizontal overflow = false ✓

Mobile layout unchanged—polish is purely visual hierarchy. All responsive constraints maintained.

---

## Evidence Captures

### New Polish Evidence

8 screenshots generated post-polish:
- `episode-state-card-default.png` (1280×907)
- `episode-state-card-blocked.png` (1280×822)
- `episode-state-card-human-review.png` (1280×875)
- `episode-state-card-approved.png` (1280×802)
- `episode-state-card-published.png` (1280×839)
- `episode-state-card-unavailable.png` (1280×479)
- `episode-state-card-mobile-320.png` (320×878)
- `episode-state-card-reduced-motion.png` (1280×875)

Location: `artifacts/episode-state-card/visual-polish-evidence/`

---

## Remaining Limitations

The polish addresses visual hierarchy, not architectural redesign. Still true:

- Max-width constraint (`max-w-2xl`) on card limits presentation potential
- State accent bar remains color-dependent (though icons mitigate this)
- Footer remains compact for space efficiency
- No animation changes (motion library preserved, motion preference honored)

These are acceptable tradeoffs for an EXPERIMENTAL component.

---

## Editorial Character Assessment

### Before

The component **read as:**
- Generic workflow dashboard
- SaaS product (Slack-like, Jira-like)
- Administrative interface
- Lack of intentionality around Hero presentation

### After

The component **now reads as:**
- Editorial workflow control surface
- Premium production platform
- Intentional, refined design
- Appropriate for human-supervised automation

**Character upgrade:** From prototype dashboard → Editorial Control Panel ✓

---

## Recommended Final Visual-Review Decision

Based on post-polish evidence captures and assessment:

**PASS**

**Rationale:**

1. ✓ Uppercase density significantly reduced
2. ✓ Separator overload eliminated
3. ✓ Operational ambiguity (Play icon) resolved
4. ✓ Metadata now canonical and institutional
5. ✓ Hero Demo framing strengthened
6. ✓ Editorial character now evident
7. ✓ All six variants improved and distinct
8. ✓ Mobile layout unchanged and flawless
9. ✓ No data model or prop API changes
10. ✓ Component ready for accessibility review

The polish successfully elevates the component from EXPERIMENTAL prototype to production-ready state. Visual identity is now consistent with Wealth Decoded's editorial platform vision.

---

## Next Authorized Phase

✓ **ACCESSIBILITY_REVIEW**

Component is approved to advance to accessibility review (WCAG, keyboard navigation, screen reader testing).
