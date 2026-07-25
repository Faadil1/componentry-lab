# JUDGE-VISUAL-MOMENT.md

## Role inside Judge-Winning UI/UX System

This module adds a controlled “visual memory moment” layer to the Judge-Winning UI/UX System.

It is inspired by classic image algorithms and CRT-era web visuals:
- dithering
- ASCII
- pixelation
- bloom
- CRT scanlines
- terminal visuals
- lightweight shader / Canvas / WebGL effects

This module does **not** replace the core Judge-Winning UI/UX System.

It must never become a default style.

Its purpose is to help a judge understand, trust, and remember the project.

---

## Core rule

Use visual effects only when they point to the proof.

The UI should not say:

> “Look at this effect.”

It should say:

> “Look at this proof.”

---

## When to use this module

Use this module when a hackathon project already has:

1. A clear one-line promise
2. A visible problem tension
3. A simple 3-step flow
4. A working or honestly labeled proof path
5. Evidence cards
6. Honest limitations
7. Sponsor relevance

Only then add a visual memory moment.

Do not use this module to compensate for weak positioning, unclear proof, or missing evidence.

---

## Where this module fits in the system

Default Judge-Winning flow:

```text
Positioning
→ Judge path
→ Proof/evidence
→ Limitations
→ UI structure
→ Visual memory moment
→ Polish
→ Social launch
→ Portfolio packaging
```

The visual memory moment comes **after proof is defined** and **before final polish**.

---

## Trigger questions

Before applying this module, ask:

```yaml
does_the_effect_make_the_project_easier_to_understand: true/false
does_it_make_the_proof_more_visible: true/false
does_it_create_a_memorable_judge_moment: true/false
does_it_preserve_evidence_labels: true/false
does_it_avoid_making_stubbed_or_simulated_work_look_live: true/false
does_it_work_in_screenshots_and_video: true/false
does_it_remain_readable_on_mobile: true/false
```

If fewer than 5 are true, do not use the module.

---

## Required output before proposing visual effects

Before proposing any shader, CRT, ASCII, dithering, glow, or pixel effect, produce:

```yaml
one_line_promise: ""
problem_tension: ""
judge_memory_sentence: ""
x_post: ""
telegram_discord_post: ""
hero_headline: ""
demo_moment: ""
proof_evidence_moment: ""

visual_memory_candidate:
  effect_family: ""
  why_it_fits: ""
  what_it_points_to: ""
  proof_state_affected: ""
  risk_if_overused: ""
  recommended_intensity: "none | subtle | medium | hero"
```

If `recommended_intensity` is `none`, stop and do not add effects.

---

## Approved effect families

### 1. Dithering

Use when the project is about:

- noisy input becoming signal
- raw data becoming proof
- privacy-preserving transformation
- compression
- limited information
- local/edge processing
- old/new contrast

Best judge-facing use:

```text
Raw input → dithered/noisy transformation → clean result card → evidence badge
```

Good for:

- feedback analysis projects
- privacy projects
- image/data transformation tools
- evidence previews
- portfolio hero screenshots

Judge memory sentence pattern:

> “[Project] is the tool that turns noisy [input] into visible [proof/result].”

Avoid:

- making the result harder to read
- using dithering on body text
- presenting dithered decoration as evidence

---

### 2. ASCII / terminal rendering

Use when the project is about:

- agents
- verification
- logs
- signed receipts
- CLI-to-web bridge
- developer tools
- audit trails
- system status

Best judge-facing use:

```text
Action runs → ASCII/terminal receipt animates → final readable evidence card appears
```

Good for:

- proof receipts
- verification dashboards
- agent activity panels
- terminal-themed demos

Judge memory sentence pattern:

> “[Project] is the verification console that turns agent activity into a readable receipt.”

Avoid:

- unreadable terminal walls
- overusing monospace everywhere
- hiding the final result inside logs

---

### 3. CRT / scanline layer

Use when the project benefits from:

- retro-computing trust
- live instrumentation
- security/audit atmosphere
- terminal/device feel

Best judge-facing use:

```text
Subtle CRT treatment around evidence panel only
```

Good for:

- verification projects
- cybersecurity projects
- edge/local processing projects
- AI agent monitor dashboards

Avoid:

- full-page heavy CRT
- flicker
- distorted body text
- low contrast

---

### 4. Bloom / glow

Use when the project has a meaningful state change:

- proof verified
- risk blocked
- receipt signed
- result accepted
- live SDK call completed
- local verification completed
- failure detected

Best judge-facing use:

```text
Badge/status glow appears only when state changes
```

State rules:

```yaml
LIVE: "controlled green/blue glow"
LOCAL_VERIFIED: "subtle blue/teal glow"
LOCAL_STUB: "muted amber outline, no live glow"
SIMULATED: "muted purple/gray outline, no live glow"
PRESEEDED: "gray/amber badge, no live glow"
FAILED: "red outline or warning mark"
```

Never make `LOCAL_STUB`, `SIMULATED`, or `PRESEEDED` look live.

---

### 5. Pixelation

Use when the project is about:

- privacy
- redaction
- anonymization
- abstraction
- sensitive data
- before/after reveal

Best judge-facing use:

```text
Sensitive data pixelated → safe proof/result revealed
```

Good for:

- privacy tools
- compliance projects
- client data dashboards
- feedback analysis
- finance education visuals

Avoid:

- pixelating important evidence labels
- reducing trust by hiding too much
- using pixelation as generic background texture

---

## Visual memory moment patterns

### Pattern A — Noise to proof

Use for:
- AI insight projects
- feedback analysis
- data reduction
- research summaries

Flow:

```text
Raw messy input
→ dithered/noisy visual field
→ action button
→ clean result
→ readable evidence card
```

Copy:

```text
From noisy input to readable proof.
```

---

### Pattern B — Claim to receipt

Use for:
- verification
- signed proof
- agent auth
- audit systems

Flow:

```text
Claim enters
→ verification runs
→ receipt appears
→ pass/fail state shown
→ limitation stated nearby
```

Copy:

```text
A claim is only trusted after it becomes a receipt.
```

---

### Pattern C — Hidden risk revealed

Use for:
- fraud
- safety
- compliance
- monitoring

Flow:

```text
Normal-looking input
→ system scans
→ risk lights up
→ blocked or flagged result
→ evidence explains why
```

Copy:

```text
The risk was invisible until the system made it readable.
```

---

### Pattern D — Sensitive data protected

Use for:
- privacy
- local AI
- edge AI
- compliance

Flow:

```text
Sensitive input
→ pixelated/redacted preview
→ local/private processing
→ safe summary
→ evidence label
```

Copy:

```text
The value is extracted without exposing the raw data.
```

---

## Landing page integration

Default landing structure with this module:

```text
1. Hero
2. Problem tension
3. 3-step flow
4. Visual judge moment
5. Evidence
6. Sponsor tech relevance
7. Limitations
8. Final links
```

The visual effect belongs in section 4 or 5.

Do not place the effect before the problem and promise are clear.

---

## Dashboard integration

Default dashboard structure:

```text
Input panel
→ Action button
→ Result card
→ Evidence card
→ Limitation/status card
```

With visual moment:

```text
Input panel
→ Action button
→ Transformation panel
→ Result card
→ Evidence card
→ Limitation/status card
```

The transformation panel must be optional or collapsible if it distracts from the result.

---

## Evidence card layout

Recommended structure:

```text
[STATUS BADGE] [Evidence title]
Short explanation in one sentence.

Proof fields:
- Input:
- Action:
- Result:
- Verification:
- Timestamp / run id:
- Limitation:

[Open evidence] [View README] [Watch demo]
```

Visual rules:

- Badge always readable
- Status text never replaced by color
- Live proof and local proof must look different
- Limitation sits close to evidence
- No decorative animation on critical proof text

---

## Demo video integration

Use visual effects only after value is clear.

Default video structure:

```text
0–5s: problem tension
5–15s: promise
15–40s: 3-step flow
40–60s: visual judge moment
60–75s: evidence
75–85s: limitations
85–90s: final takeaway
```

The visual judge moment should appear around 40–60s, not at the beginning.

The first 15 seconds must stay simple and clear.

---

## Social launch integration

Default X structure:

```text
Problem tension.
Project promise.
3-step flow.
Proof/pass-fail moment.
Evidence status.
Links.
```

If using this module, add one visual memory line:

```text
The judge moment: [raw input] turns into [visible proof].
```

Example:

```text
Most agent demos ask you to trust the output.

ProofRelay turns the claim into a signed visual receipt:
1. Submit claim
2. Verify proof
3. Block if changed/expired/invalid

Judge moment: the receipt flips from UNKNOWN to LOCAL_VERIFIED.

Demo + repo ↓
```

---

## Portfolio integration

Add a “visual decision” section:

```text
Visual decision:
I used [effect] because the core product promise was [promise].
The effect points to [proof/result], not decoration.
The limitation is [limitation].
```

This helps future clients and recruiters see design thinking, not just visuals.

---

## Claude Code / builder handoff prompt

```text
Apply the Judge Visual Moment module to this project.

Project:
[project name and one-line description]

Existing proof states:
[LIVE / LOCAL_VERIFIED / LOCAL_STUB / SIMULATED / PRESEEDED / FAILED]

Goal:
Improve judge-facing clarity and memorability without making the UI decorative.

Required first:
1. One-line promise
2. Problem tension
3. Judge memory sentence
4. X post
5. Telegram/Discord post
6. Hero headline
7. Demo moment
8. Proof/evidence moment

Then:
Design one visual memory moment using only one of these effect families:
- dithering
- ASCII / terminal
- CRT / scanline
- bloom / glow
- pixelation

Return:
- exact section order
- component names
- copy
- badge rules
- layout rules
- responsive behavior
- evidence card layout
- accessibility/performance risks
- implementation checklist

Constraints:
- Do not make LOCAL_STUB, SIMULATED, or PRESEEDED look LIVE.
- Preserve evidence labels as text.
- Keep proof readable.
- Avoid generic AI UI.
- Do not add effects before the promise is clear.
```

---

## Acceptance checklist

```yaml
positioning_done_before_visuals: true
one_line_promise_clear: true
problem_tension_visible: true
x_post_strong: true
judge_memory_sentence_present: true
visual_effect_has_reason: true
effect_points_to_proof: true
evidence_labels_preserved: true
limitations_close_to_evidence: true
stubbed_or_simulated_work_not_overstated: true
demo_video_value_before_architecture: true
mobile_readability_preserved: true
reduced_motion_considered: true
performance_risk_named: true
visual_style_not_generic: true
```

---

## Red flags

Remove or simplify the visual layer if:

- The judge remembers the effect but not the product
- The evidence becomes harder to read
- The project cannot be explained in one X post
- The effect appears before the promise
- The UI looks more advanced than the proof really is
- The status badge is ambiguous
- A local/stubbed/simulated state visually looks live
- Mobile screenshots are unreadable
- The video spends more time on aesthetics than value

---

## Final operating sentence

Use this module to create one memorable visual proof moment.

Not a visual style.
Not a theme.
Not decoration.

One moment that makes the judge say:

> “I understand what this does, I see the proof, and I remember it.”
