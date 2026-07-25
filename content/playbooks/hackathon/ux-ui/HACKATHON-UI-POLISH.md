# HACKATHON-UI-POLISH.md

Mandatory conditional UI polish module for Hackathon Claude OS.

This module improves the visual quality, clarity, credibility, distinction, and
submission-readiness of hackathon demos, landing pages, app interfaces,
screenshots, portfolio pages, and demo videos.

It is not an independent core phase. It is a required completion gate whenever
the project has a judge-visible surface.

It must never delay technical proof, evidence collection, or the core happy
path. When proof is incomplete, this module is DEFERRED — not permanently
skipped.

---

## 1. Status

```yaml
module: HACKATHON-UI-POLISH
status: REQUIRED_WHEN_VISUAL_SURFACE
scope: visual_surface_and_submission_assets
required_before:
  - final screenshots
  - demo video recording
  - public landing page submission
  - app UI submission
  - portfolio case study publishing
skip_only_when:
  - no_visual_surface
  - official_deliverable_is_strictly_non_visual
```

Operating rule:

```text
Visual surface exists
→ REQUIRED

Proof or UX is not stable
→ DEFERRED, then resumed before submission

No visual surface exists
→ SKIP with explicit reason

SUBMITTED / FROZEN
→ no write pass unless explicitly reopened
```

---

## 2. Relationship to UX and Distinction

`HACKATHON-UX.md` defines:

- judge journey
- primary action
- screen architecture
- Signature Behavior
- Signature Moment
- proof visualization
- technical transparency
- recovery states

`HACKATHON-UI-POLISH.md` makes the approved experience:

- visually clear
- coherent
- accessible
- responsive
- product-specific
- screenshot-ready
- demo-ready
- resistant to AI slop

Required upstream inputs:

```text
approved DISTINCTION-BRIEF.md
UI Polish Handoff Packet (`ui_polish_handoff`)
approved UX Blueprint
approved Demo UX Packet
approved Visual-to-UI-Polish Packet
current HACKATHON-STATE.md
working visual surface
truthful evidence state
```

If Distinction or UX is missing:

```text
UI POLISH → BLOCKED
```

UI Polish must not invent a new product strategy or a second Signature Moment.

---

## 3. When to Use

Use this module whenever the project includes a visual surface:

- landing page
- demo page
- portfolio case study
- SaaS-style UI
- app UI
- dashboard
- Bubble, Figma, React, or web frontend
- mobile or desktop app screen
- pitch screenshots
- final demo video
- visual identity or brand system
- browser-based proof
- visual CLI recording
- README hero assets

For most hackathon submissions, this means the module is required.

---

## 4. When to Skip, Defer, or Block

### SKIP

Skip only when:

- no visual surface exists;
- the official deliverable is strictly backend, API, library, or text-only;
- no screenshot, video, interface, or visual proof will be judged.

Record:

```yaml
ui_polish:
  status: SKIP
  reason: NO_VISUAL_SURFACE
```

### DEFER

Defer when:

- the project is in early technical validation;
- the core proof is not working;
- a live API, runtime, or gateway blocker remains;
- the UX is not approved;
- polishing would threaten the happy path.

Record:

```yaml
ui_polish:
  status: DEFERRED
  resume_condition:
```

If a visual surface exists, DEFERRED must be resolved before final readiness.

### BLOCKED

Block when:

- approved Distinction input is missing;
- approved UX input is missing;
- proof cannot be represented honestly;
- visual changes would misrepresent the working state.

### PROHIBITED

Do not run a write pass when the project is `SUBMITTED / FROZEN`, unless an
explicit reopen condition exists.

---

## 5. Core Principle

The goal is not decoration.

The goal is to make the product easier to:

- understand
- trust
- judge
- remember
- verify
- compare favorably

Ask:

> Does this visual surface make the product clearer, more credible, more
> distinctive, and more memorable without weakening truth?

Polish must amplify the approved Signature Behavior.

It must not decorate a generic interface.

---

## 6. Mandatory Outcomes

A completed UI polish pass must produce:

1. compact design system;
2. one product-specific visual signature;
3. clear hierarchy toward the primary action;
4. clear hierarchy toward the Signature Moment;
5. visible and honest technical proof;
6. coherent loading, empty, success, error, and degraded states;
7. responsive behavior;
8. accessible interaction states;
9. clean submission screenshots;
10. anti-slop audit;
11. browser validation;
12. readiness verdict.

---

## 7. Anti-Slop Design Principles

Ground the design in:

- project subject
- target audience
- Product Metaphor
- Judge Memory Sentence
- Signature Behavior
- page or screen job
- evidence type

Do not default to:

- purple-blue gradients
- generic card grids
- centered SaaS hero layouts
- random dark-mode glows
- generic chat sidebars
- three KPI cards above the fold
- robot, brain, spark, or generic shield icons
- empty bento layouts
- fake activity counters
- unexplained confidence scores
- excessive glassmorphism
- generic “AI-powered” copy
- animations that imitate real execution

Define before implementation:

- colors
- typography
- spacing
- component style
- state language
- proof language
- signature visual element
- motion boundary

Spend boldness in one place only.

Structure must encode:

- user state
- system state
- consequence
- proof
- next action

Motion must clarify causality or state change. It must not simulate technical
work, hide latency, or distract from proof.

Copy must be specific, active, short, and product-native.

Polish must include:

- default
- hover
- focus
- active
- disabled
- loading
- empty
- error
- success
- partial or degraded state

Accessibility must include:

- readable contrast
- visible focus
- sufficient target size
- responsive behavior
- reduced-motion support
- state communication beyond color alone

---

## 8. Distinction Alignment

Record before polishing:

```yaml
distinction_alignment:
  judge_memory_sentence:
  non_obvious_truth:
  product_metaphor:
  signature_behavior:
  signature_moment:
  visible_proof:
  sponsor_causality:
  head_to_head_advantage:
  anti_slop_kill_list:
```

Every major visual decision must support at least one:

```text
comprehension
signature behavior
proof
sponsor causality
head-to-head advantage
```

Remove visual elements with no clear contribution.

---

## 9. UI/UX Resource Stack

External references are optional inputs. The polish pass itself is mandatory
when a visual surface exists.

Use references to extract design logic, not to copy identity.

### Inspiration

```text
- curated.design
- Awwwards
- Dribbble
- Behance
- landing.love
- One Page Love
- saaspo.com
- mobbin.com
- rebrand.gallery
- component.gallery
- navbar.gallery
- cta.gallery
- appmotion.design
```

### UX Learning

```text
- UX Collective
- UX Planet
- UX Booth
- UXPin
- UX Mastery
- UX Designer Community
- Designmodo
```

### Production Resources

```text
- grainient.supply
- fontshare.com
- hugeicons.com
- bentogrids.com
- remove.bg
- klingai.com
- midjourney.com
- figmify.ai
```

Verify external tools before use. Do not install or purchase automatically.

### Agent-Readable Design References

```text
- getdesign.md
- styles.refero.design
```

Use:

1. identify project category;
2. choose two or three references;
3. extract palette, typography, layout, interaction, component language, and
   anti-patterns;
4. create an original direction.

### Optional Design Skills

```text
- frontend-design
- UI UX Pro Max
- theme-factory
- brand-guidelines
- figma-to-code
- image-to-code
- canvas-design
- brandkit
- skill-creator
```

Do not install automatically.

### Taste / Anti-Slop Skills

```text
- design-taste-frontend
- gpt-taste
- high-end-visual-design
- minimalist-ui
- industrial-brutalist-ui
- redesign-existing-projects
- imagegen-frontend-web
- imagegen-frontend-mobile
- brandkit
```

### Final Audit Stack

```text
1. critique
2. layout
3. typeset
4. clarify
5. harden
6. polish
7. audit
```

### Motion Stack

```text
- gsap-core
- gsap-timeline
- gsap-scrolltrigger
- gsap-react
- gsap-performance
- gsap-frameworks
```

Use one orchestrated moment, respect reduced motion, and prefer transform and
opacity over layout-affecting animation.

---

## 10. UI Polish Workflow

### Step 1 — Read Approved Inputs

Read:

- `DISTINCTION-BRIEF.md`
- UX Blueprint
- Demo UX Packet
- Submission UX Packet
- Visual-to-UI-Polish Packet
- current visual surface
- current evidence status

### Step 2 — Decide Status

```yaml
ui_polish_decision:
  status: APPLY | DEFER | SKIP | BLOCKED
  reason:
  resume_condition:
```

For a visual project near submission, expected status is `APPLY`.

### Step 3 — Audit Current Surface

Evaluate:

- comprehension
- hierarchy
- generic patterns
- proof visibility
- Signature Behavior visibility
- sponsor causality visibility
- responsive behavior
- accessibility
- demo suitability

### Step 4 — Remove Generic Structure

Remove elements that:

- do not support the demo;
- do not support proof;
- do not support the primary action;
- duplicate information;
- make the interface interchangeable.

### Step 5 — Define the Design System

Use the template in Section 12.

### Step 6 — Polish the Signature Path First

Priority:

```text
Primary action
→ Signature Behavior
→ Signature Moment
→ Visible proof
→ Consequence
→ Next action
```

Do not polish secondary screens first.

### Step 7 — Complete All States

Implement and review:

- loading
- empty
- success
- error
- degraded
- partial
- disabled
- recovery

### Step 8 — Validate Responsive and Accessible Behavior

Test:

- main desktop viewport;
- recording viewport;
- mobile viewport when relevant;
- keyboard focus;
- reduced motion;
- text wrapping;
- proof legibility.

### Step 9 — Validate in Browser

Check:

- console errors
- network failures
- asset loading
- layout shifts
- overflow
- clipping
- broken interactions
- animation timing
- Signature Moment timing

### Step 10 — Produce Submission Assets

Create:

- main screenshot;
- Signature Moment screenshot;
- visible proof screenshot;
- optional secondary screenshot;
- demo-safe visual path;
- screenshot captions.

### Step 11 — Run Final Audit

```text
critique
→ layout
→ typeset
→ clarify
→ harden
→ polish
→ audit
```

### Step 12 — Return Verdict

Return one:

```text
UI POLISH READY
UI POLISH READY WITH RISKS
UI POLISH REVISION REQUIRED
UI POLISH BLOCKED
UI POLISH SKIPPED — NO VISUAL SURFACE
```

---

## 11. Required Output

When running a UI polish pass, output:

1. Visual goal
2. Audience and page job
3. Current verdict
4. Distinction alignment
5. References to study
6. Design system
7. Signature visual element
8. Signature Behavior presentation
9. Proof presentation
10. Hero, navbar, and CTA direction when relevant
11. UX copy improvements
12. Motion recommendation
13. Accessibility checklist
14. Responsive and browser validation
15. Screenshot and demo checklist
16. What to remove
17. What to avoid
18. Evidence integrity check
19. Readiness verdict
20. Exact next action

---

## 12. Design System Mini-Template

```yaml
design_system:
  visual_goal:
  audience:
  page_job:
  product_metaphor:
  judge_memory_sentence:
  mood:

  colors:
    background:
    surface:
    primary:
    accent:
    success:
    warning:
    danger:
    text:
    muted_text:

  typography:
    display:
    body:
    utility:
    data:

  spacing:
    density:
    section_spacing:
    card_spacing:

  components:
    buttons:
    cards:
    nav:
    forms:
    charts:
    evidence:
    status:
    technical_transparency:

  states:
    loading:
    empty:
    error:
    success:
    partial:
    disabled:

  signature_element:
  signature_behavior_presentation:
  proof_presentation:
  motion:
  accessibility:
  avoid:
```

---

## 13. Antigravity Execution

Antigravity may execute UI polish through a bounded task under
`HACKATHON-ANTIGRAVITY.md`.

Valid roles:

```text
EXPERIENCE_BUILDER
BROWSER_QA
DEMO_DIRECTOR
```

Allowed:

- implement approved design-system changes;
- refine the Signature interaction;
- remove generic visual patterns;
- inspect responsive layouts;
- validate Chrome behavior;
- capture screenshots;
- create walkthrough evidence;
- report console and network issues.

Forbidden without explicit delegation:

- redefining approved UX;
- changing backend contracts;
- changing sponsor claims;
- changing evidence labels;
- modifying protected files;
- deploying to production;
- merging its own branch;
- touching a frozen project.

Required return:

```yaml
antigravity_ui_return:
  branch:
  commit:
  role:
  files_changed:
  protected_files_touched:
  screens_polished:
  signature_path_tested:
  proof_state_tested:
  responsive_viewports:
  accessibility_checks:
  console_errors:
  network_errors:
  screenshots:
  walkthrough:
  unresolved_issues:
  scope_deviations:
  merge_recommendation:
```

Claude Code audit is required before merge.

---

## 14. Pre-Submission UI Gate

### Clarity

- [ ] First screen explains context in 5 seconds.
- [ ] Main action is visible and specific.
- [ ] Demo path is obvious.
- [ ] Value proposition is not buried.
- [ ] Judge Memory Sentence is reinforced visually.

### Distinction

- [ ] Signature Behavior is visible.
- [ ] Signature Moment is recognizable.
- [ ] Product Metaphor affects structure.
- [ ] Main screenshot remains specific without the logo.
- [ ] UI does not look like a generic AI template.
- [ ] Anti-Slop Kill List is respected.

### Trust

- [ ] Evidence is visible.
- [ ] Sponsor causality is visible.
- [ ] Claims are not exaggerated.
- [ ] Simulated or partial evidence is labeled honestly.
- [ ] Screenshots match the working state.
- [ ] Confidence values have a method or are removed.

### Design

- [ ] Typography hierarchy is clear.
- [ ] Spacing is consistent.
- [ ] Components are coherent.
- [ ] One memorable visual signature exists.
- [ ] No component exists only to fill space.
- [ ] Motion supports meaning.

### UX

- [ ] Empty states are useful.
- [ ] Error states are understandable.
- [ ] Loading states are truthful.
- [ ] Buttons use active verbs.
- [ ] Navigation is clear.
- [ ] Flow is understandable.
- [ ] Recovery preserves confidence.

### Accessibility

- [ ] Text contrast is readable.
- [ ] Focus states are visible.
- [ ] Targets are large enough.
- [ ] Layout works at required viewports.
- [ ] Reduced motion is respected.
- [ ] State is not communicated only by color.

### Browser Quality

- [ ] No blocking console error.
- [ ] No critical network failure.
- [ ] No clipping or overflow.
- [ ] No broken asset.
- [ ] Signature timing works in the recording viewport.

### Submission

- [ ] Final screenshots are clean.
- [ ] Main screenshot shows the strongest state.
- [ ] Demo shows the strongest path first.
- [ ] Visible proof appears during the demo.
- [ ] No debug clutter is visible.
- [ ] No broken state appears.
- [ ] Evidence labels remain accurate.

---

## 15. Readiness Logic

```yaml
ui_polish_readiness:
  no_visual_surface: SKIP
  early_technical_phase: DEFER
  proof_missing: DEFER
  distinction_missing: BLOCKED
  ux_blueprint_missing: BLOCKED
  visual_surface_exists: REQUIRED
  visual_surface_affects_judging: REQUIRED
  final_submission_material_needed: REQUIRED
  submitted_or_frozen: PROHIBITED_UNLESS_REOPENED
```

Readiness rule:

```text
A project with a judge-visible surface cannot return READY
until the UI Polish Gate is complete or a documented risk is accepted.
```

Effects:

```text
UI POLISH READY
→ no readiness cap

UI POLISH READY WITH RISKS
→ READY WITH CONDITIONS

UI POLISH REVISION REQUIRED
→ NOT READY until corrected or explicitly accepted

UI POLISH BLOCKED
→ NOT READY

UI POLISH SKIPPED — NO VISUAL SURFACE
→ no readiness cap
```

---

## 16. HACKATHON-STATE Update

```yaml
ui_polish:
  status: NOT_STARTED | DEFERRED | IN_PROGRESS | READY | READY_WITH_RISKS | REVISION_REQUIRED | BLOCKED | SKIP | FROZEN
  required:
  reason:
  approved_design_system:
  signature_element:
  signature_behavior_visible:
  visible_proof_visible:
  sponsor_causality_visible:
  screenshot_recognition_verdict:
  responsive_status:
  accessibility_status:
  browser_validation_status:
  antigravity_used:
  antigravity_branch:
  antigravity_commit:
  claude_audit_verdict:
  final_screenshots:
  risks:
  exact_next_action:
  last_updated:
```

Update `HACKATHON-STATE.md` delta-only at session end.

---

## 17. Failure Modes

### Optional Forever

Failure:

The module is deferred repeatedly and never run before submission.

Fix:

A visual surface makes it required. Set a concrete resume condition.

### Pretty but Generic

Failure:

The interface is professional but interchangeable.

Fix:

Reapply Product Metaphor, Signature Behavior, and screenshot recognition.

### Polish Before Proof

Failure:

Visual work consumes time before the fragile mechanism works.

Fix:

Defer polish, prove the core, then resume the required pass.

### Proof Hidden by Design

Failure:

The surface is clean but credibility disappears.

Fix:

Restore visible proof with progressive disclosure.

### Sponsor Logo Instead of Causality

Failure:

Sponsor branding is present but its technical role is invisible.

Fix:

Expose the sponsor mechanism at the proof point.

### Fake Product Activity

Failure:

Animation or seeded content implies real execution.

Fix:

Label the state accurately or remove the misleading effect.

### Screenshot-Only Quality

Failure:

The screenshot looks good but the browser flow is fragile.

Fix:

Run browser validation on the real Signature path.

### Too Much Motion

Failure:

Animation competes with the outcome.

Fix:

Keep one orchestrated Signature Moment.

### Polished Frozen Project

Failure:

A submitted project is modified without a valid trigger.

Fix:

Revert or document an explicit reopen condition.

---

## 18. Final Rule

Do not make the UI prettier at the expense of truth.

For any judge-visible product, UI polish is a required completion gate.

A polished hackathon demo must still distinguish:

```text
LIVE
LOCAL_STUB
PRESEEDED
SIMULATED
PARTIAL
```

Visual polish supports:

```text
comprehension
+ distinction
+ proof
+ trust
+ memorability
```

It never replaces evidence.
