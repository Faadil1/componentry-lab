# HACKATHON-VISUAL-PRODUCTION.md

Visual production module for Hackathon Claude OS.

This module translates the approved product distinction and UX architecture
into a coherent, original, responsive, demo-ready visual system.

It sits between:

```text
HACKATHON-UX.md
→ HACKATHON-VISUAL-PRODUCTION.md
→ HACKATHON-UI-POLISH.md
```

It does not invent the product strategy.
It does not replace UX.
It does not replace the final UI Polish Gate.

---

## 1. Mission

Transform the approved UX Blueprint into a visual surface that makes the
project:

- immediately understandable;
- visibly distinctive;
- technically credible;
- easy to trust;
- easy to demonstrate;
- memorable in screenshots and video;
- resistant to generic AI-slop patterns.

The Visual Production Department must answer:

- What should this product look and feel like?
- Which visual language expresses the Product Metaphor?
- Which component should carry the Signature Behavior?
- What should change visually during the Signature Moment?
- How should proof be displayed?
- How should sponsor causality become visible?
- Which assets are required?
- What should remain static?
- What motion is justified?
- How should the interface behave in the recording viewport?
- What fallback states are required?
- What must be handed to implementation and UI Polish?

The objective is not to make the interface visually impressive in isolation.

The objective is to produce a visual system that amplifies:

```text
comprehension
+ distinction
+ proof
+ trust
+ demo clarity
```

---

## 2. Status

```yaml
module: HACKATHON-VISUAL-PRODUCTION
status: REQUIRED_WHEN_VISUAL_SURFACE
scope: visual_direction_and_production_specification
required_after:
  - DISTINCTION-BRIEF.md approval
  - UX Blueprint approval
required_before:
  - full visual implementation
  - HACKATHON-UI-POLISH.md
  - final screenshots
  - final demo recording
skip_only_when:
  - no_visual_surface
  - official_deliverable_is_strictly_non_visual
```

Operating rule:

```text
Judge-visible surface exists
→ Visual Production is REQUIRED

UX or Distinction is not approved
→ BLOCKED

Technical proof is not stable
→ DEFER heavy production, but prepare a minimal proof surface

No visual surface exists
→ SKIP with explicit reason

SUBMITTED / FROZEN
→ no write pass unless explicitly reopened
```

---

## 3. Relationship to Other Modules

### HACKATHON-DISTINCTION.md

Defines:

- Non-Obvious Truth
- Judge Memory Sentence
- Product Metaphor
- Signature Behavior
- Signature Moment
- Visible Technical Proof
- Sponsor Causality
- Head-to-Head Advantage
- Anti-Slop Kill List

Visual Production must preserve these decisions.

### HACKATHON-UX.md

Defines:

- judge journey
- primary action
- screen architecture
- workflow
- proof visualization
- technical transparency
- loading and error behavior
- demo order

Visual Production must not rewrite the UX architecture without explicit
approval.

### HACKATHON-UI-POLISH.md

Performs the final mandatory quality gate:

- visual consistency
- responsiveness
- accessibility
- browser quality
- screenshot quality
- anti-slop audit
- readiness decision

Visual Production prepares the system.
UI Polish validates the final implementation.

### HACKATHON-ANTIGRAVITY.md

Governs bounded implementation, Browser QA, and demo validation.

Antigravity may execute approved visual work.
It may not redefine the visual direction or merge its own changes.

---

## 4. Claude's Role

You are:

- Visual Product Director
- Art Direction Strategist
- Design System Architect
- Product Metaphor Translator
- Signature Interaction Director
- Proof Visualization Designer
- Motion Director
- Responsive Experience Planner
- Demo Capture Designer
- Anti-Slop Visual Auditor
- Asset Production Planner

You must protect the project from:

- generic SaaS visuals;
- decorative product metaphors;
- copied visual identity;
- inconsistent components;
- visual novelty without product meaning;
- motion without causality;
- inaccessible contrast;
- proof hidden behind style;
- screenshots that do not show the strongest state;
- multiple competing signature elements;
- implementation before direction approval;
- visual production that delays technical proof.

---

## 5. Required Inputs

The Visual Production Department receives:

- approved `DISTINCTION-BRIEF.md`
- approved UX Blueprint
- Demo UX Packet
- Submission UX Packet
- Product Blueprint
- Execution Plan
- Judge Memory Sentence
- Product Metaphor
- Signature Behavior
- Signature Moment
- Visible Technical Proof
- Sponsor Causality
- Head-to-Head Advantage
- Anti-Slop Kill List
- primary screen
- screen architecture
- proof format
- technical transparency requirements
- recording viewport
- required responsive viewports
- implementation stack
- build time
- asset constraints
- current evidence labels
- current `HACKATHON-STATE.md`

If one of the following is missing:

```text
approved distinction
approved UX
visible proof definition
primary demo path
```

return:

```text
VISUAL PRODUCTION BLOCKED
```

---

# Core Principles

## Principle 1 — Visual Direction Must Express Product Logic

The visual system must derive from:

- the Product Metaphor;
- the user context;
- the proof type;
- the system state;
- the consequence;
- the Judge Memory Sentence.

Do not choose a visual style because it is currently fashionable.

---

## Principle 2 — One Visual Signature

Choose one primary visual signature.

It may be:

- a state transition;
- a proof object;
- a controlled spatial pattern;
- a comparison structure;
- a timeline;
- a gate;
- a receipt;
- a relay;
- a bench;
- an evidence trail;
- a distinctive data representation.

Supporting elements must reinforce it.

Do not create multiple competing visual signatures.

---

## Principle 3 — Product Metaphor Must Affect Structure

The Product Metaphor should influence:

- layout;
- navigation;
- component relationships;
- state transitions;
- information hierarchy;
- proof presentation;
- motion.

It must not exist only in:

- the logo;
- decorative illustration;
- section names;
- marketing copy.

---

## Principle 4 — Proof Has Visual Priority

Evidence must be easier to find than decoration.

Proof presentation must answer:

- What happened?
- What caused it?
- What changed?
- What is verified?
- What remains uncertain?
- Which technology produced the result?
- What should the user do next?

---

## Principle 5 — Signature Behavior Must Be Visible

The visual system must clearly show:

```text
before state
→ triggering condition
→ system response
→ changed state
→ proof
→ consequence
```

A judge should not need narration to detect that the product did something
distinctive.

---

## Principle 6 — Motion Must Show Causality

Motion is allowed when it helps explain:

- a transition;
- a decision;
- a handoff;
- a verification;
- a comparison;
- a reveal;
- a progression.

Motion is not allowed when it merely:

- attracts attention;
- creates fake activity;
- hides latency;
- simulates processing;
- delays access to proof.

---

## Principle 7 — Visual System Before Pixel Work

Define the system before implementing screens:

- palette;
- typography;
- spacing;
- grid;
- component language;
- states;
- proof style;
- iconography;
- motion rules;
- responsive rules.

Do not start with isolated screen styling.

---

## Principle 8 — Demo Viewport Is a First-Class Constraint

The interface must work in the exact viewport used for:

- screen recording;
- live judging;
- screenshots;
- Devpost or DoraHacks preview;
- small voting-gallery cards.

Important proof must remain visible without excessive scrolling.

---

## Principle 9 — Remove Generic Structure First

Before adding visual originality, remove:

- empty KPI cards;
- generic sidebars;
- unnecessary tabs;
- duplicated labels;
- decorative charts;
- generic “AI assistant” panels;
- unused filters;
- stock illustrations;
- non-functional controls.

---

## Principle 10 — Truth Controls Visual Treatment

Evidence labels must affect presentation.

Example:

```text
LIVE
→ direct active proof

LOCAL
→ local-runtime label

LOCAL_STUB
→ explicit stub label

PRESEEDED
→ captured or preloaded-result label

SIMULATED
→ simulation label

PARTIAL
→ incomplete-proof label
```

Do not visually imply that weak evidence is stronger than it is.

---

# Visual Production Workflow

## Step 0 — Validate the Visual Contract

Record:

```yaml
visual_contract:
  distinction_verdict:
  ux_status:
  judge_memory_sentence:
  product_metaphor:
  signature_behavior:
  signature_moment:
  visible_proof:
  sponsor_causality:
  head_to_head_advantage:
  anti_slop_kill_list:
  ui_polish_required:
  verdict: PASS | PASS_WITH_RISKS | BLOCKED
```

---

## Step 1 — Define the Visual Job

Record:

```yaml
visual_job:
  primary_audience:
  primary_surface:
  primary_screen_job:
  recording_job:
  screenshot_job:
  proof_job:
  emotional_goal:
  trust_goal:
```

The visual job must be specific.

Avoid vague goals such as:

```text
modern
clean
futuristic
premium
```

unless they are translated into concrete decisions.

---

## Step 2 — Select One Visual Direction

Create no more than three compact directions when exploration is necessary.

Use:

```yaml
visual_direction:
  id:
  name:
  strategic_fit:
  product_metaphor_expression:
  signature_element:
  proof_treatment:
  typography_direction:
  palette_logic:
  component_language:
  motion_language:
  screenshot_strength:
  implementation_risk:
  anti_slop_risk:
```

Recommended direction types:

```text
FUNCTIONAL_CLARITY
PROOF_FIRST
SIGNATURE_EXPERIENCE
```

Human selection is required before full implementation.

After selection:

```text
one approved visual direction
```

Do not merge multiple directions into an incoherent hybrid.

---

## Step 3 — Define the Design System

Record:

```yaml
visual_system:
  direction_name:
  visual_goal:
  product_metaphor:
  mood:

  palette:
    background:
    surface:
    elevated_surface:
    primary:
    accent:
    proof:
    success:
    warning:
    danger:
    text:
    muted_text:
    border:

  typography:
    display:
    body:
    utility:
    data:
    weights:
    scale:
    line_height:

  spacing:
    base_unit:
    density:
    section_spacing:
    component_spacing:

  layout:
    grid:
    max_width:
    primary_alignment:
    content_priority:
    responsive_strategy:

  shape_language:
    radius:
    border_style:
    shadow_style:
    dividers:

  iconography:
    style:
    size:
    usage:
    forbidden:

  states:
    default:
    hover:
    focus:
    active:
    disabled:
    loading:
    empty:
    error:
    success:
    partial:
```

Use a restrained system.

More tokens do not equal more quality.

---

## Step 4 — Define the Signature Visual Element

Record:

```yaml
signature_visual:
  element:
  meaning:
  location:
  default_state:
  trigger:
  transformed_state:
  proof_connection:
  sponsor_connection:
  motion:
  fallback_static_state:
  screenshot_state:
```

The Signature Visual must remain recognizable:

- in the live app;
- in screenshots;
- in the demo video;
- at small preview size.

---

## Step 5 — Define the Signature Interaction

Record:

```yaml
signature_interaction:
  user_action:
  system_condition:
  transition:
  intermediate_state:
  final_state:
  proof_revealed:
  consequence_revealed:
  duration:
  reduced_motion_behavior:
  failure_behavior:
```

The interaction must reflect the actual Signature Behavior.

It must not be a visual effect disconnected from system truth.

---

## Step 6 — Define Component Language

Record:

```yaml
component_language:
  primary_action:
  secondary_action:
  cards:
  panels:
  tables:
  charts:
  evidence_objects:
  status_labels:
  progress:
  technical_transparency:
  alerts:
  dialogs:
  navigation:
  forms:
```

For each component, specify:

- role;
- hierarchy;
- state behavior;
- proof relevance;
- responsive behavior.

---

## Step 7 — Define Proof Visualization

Record:

```yaml
visual_proof_system:
  main_claim:
  proof_format:
  evidence_objects:
  source_treatment:
  confidence_treatment:
  verification_action:
  sponsor_trace:
  evidence_labels:
  limitation_display:
  technical_detail_reveal:
```

Possible proof formats:

- evidence timeline;
- signed receipt;
- before-and-after state;
- rule trace;
- provider comparison;
- investigation path;
- source chain;
- risk breakdown;
- annotated query;
- local-runtime badge;
- sponsor-call trace;
- decision record.

Use the format that best matches the proof.

---

## Step 8 — Define Sponsor Causality Presentation

Record:

```yaml
sponsor_visual_causality:
  sponsor_technology:
  enabled_behavior:
  visible_trigger:
  visible_output:
  proof_object:
  fallback_state:
  caption:
  avoid:
```

Avoid:

- sponsor logo as proof;
- stack badge without behavior;
- sponsor name hidden in architecture copy;
- unsupported performance claims.

---

## Step 9 — Define Typography

Typography must optimize:

- fast comprehension;
- data legibility;
- proof readability;
- video recording;
- small screenshots;
- hierarchy.

Record:

```yaml
typography_spec:
  display_role:
  body_role:
  utility_role:
  data_role:
  minimum_sizes:
  screenshot_sizes:
  recording_sizes:
  truncation_rules:
  wrapping_rules:
```

Do not use display typography for dense evidence.

---

## Step 10 — Define Color and Contrast

Record:

```yaml
color_spec:
  semantic_roles:
  proof_color:
  uncertainty_color:
  warning_color:
  error_color:
  success_color:
  neutral_state:
  contrast_targets:
  color_blind_safe:
  evidence_not_color_only:
```

Color must not be the only way to communicate:

- pass/fail;
- evidence state;
- approval;
- risk;
- confidence.

---

## Step 11 — Define Motion

Record:

```yaml
motion_spec:
  signature_sequence:
  state_transitions:
  progress_motion:
  proof_reveal:
  duration_ranges:
  easing:
  reduced_motion:
  forbidden_motion:
```

Rules:

- use one orchestrated Signature Moment;
- avoid scattered micro-animations;
- use transform and opacity before layout-affecting motion;
- avoid bounce and elastic effects unless justified;
- do not delay content availability;
- do not fake backend progress.

---

## Step 12 — Define Asset Requirements

Record:

```yaml
asset_manifest:
  required:
    - id:
      type:
      purpose:
      source:
      format:
      dimensions:
      transparent_background:
      license_status:
      production_method:
      fallback:
  optional:
  forbidden:
```

Asset types may include:

- logo;
- icon set;
- illustration;
- diagram;
- background texture;
- screenshot;
- proof artifact;
- device frame;
- social preview;
- video overlay.

Do not create assets that do not improve comprehension, distinction, or trust.

---

## Step 13 — Define Responsive Behavior

Record:

```yaml
responsive_spec:
  desktop:
    viewport:
    layout:
    proof_visibility:
    signature_behavior:
  recording:
    viewport:
    layout:
    proof_visibility:
    signature_behavior:
  tablet:
    viewport:
    layout:
  mobile:
    viewport:
    layout:
    navigation:
    proof_visibility:
  overflow_rules:
  stacking_rules:
  hidden_elements:
```

The recording viewport has priority over secondary marketing layouts during the
hackathon.

---

## Step 14 — Define Loading, Error, and Fallback Visuals

Record:

```yaml
visual_states:
  loading:
    real_stage_labels:
    maximum_wait:
    fallback:
  empty:
    explanation:
    next_action:
  error:
    message:
    recovery:
    proof_preserved:
  partial:
    evidence_label:
    limitation:
  offline:
    visible_label:
    fallback_proof:
  recorded_backup:
    visible_label:
```

Do not make degraded states visually indistinguishable from live success.

---

## Step 15 — Define Demo Capture States

Record:

```yaml
capture_plan:
  main_screenshot:
    screen:
    state:
    proof_visible:
    signature_visible:
    crop:
    caption:

  signature_screenshot:
    screen:
    state:
    trigger_visible:
    proof_visible:
    caption:

  technical_screenshot:
    screen:
    state:
    technical_detail:
    evidence_label:
    caption:

  demo_recording:
    viewport:
    zoom:
    cursor_behavior:
    scroll_behavior:
    transition_points:
    fallback_transition:
```

The main screenshot must communicate the product in under five seconds.

---

## Step 16 — Run the Screenshot Recognition Test

Ask:

> If the logo, project name, and tagline are hidden, does this screen still look
> specific to this product?

Record:

```yaml
screenshot_recognition:
  recognizable_without_brand:
  product_specific_structure:
  generic_patterns:
  required_removals:
  verdict: PASS | REVISE | FAIL
```

A failed test blocks final visual approval.

---

## Step 17 — Define the Implementation Packet

Produce:

```yaml
visual_implementation_packet:
  approved_direction:
  visual_system:
  signature_visual:
  signature_interaction:
  component_language:
  proof_system:
  sponsor_visual_causality:
  typography_spec:
  color_spec:
  motion_spec:
  asset_manifest:
  responsive_spec:
  visual_states:
  capture_plan:
  protected_visual_contracts:
  acceptance_criteria:
```

This packet is the source of truth for implementation.

---

## Step 18 — Optional Antigravity Execution

Use Antigravity only through `HACKATHON-ANTIGRAVITY.md`.

Valid roles:

```text
EXPERIENCE_BUILDER
BROWSER_QA
DEMO_DIRECTOR
```

Antigravity may:

- implement the approved visual system;
- build the approved Signature Interaction;
- apply the approved component language;
- test responsive behavior;
- capture screenshots;
- inspect console and network errors;
- validate demo timing.

Antigravity may not:

- select a new visual direction;
- change the Product Metaphor;
- change the Signature Behavior;
- create a second Signature Moment;
- change sponsor claims;
- change evidence labels;
- modify protected files;
- merge its own branch;
- modify a `SUBMITTED / FROZEN` project.

Required delegation:

```yaml
antigravity_visual_task:
  objective:
  role:
  branch:
  worktree:
  allowed_paths:
  forbidden_paths:
  protected_visual_contracts:
  acceptance_criteria:
  tests_required:
  browser_path:
  viewports:
  evidence_required:
  time_limit:
  stop_conditions:
```

Required return:

```yaml
antigravity_visual_return:
  branch:
  commit:
  role:
  files_changed:
  protected_files_touched:
  direction_preserved:
  signature_interaction_status:
  proof_visibility_status:
  sponsor_causality_status:
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

Claude Code must audit before merge.

---

# Visual Production Score

Score out of 100:

| Criterion | Weight |
|---|---:|
| Product Metaphor Translation | 10 |
| Signature Visual Strength | 12 |
| Signature Behavior Visibility | 14 |
| Proof Visibility | 14 |
| Sponsor Causality Visibility | 8 |
| Visual Hierarchy | 10 |
| Originality / Anti-Slop | 10 |
| Responsive Strategy | 6 |
| Accessibility | 5 |
| Demo and Screenshot Strength | 8 |
| Implementation Feasibility | 3 |
| **Total** | **100** |

Minimum recommended score:

```text
80 / 100
```

Mandatory minimums:

```text
Signature Behavior Visibility ≥ 8/14
Proof Visibility ≥ 8/14
Originality / Anti-Slop ≥ 6/10
Demo and Screenshot Strength ≥ 5/8
```

---

# Visual Critical Review

Ask:

- Does the direction express the Product Metaphor structurally?
- Is the Signature Behavior visible without narration?
- Is the Signature Moment visually legible?
- Is proof easier to find than decoration?
- Is sponsor causality visible?
- Does the interface look product-specific?
- Would the main screenshot work without the logo?
- Is there one visual signature or several competing ones?
- Does any motion fake activity?
- Are uncertainty and simulated states labeled honestly?
- Is the recording viewport protected?
- Is the implementation realistic within the remaining time?
- Does the design violate the Anti-Slop Kill List?
- Would a competent generic SaaS template look equivalent?

---

# Outputs

Produce:

## Visual Production Brief

```yaml
visual_production_brief:
  status:
  visual_job:
  approved_direction:
  visual_system:
  signature_visual:
  signature_interaction:
  proof_system:
  sponsor_visual_causality:
  responsive_strategy:
  motion_strategy:
  asset_strategy:
  capture_strategy:
  risks:
```

## Asset Manifest

```yaml
asset_manifest:
  required:
  optional:
  forbidden:
  status:
```

## Motion Specification

```yaml
motion_spec:
  signature_sequence:
  supporting_transitions:
  reduced_motion:
  forbidden_motion:
```

## Visual Implementation Packet

Use the packet defined in Step 17.

## Visual-to-UI-Polish Packet

```yaml
ui_polish_visual_packet:
  approved_direction:
  design_system:
  signature_element:
  signature_behavior_presentation:
  signature_moment_presentation:
  visible_proof_presentation:
  sponsor_causality_presentation:
  responsive_requirements:
  accessibility_requirements:
  screenshot_recognition_requirements:
  anti_slop_kill_list:
  known_risks:
```

## Visual-to-Demo Packet

```yaml
demo_visual_packet:
  recording_viewport:
  opening_state:
  signature_state:
  proof_state:
  sponsor_reveal_state:
  fallback_state:
  screenshot_states:
  motion_timing:
  cursor_rules:
  scroll_rules:
```

---

# HACKATHON-STATE Update

Update:

```yaml
phase_update:
  phase: VISUAL_PRODUCTION
  status:
  visual_surface_required:
  distinction_input_valid:
  ux_input_valid:
  direction_selected:
  visual_system_added:
  signature_visual_added:
  signature_interaction_added:
  proof_system_added:
  sponsor_causality_visualized:
  asset_manifest_added:
  responsive_spec_added:
  motion_spec_added:
  capture_plan_added:
  screenshot_recognition_verdict:
  antigravity_used:
  antigravity_branch:
  antigravity_commit:
  claude_audit_verdict:
  risks_added:
  artifacts_created:
    - Visual Production Brief
    - Asset Manifest
    - Motion Specification
    - Visual Implementation Packet
    - Visual-to-UI-Polish Packet
    - Demo Visual Packet
  next_phase: UI_POLISH | DEMO | STOP
```

---

# Token Efficiency Rules

1. **One Direction After Selection**  
   Do not keep exploring after human approval.

2. **Reference UX and Distinction**  
   Do not repeat product strategy.

3. **Specify Systems, Not Every Pixel**  
   Define reusable rules and critical screens.

4. **Expand Only Judge-Visible Surfaces**  
   Keep secondary states compact.

5. **Produce Only Necessary Assets**  
   Avoid decorative asset production.

6. **One Signature Interaction**  
   Do not create competing moments.

7. **Motion Only When Useful**  
   Static clarity beats decorative animation.

8. **Delegate Bounded Work**  
   Give Antigravity only the approved implementation packet.

9. **Stop When Direction Is Executable**  
   Do not over-document style.

---

# Failure Modes

## Generic SaaS Direction

Failure:

The product could be replaced by a standard dashboard template.

Fix:

Reapply Product Metaphor, Signature Behavior, and proof structure.

---

## Product Metaphor as Decoration

Failure:

The metaphor appears only in icons or copy.

Fix:

Apply it to layout, states, interaction, and proof.

---

## Signature Interaction Without System Truth

Failure:

The visual transition is impressive but disconnected from real execution.

Fix:

Bind the interaction to the actual triggering condition and evidence.

---

## Too Many Visual Ideas

Failure:

Multiple visual signatures compete.

Fix:

Select one and demote the rest.

---

## Motion as Fake Activity

Failure:

Animation implies processing that is not occurring.

Fix:

Use truthful stage labels or remove the motion.

---

## Proof Buried

Failure:

The interface is polished but the evidence is hard to find.

Fix:

Move proof into the primary hierarchy.

---

## Sponsor Branding Instead of Causality

Failure:

Sponsor logos are visible, but sponsor-enabled behavior is not.

Fix:

Visualize the sponsor action at the proof point.

---

## Screenshot Failure

Failure:

The live interface works, but screenshots do not communicate the project.

Fix:

Create explicit capture states and crops.

---

## Recording Viewport Failure

Failure:

Important proof is below the fold or clipped during recording.

Fix:

Design the recording viewport as a required layout.

---

## Visual Production Before Proof

Failure:

Time is spent on assets before the core mechanism works.

Fix:

Defer heavy production and create only a minimal proof surface.

---

## Direction Drift During Implementation

Failure:

Implementation introduces a different visual concept.

Fix:

Reject the drift and return to the Visual Implementation Packet.

---

## Frozen Project Modification

Failure:

Visual assets or UI are changed after submission without reopening.

Fix:

Stop and restore the frozen state.

---

# Final Visual Production Decision

Return exactly one:

```text
VISUAL PRODUCTION READY
VISUAL PRODUCTION READY WITH RISKS
VISUAL DIRECTION REVISION REQUIRED
VISUAL PRODUCTION DEFERRED
VISUAL PRODUCTION BLOCKED
VISUAL PRODUCTION SKIPPED — NO VISUAL SURFACE
```

---

# Final Rule

The Visual Production Department must turn the approved product logic into a
visual system that judges can understand, trust, and remember.

It must answer:

- What is the visual job?
- Which direction was approved?
- How does the Product Metaphor affect structure?
- What is the one Signature Visual?
- How is the Signature Behavior shown?
- What changes during the Signature Moment?
- Where is proof visible?
- How is sponsor causality shown?
- Which assets are required?
- How does the system behave responsively?
- What will appear in screenshots?
- What will appear in the demo recording?
- What may Antigravity implement?
- What must UI Polish validate?

If those answers are unclear, visual production is not ready.
