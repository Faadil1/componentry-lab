# HACKATHON-DISTINCTION.md

## 0. Purpose

This module exists to move a hackathon submission from:

> technically correct, complete, and credible

to:

> memorable, clearly authored, judge-comparable, and difficult to confuse with generic AI output.

It does **not** replace product strategy, UX, UI polish, technical execution, demo preparation, or submission packaging.

It sits between idea selection and UX design.

```text
INTAKE
→ RESEARCH
→ IDEAS
→ IDEA SCORECARD
→ DISTINCTION
→ UX
→ PRODUCT
→ EXECUTION
→ UI POLISH
→ DEMO
→ SUBMISSION
→ AUDIT / FREEZE
```

The module is successful only when the project has:

1. a non-obvious product truth;
2. a distinctive product behavior;
3. a short signature moment;
4. visible technical depth;
5. sponsor causality;
6. a clear head-to-head advantage;
7. an explicit anti-slop boundary.

---

## 1. Core Principle

A strong hackathon project is not only a working product.

It is a **judge experience** in which:

```text
a concrete problem appears
→ tension becomes visible
→ the product behaves in a distinctive way
→ the technical mechanism is exposed
→ proof appears
→ the problem is resolved
```

The objective is not to add more features.

The objective is to create one product decision that makes a judge think:

> “That is the project that __________________________.”

---

## 2. Non-Goals

This module must not be used to:

- add decorative complexity;
- invent unsupported claims;
- hide weak sponsor integration behind storytelling;
- create fake metrics, fake users, or fake activity;
- replace real implementation with mock theater;
- force novelty when the idea is already strong and clear;
- expand scope after the happy path is stable;
- create multiple overlapping design documents;
- produce generic startup language;
- optimize for visual spectacle at the expense of credibility.

---

## 3. Activation Rule

`HACKATHON-DISTINCTION.md` becomes mandatory when any of the following is true:

- the project uses an LLM, agent, chatbot, or AI recommendation flow;
- the core flow resembles CRUD + API + generated output;
- the product could be mistaken for a generic dashboard;
- more than five similar submissions are likely;
- the sponsor technology is easy to integrate superficially;
- the project is technically strong but visually quiet;
- the concept is useful but not immediately memorable;
- the judge must compare submissions quickly;
- the project depends heavily on a short demo video.

The module may be abbreviated only when:

- the competition is purely technical;
- judging is repo-first;
- the deliverable is a narrowly specified bounty;
- the official rubric explicitly excludes product presentation.

Even in abbreviated mode, sponsor causality and visible proof remain mandatory.

---

## 4. Required Inputs

Before starting, provide:

```yaml
hackathon:
  name:
  deadline:
  remaining_time:
  track:
  sponsor:
  official_rubric:
  demo_limit:
  submission_format:

project:
  working_name:
  one_sentence_problem:
  target_user:
  proposed_solution:
  current_happy_path:
  core_technology:
  sponsor_integration:
  current_state:
  known_constraints:

evidence:
  real_calls_available:
  live_deployment_available:
  local_demo_available:
  screenshots_available:
  logs_available:
  receipts_or_verification_available:
```

Also read, when present:

- `HACKATHON-STATE.md`
- `HACKATHON-IDEAS.md`
- `HACKATHON-IDEA-SCORECARD.md`
- `HACKATHON-RESEARCH.md`
- sponsor documentation
- official rules and judging rubric
- current architecture notes
- current demo flow

Do not invent missing inputs.

Mark them as `UNKNOWN` or `BLOCKED`.

---

## 5. Required Outputs

The module must produce one project-specific artifact:

```text
DISTINCTION-BRIEF.md
```

It must contain:

1. Judge Memory Sentence
2. Non-Obvious Truth
3. Product Metaphor
4. Signature Behavior
5. Signature Moment
6. Movie Path
7. Visible Technical Depth Map
8. Sponsor Causality
9. Head-to-Head Advantage
10. Anti-Slop Kill List
11. Distinction Risks
12. Distinction Verdict
13. UX Handoff Packet
14. Product Handoff Packet
15. Execution Handoff Packet
16. UI Polish Handoff Packet
17. Demo Handoff Packet

The approved brief becomes an input to:

- `HACKATHON-UX.md`
- `HACKATHON-PRODUCT.md`
- `HACKATHON-EXECUTION.md`
- `HACKATHON-UI-POLISH.md`
- `HACKATHON-DEMO.md`
- `HACKATHON-SUBMISSION.md`

---

# PART I — DISTINCTION DISCOVERY

## 6. Judge Memory Sentence

Complete:

> “That is the project that __________________________________.”

The sentence must describe a visible product behavior or outcome.

### Acceptable

- “That is the project that makes an agent prove it was allowed to act.”
- “That is the project that removes autonomy when risk crosses the threshold.”
- “That is the project that shows three models disagree before recommending.”
- “That is the project that proves deleted data no longer influences the report.”
- “That is the project that turns a failed robot action into signed safety evidence.”

### Unacceptable

- “That is the AI-powered platform.”
- “That is the multi-agent dashboard.”
- “That is the innovative assistant.”
- “That is the app using blockchain and AI.”
- “That is the solution with great UX.”

### Test

The sentence passes only if:

- it can be repeated after one viewing;
- it describes behavior, not category;
- it does not depend on the product name;
- it remains meaningful without “AI-powered”;
- it differentiates the project from a generic competitor.

---

## 7. Non-Obvious Truth

Write one sentence revealing what the project understands that a generic solution misses.

Template:

> Most products assume ____________________.  
> This project assumes ____________________ instead.

Examples:

> Most agent systems assume more autonomy creates more value.  
> This project assumes autonomy should shrink as risk becomes less explainable.

> Most recommendation tools optimize for confidence.  
> This project treats disagreement as useful evidence.

> Most privacy tools promise deletion.  
> This project demonstrates that deleted data no longer affects the output.

### Requirements

The truth must be:

- specific to the problem;
- defensible;
- visible in product behavior;
- relevant to the target user;
- implementable within the deadline;
- connected to the sponsor technology.

Reject statements that are merely:

- slogans;
- values;
- broad social claims;
- obvious observations;
- unsupported market claims;
- generic AI commentary.

---

## 8. Product Metaphor

Choose one structural metaphor that shapes the product language and interaction.

Examples:

- gate
- bench
- relay
- checkpoint
- receipt
- control room
- audit trail
- operating table
- flight recorder
- consent boundary
- evidence locker
- risk corridor

The metaphor must influence at least three elements:

```text
interface structure
+ product verbs
+ demo sequence
```

Example:

```text
Metaphor: Gate

Product verbs:
- inspect
- allow
- block
- escalate

UI:
- request enters
- conditions are checked
- decision is visible
- proof is attached

Demo:
- action attempts to cross
- gate blocks
- missing evidence appears
- human approves
- action proceeds
```

Do not use metaphors that are only cosmetic.

---

## 9. Signature Behavior

The signature behavior is the product's distinctive response to a meaningful condition.

Template:

> When ____________________ happens, the product ____________________, because ____________________.

Examples:

- When model disagreement exceeds the threshold, the product stops summarizing and exposes the disagreement.
- When risk becomes non-explainable, the product removes autonomous execution and requests approval.
- When a user deletes a source row, the product regenerates the result and proves the row is absent.
- When a robot enters a no-go path, the system blocks motion and signs the telemetry.
- When provider outputs conflict, the product separates perspectives instead of averaging them away.

### Requirements

The behavior must be:

- triggered by a real condition;
- observable;
- technically implemented;
- relevant to the problem;
- different from a normal success state;
- demonstrable in less than 15 seconds;
- testable.

### Veto

The following are not signature behaviors:

- page transitions;
- glowing buttons;
- loading animations;
- animated charts;
- typing effects;
- generic confidence scores;
- generic “AI is thinking” states;
- a chatbot response;
- a dashboard appearing after login.

---

## 10. Signature Moment

The signature moment is the shortest sequence in which the judge sees the behavior and understands why it matters.

Target duration:

```text
5–15 seconds
```

Template:

```text
Trigger:
Visible change:
Technical proof:
Human meaning:
```

Example:

```text
Trigger:
A proposed action enters a restricted state.

Visible change:
The execution button becomes unavailable and the interface switches from AUTO to HUMAN REVIEW.

Technical proof:
The exact failed rule and signed receipt appear.

Human meaning:
The system does not merely warn; it physically removes autonomy.
```

### Signature Moment Test

A valid signature moment can answer:

- What changed?
- Why did it change?
- What mechanism caused it?
- Why should the user care?
- What proof makes it credible?

---

## 11. Movie Path

Design the demo as one chronological story.

```text
1. Incident
2. Tension
3. Intervention
4. Transformation
5. Proof
6. Resolution
```

### Template

#### Incident
A concrete event occurs.

#### Tension
The normal or generic solution becomes unsafe, incomplete, confusing, or insufficient.

#### Intervention
The product begins its core workflow.

#### Transformation
The signature behavior changes the state of the problem.

#### Proof
The technical mechanism becomes visible.

#### Resolution
The user receives a clear outcome and next action.

### Constraint

The demo must not be organized as:

- feature one;
- feature two;
- feature three;
- architecture slide;
- generic closing statement.

Every screen shown must belong to the same story.

---

# PART II — VISIBLE TECHNICAL DEPTH

## 12. Technical Depth Map

Every technically important mechanism must have a visible manifestation.

Use this table:

| Technical Mechanism | Real Implementation | Visible Manifestation | Evidence Type | Demo Timestamp |
|---|---|---|---|---|
| Sponsor API call | LIVE / LOCAL / STUB | provider result appears | log / trace / UI | |
| Multi-agent execution | LIVE / LOCAL / STUB | distinct outputs shown | artifact / trace | |
| Signature verification | LIVE / LOCAL | receipt verifies | verifier output | |
| Local inference | LIVE / LOCAL | model/runtime shown | run log | |
| Safety gate | LIVE / LOCAL | action blocks | state transition | |
| Data deletion | LIVE / LOCAL | output regenerates | before/after | |

### Rule

If a major claim has no visible manifestation, one of the following must happen:

1. expose it in the product;
2. expose it in the demo;
3. reduce the claim;
4. remove the claim.

---

## 13. Evidence Labels

Use only:

```text
LIVE
LOCAL
LOCAL_STUB
PRESEEDED
SIMULATED
NOT_IMPLEMENTED
UNKNOWN
```

Definitions:

- `LIVE`: real production or public environment.
- `LOCAL`: real execution on the local machine.
- `LOCAL_STUB`: real local flow with a substituted external dependency.
- `PRESEEDED`: valid stored data prepared in advance.
- `SIMULATED`: presentation-only behavior not produced by the real system.
- `NOT_IMPLEMENTED`: absent.
- `UNKNOWN`: not verified.

Never present:

- `LOCAL_STUB` as `LIVE`;
- `PRESEEDED` as real-time generation;
- `SIMULATED` as functional;
- screenshots as proof of execution without context.

---

## 14. Sponsor Causality

The sponsor technology must cause or enable the signature behavior.

Template:

```text
Without [sponsor technology]:
the signature behavior would fail because ____________________.

With [sponsor technology]:
the product can ____________________.

Visible proof:
___________________________________.
```

### Strong sponsor causality

- sponsor compute generates the competing perspectives;
- sponsor identity verifies permission before execution;
- sponsor chain records the decision receipt;
- sponsor agent SDK coordinates the workflow;
- sponsor database enables traceable state transitions;
- sponsor model produces the local/offline analysis;
- sponsor API provides the real-world data that triggers the decision.

### Weak sponsor causality

- sponsor logo shown in footer;
- API called only on a hidden settings page;
- sponsor service stores non-essential metadata;
- sponsor technology mentioned only in README;
- generic architecture could remove sponsor with no product impact.

### Veto

If the signature moment still works unchanged after removing the sponsor technology, sponsor causality is weak.

---

# PART III — HEAD-TO-HEAD ADVANTAGE

## 15. Competent Generic Baseline

Define the strongest plausible generic submission.

Template:

```text
A competent competitor would build:
________________________________________.

It would likely include:
- ______________________________________
- ______________________________________
- ______________________________________

Its demo would probably show:
________________________________________.
```

Do not compare against a weak strawman.

---

## 16. Head-to-Head Advantage

Complete:

```text
The judge chooses this project because, within the first ______ seconds,
they can see _______________________________________________,
which the competent generic baseline does not demonstrate.
```

The advantage must be visible in at least one of:

- behavior;
- proof;
- clarity;
- completeness;
- technical depth;
- sponsor integration;
- interaction;
- emotional resolution.

### Head-to-Head Test

Ask:

1. What does the judge understand faster?
2. What does the judge see here that was absent before?
3. Which scene is easier to remember?
4. Which claim is more credible?
5. Which project feels more complete?
6. Which project uses the sponsor more causally?
7. Which project has a stronger ending?

---

## 17. Judge Compression Test

A judge should be able to compress the project into:

```text
Problem:
Distinctive behavior:
Proof:
Outcome:
```

Maximum:

```text
one sentence per field
```

Failure signs:

- explanation requires architecture detail;
- value depends on reading the README;
- distinction requires several unrelated features;
- judge memory sentence changes every time;
- the main claim cannot be shown in the demo.

---

# PART IV — ANTI-SLOP SYSTEM

## 18. Default Anti-Slop Kill List

Unless explicitly justified, reject:

- chatbot-first primary screens;
- three generic KPI cards above the fold;
- purple-blue gradients used by default;
- fake “live” counters;
- excessive glassmorphism;
- generic robot, brain, spark, or shield icons;
- “AI-powered” as the primary value proposition;
- generic assistant copy;
- outputs with no provenance;
- magic results with no intermediate evidence;
- long explanatory paragraphs inside the product;
- multiple unrelated dashboards;
- decorative charts;
- confidence numbers with no method;
- features added only to appear complete;
- terminology that belongs to the implementation rather than the user;
- sponsor branding without sponsor causality;
- testimonial or impact claims with no source;
- generic “save time” claims;
- generic “make better decisions” claims;
- unnecessary agent personas;
- excessive animation;
- screens that exist only for the demo;
- visual polish before the signature behavior is stable.

---

## 19. Project-Specific Kill List

For each project, add at least five explicit prohibitions.

Template:

```text
This project must not become:

1.
2.
3.
4.
5.
```

Example:

```text
This project must not become:

1. a generic compliance chatbot;
2. a static risk score dashboard;
3. a fake multi-agent conversation;
4. a collection of unverifiable claims;
5. an automation product that hides human approval.
```

---

## 20. Authorship Test

The product should feel intentionally authored.

Ask:

- What did we deliberately refuse to build?
- Which default pattern did we reject?
- Which interaction reflects our product belief?
- Which word or verb belongs only to this product?
- Which screen could not be swapped with a template?
- Which moment reflects human judgment rather than model convenience?

Pass only when at least four answers are specific.

---

# PART V — THREE-DIRECTION EXPLORATION

## 21. Exploration Protocol

Before implementation, generate exactly three materially different directions.

### Direction A — Functional Clarity

Optimize for:

- immediate comprehension;
- minimal scope;
- credible implementation;
- clean happy path.

### Direction B — Proof-First

Optimize for:

- visible mechanism;
- verification;
- trust;
- technical transparency.

### Direction C — Signature Experience

Optimize for:

- memorable behavior;
- strongest movie path;
- distinctive interaction;
- head-to-head advantage.

The directions must not be three visual themes of the same product.

They must differ in:

- product behavior;
- demo structure;
- primary screen;
- proof strategy;
- user outcome.

---

## 22. Required Direction Format

For each direction, provide:

```yaml
direction:
  name:
  thesis:
  non_obvious_truth:
  judge_memory_sentence:
  product_metaphor:
  signature_behavior:
  signature_moment:
  primary_screen:
  movie_path:
  visible_technical_proof:
  sponsor_causality:
  what_is_removed:
  ai_slop_risk:
  implementation_risk:
  time_estimate:
  head_to_head_advantage:
```

Do not merge directions before human selection.

---

## 23. Human Selection Rule

Only the human project owner selects the final direction.

The owner may:

- approve one direction;
- reject all directions;
- request one revision round;
- approve one direction with explicit constraints.

The owner must not approve a blended direction unless the blend preserves:

- one Judge Memory Sentence;
- one Signature Behavior;
- one Signature Moment;
- one primary story.

---

# PART VI — SCORING AND GATE

## 24. Distinction Scorecard

Score each category from 0 to 10.

| Category | Score |
|---|---:|
| Judge Memory Sentence | /10 |
| Non-Obvious Truth | /10 |
| Signature Behavior | /10 |
| Signature Moment | /10 |
| Visible Technical Depth | /10 |
| Sponsor Causality | /10 |
| Movie Path | /10 |
| Head-to-Head Advantage | /10 |
| Anti-Slop Discipline | /10 |
| Feasibility | /10 |
| **Total** | **/100** |

### Thresholds

```text
85–100  PASS
75–84   PASS_WITH_RISKS
60–74   REVISE
0–59    FAIL
```

### Mandatory Vetoes

Regardless of total score, verdict is `FAIL` if any of these is below 6/10:

- Signature Behavior
- Sponsor Causality
- Visible Technical Depth
- Feasibility

---

## 25. Gate Checklist

```text
[ ] Value is understandable in under 10 seconds.
[ ] Judge Memory Sentence describes visible behavior.
[ ] Non-Obvious Truth is specific and defensible.
[ ] Product Metaphor affects structure, language, and demo.
[ ] Signature Behavior is implemented or implementation-ready.
[ ] Signature Moment fits within 15 seconds.
[ ] Technical depth has visible manifestations.
[ ] Sponsor technology causally enables the moment.
[ ] Competent generic baseline is defined honestly.
[ ] Head-to-head advantage is visible.
[ ] Project-specific Anti-Slop Kill List exists.
[ ] Scope remains feasible.
[ ] UX receives one approved direction.
[ ] Demo receives one chronological story.
```

---

## 26. Verdict Format

```yaml
distinction_verdict:
  status: PASS | PASS_WITH_RISKS | REVISE | FAIL
  score:
  mandatory_vetoes:
  approved_direction:
  judge_memory_sentence:
  signature_behavior:
  signature_moment:
  sponsor_causality:
  visible_proof:
  head_to_head_advantage:
  top_risks:
  required_changes:
```

---

# PART VII — HANDOFF PACKETS

## 27. UX Handoff Packet

Provide:

```yaml
ux_handoff:
  approved_direction:
  target_user:
  user_state_before:
  user_state_after:
  primary_screen:
  primary_action:
  signature_behavior:
  signature_trigger:
  signature_state_change:
  visible_proof:
  product_metaphor:
  required_copy:
  forbidden_patterns:
  required_error_state:
  required_empty_state:
  required_trust_signal:
```

Rule:

> UX may stage the approved distinction, but must not invent a different one.

---

## 28. Product Handoff Packet

Provide:

```yaml
product_handoff:
  core_job:
  happy_path:
  signature_path:
  acceptance_criteria:
  trigger_condition:
  state_transition:
  proof_object:
  sponsor_dependency:
  fallback_behavior:
  out_of_scope:
```

---

## 29. Execution Handoff Packet

Provide:

```yaml
execution_handoff:
  must_be_real:
  may_be_preseeded:
  may_be_local:
  prohibited_simulation:
  required_tests:
  required_logs:
  required_receipts:
  browser_validation:
  expected_artifacts:
```

---

## 30. UI Polish Handoff Packet

Provide:

```yaml
ui_polish_handoff:
  visual_metaphor:
  primary_hierarchy:
  signature_component:
  proof_component:
  motion_allowed:
  motion_forbidden:
  generic_patterns_to_remove:
  screenshot_recognition_test:
```

Rule:

> Polish must amplify the signature behavior, not decorate a generic interface.

---

## 31. Demo Handoff Packet

Provide:

```yaml
demo_handoff:
  opening_incident:
  tension:
  chronological_path:
  signature_timestamp:
  proof_timestamp:
  resolution:
  judge_memory_sentence:
  fallback_recording_path:
  claims_allowed:
  claims_forbidden:
```

---

# PART VIII — ANTIGRAVITY AND CLAUDE PROTOCOL

## 32. Antigravity Role

Antigravity may be used for:

- three-direction exploration;
- browser-first concept testing;
- primary-screen prototyping;
- signature interaction prototyping;
- visible proof design;
- walkthrough rehearsal;
- Chrome DevTools validation;
- UX friction identification;
- artifact generation.

Antigravity must not, without explicit delegation:

- update `HACKATHON-STATE.md`;
- alter security-sensitive code;
- change sponsor claims;
- change authentication;
- change deployment configuration;
- modify secrets;
- merge to the protected branch;
- touch a `SUBMITTED / FROZEN` project;
- redefine the approved distinction.

---

## 33. Antigravity Discovery Prompt

```text
You are the Distinction Lab for this hackathon project.

Do not write or modify code.

Read:
- the official judging rubric;
- sponsor requirements;
- HACKATHON-STATE.md;
- HACKATHON-DISTINCTION.md;
- HACKATHON-IDEAS.md;
- HACKATHON-IDEA-SCORECARD.md;
- the current product concept.

Produce exactly three materially different product directions:

A. Functional Clarity
B. Proof-First
C. Signature Experience

For each direction, provide:
1. non-obvious truth;
2. judge memory sentence;
3. product metaphor;
4. signature behavior;
5. signature moment;
6. chronological demo path;
7. visible technical proof;
8. sponsor causality;
9. what must be removed;
10. AI-slop risk;
11. implementation risk;
12. head-to-head advantage.

Do not combine the directions.
Do not select a winner.
Do not create generic chatbot-first or dashboard-first concepts.
Wait for human selection.
```

---

## 34. Claude Audit Role

Claude acts as:

- feasibility auditor;
- sponsor causality auditor;
- evidence auditor;
- scope auditor;
- implementation contract owner;
- Antigravity integration reviewer.

Claude must reject:

- original but non-demonstrable concepts;
- visually strong but fake mechanisms;
- sponsor integrations unrelated to the signature behavior;
- unsupported claims;
- proof that exists only in documentation;
- scope that threatens the happy path;
- distinction based only on animation or branding.

---

## 35. Claude Distinction Audit Prompt

```text
Audit the proposed DISTINCTION-BRIEF against:

- official judging rubric;
- sponsor requirements;
- current project state;
- remaining time;
- technical architecture;
- available evidence;
- HACKATHON-DISTINCTION.md.

Return:

1. PASS / PASS_WITH_RISKS / REVISE / FAIL
2. score out of 100
3. mandatory veto results
4. feasibility issues
5. unsupported claims
6. sponsor causality gaps
7. invisible technical depth
8. AI-slop risks
9. exact required revisions
10. approved UX handoff only if the gate passes

Do not improve the concept by silently expanding scope.
Do not merge competing directions.
```

---

# PART IX — STATE CONTRACT

## 36. HACKATHON-STATE Fields

The orchestrator should maintain:

```yaml
distinction:
  status: NOT_STARTED
  mode: FULL
  approved_direction: null
  judge_memory_sentence: null
  non_obvious_truth: null
  product_metaphor: null
  signature_behavior: null
  signature_moment: null
  visible_proof: null
  sponsor_causality: null
  head_to_head_advantage: null
  anti_slop_kill_list: []
  score: null
  verdict: null
  top_risks: []
  last_updated: null
```

Allowed status values:

```text
NOT_STARTED
DISCOVERY
AWAITING_HUMAN_SELECTION
SELECTED
AUDIT
PASS
PASS_WITH_RISKS
REVISE
FAIL
FROZEN
```

---

## 37. Freeze Rule

After submission:

```text
distinction.status = FROZEN
```

Do not revise:

- Judge Memory Sentence;
- Signature Behavior;
- Signature Moment;
- sponsor causality;
- visible proof;
- approved demo story;

unless:

- organizers request a change;
- a claim is found to be inaccurate;
- a public proof breaks;
- the project is explicitly reopened.

---

# PART X — PROJECT ARTIFACT TEMPLATE

## 38. DISTINCTION-BRIEF.md Template

```markdown
# DISTINCTION BRIEF — [PROJECT NAME]

## Status
- Verdict:
- Score:
- Approved direction:
- Last updated:

## 1. Judge Memory Sentence
“That is the project that __________________________.”

## 2. Non-Obvious Truth
Most products assume:
This project assumes:

## 3. Product Metaphor
Metaphor:
Product verbs:
UI implication:
Demo implication:

## 4. Signature Behavior
When:
The product:
Because:

## 5. Signature Moment
Trigger:
Visible change:
Technical proof:
Human meaning:
Target duration:

## 6. Movie Path
Incident:
Tension:
Intervention:
Transformation:
Proof:
Resolution:

## 7. Visible Technical Depth
| Mechanism | Evidence Label | Visible Manifestation | Proof |
|---|---|---|---|

## 8. Sponsor Causality
Without sponsor technology:
With sponsor technology:
Visible proof:

## 9. Competent Generic Baseline
A competent competitor would:

## 10. Head-to-Head Advantage
The judge chooses this project because:

## 11. Anti-Slop Kill List
1.
2.
3.
4.
5.

## 12. Risks
- 
- 
- 

## 13. UX Handoff
- Primary screen:
- Primary action:
- Signature component:
- Required proof:
- Forbidden patterns:

## 14. Demo Handoff
- Opening:
- Signature timestamp:
- Proof timestamp:
- Closing line:
```

---

# PART XI — END-OF-MODULE CHECK

## 39. Completion Criteria

The module is complete only when:

```text
[ ] One direction is human-approved.
[ ] The distinction audit has passed.
[ ] The signature behavior is testable.
[ ] The signature moment is demo-ready.
[ ] Sponsor causality is explicit.
[ ] Visible proof is assigned.
[ ] UX handoff is produced.
[ ] Demo handoff is produced.
[ ] HACKATHON-STATE.md is updated delta-only.
```

---

## 40. Final Operating Rule

Do not ask:

> “How can we make this project look more impressive?”

Ask:

> “What product behavior makes this project impossible to confuse with a generic submission, and how can the judge see proof of it within seconds?”
