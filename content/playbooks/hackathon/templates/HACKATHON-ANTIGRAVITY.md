# HACKATHON-ANTIGRAVITY.md

## 0. Purpose

This module defines how Google Antigravity 2.0 and Antigravity IDE are used inside the Hackathon OS.

Its purpose is to improve:

- concept exploration;
- distinction;
- UX staging;
- browser validation;
- visible technical proof;
- demo rehearsal;
- artifact generation;

without weakening:

- technical truth;
- scope control;
- sponsor causality;
- evidence integrity;
- repository safety;
- human creative authority;
- final freeze discipline.

Antigravity is not a second unrestricted lead developer.

It is a controlled specialist environment.

---

## 1. Operating Model

```text
Faadil
→ selects direction, taste, and final trade-offs

Claude Code
→ architecture, contracts, implementation truth, tests, audit, merge, freeze

Antigravity 2.0
→ concept exploration, parallel critique, UX and demo orchestration

Antigravity IDE
→ bounded implementation, browser execution, Chrome DevTools, evidence artifacts
```

Default relationship:

```text
Claude Code = Technical Lead and Integration Authority
Antigravity = Bounded Distinction and Experience Specialist
Faadil = Product and Creative Director
```

Antigravity may recommend and implement within the written scope.

Antigravity may not redefine protected product, evidence, architecture, or
submission decisions.

### Authority Precedence

When instructions conflict, use this order:

```text
1. explicit human decision;
2. frozen-project rule;
3. HACKATHON-STATE.md;
4. approved Distinction Brief;
5. approved Product and UX contracts;
6. written Antigravity delegation;
7. local implementation preference.
```

Antigravity must stop rather than silently resolve a conflict between these
levels.

---

## 2. Default Mode

Use:

```text
Review-driven development
```

Do not use fully autonomous agent-driven execution on:

- a protected branch;
- a sponsor-sensitive integration;
- a deployment configuration;
- authentication;
- security-critical code;
- a project marked `SUBMITTED / FROZEN`;
- a repository with uncommitted work;
- a repository without a tested rollback point.

The agent may operate with broader autonomy only inside:

- a disposable sandbox;
- a dedicated worktree;
- an isolated feature branch;
- a project explicitly marked safe for experimentation.

---

## 3. When Antigravity Should Be Used

Use Antigravity for:

### Distinction
- generating three materially different product directions;
- identifying generic AI patterns;
- testing Judge Memory Sentences;
- prototyping Signature Behaviors;
- comparing a project against a competent generic baseline.

### UX
- staging the approved movie path;
- testing screen hierarchy;
- validating the primary action;
- testing empty, loading, success, and failure states;
- finding friction in the judge journey.

### UI
- implementing bounded components;
- refining the signature interaction;
- ensuring responsive behavior;
- removing template-like visual patterns;
- making technical depth visible.

### Browser and Demo
- running the complete happy path;
- testing the Signature Moment;
- collecting screenshots;
- producing walkthrough artifacts;
- checking console and network errors;
- rehearsing the demo path;
- validating demo timing.

### Evidence
- capturing browser artifacts;
- recording visible proof;
- documenting tested paths;
- surfacing unresolved issues.

---

## 4. When Antigravity Must Not Be Used

Do not use Antigravity to:

- define final architecture alone;
- make unsupported sponsor claims;
- change evidence labels;
- decide submission status;
- update frozen-state records;
- rewrite core contracts without review;
- handle secrets;
- rotate keys;
- change authentication flows without explicit scope;
- change deployment targets;
- merge directly into the protected branch;
- reopen a frozen project;
- fabricate success states;
- conceal broken flows with pre-seeded visuals;
- replace missing implementation with animation;
- choose a new visual direction during implementation;
- stack competing design skills;
- use generated media as technical proof;
- silently add dependencies or expand scope.

---

## 5. Repository Safety Model

Antigravity must work in a separate branch or worktree.

Recommended structure:

```text
project/
→ Claude Code / protected integration branch

project-antigravity/
→ Antigravity IDE / delegated branch
```

Example:

```powershell
git status

git worktree add ..\project-antigravity `
  -b antigravity/experience
```

Required before delegation:

```text
[ ] Current repository is clean.
[ ] Current commit is known.
[ ] Protected files are identified.
[ ] Antigravity scope is written.
[ ] Acceptance criteria are written.
[ ] Rollback path exists.
```

---

## 6. Protected Files and Areas

Antigravity must not modify the following unless the delegation explicitly allows it:

```text
HACKATHON-STATE.md
HACKATHON-MEMORY.md
HACKATHON-SUBMISSION.md
HACKATHON-AUDIT.md
HACKATHON-CLAUDE.md
deployment configuration
authentication
authorization
secrets
environment files
key material
signing logic
receipt verification logic
database migrations
billing configuration
production infrastructure
official claims
freeze tags
submission metadata
```

Project-specific protected paths must be added before work begins.

Example:

```yaml
protected_paths:
  - backend/auth/**
  - backend/security/**
  - infra/**
  - .env*
  - HACKATHON-STATE.md
  - SUBMISSION.md
```

---

## 7. Delegation Contract

Every Antigravity task must include:

```yaml
delegation:
  task_id:
  role:
  objective:
  branch:
  worktree:
  allowed_paths:
  forbidden_paths:
  protected_decisions:
  acceptance_criteria:
  tests_required:
  browser_path:
  evidence_required:
  time_limit:
  stop_conditions:
```

Visual implementation tasks must also include the `design_execution` contract
defined in Section 8.5.

### Example

```yaml
delegation:
  objective: Implement the approved signature interaction.
  branch: antigravity/signature-flow
  worktree: ../project-antigravity
  allowed_paths:
    - app/**
    - components/**
    - public/**
  forbidden_paths:
    - api/**
    - auth/**
    - infra/**
    - HACKATHON-STATE.md
  acceptance_criteria:
    - signature state change is visible;
    - browser path completes;
    - no console errors;
    - responsive at desktop and mobile widths.
  tests_required:
    - npm test
    - npm run build
  browser_path:
    - open landing page;
    - trigger primary action;
    - reach Signature Moment;
    - verify proof state.
  evidence_required:
    - screenshot before;
    - screenshot after;
    - console result;
    - test summary.
  time_limit: 90 minutes
  stop_conditions:
    - backend contract mismatch;
    - authentication failure;
    - sponsor API unavailable;
    - protected file change required.
```

---

## 8. Core Antigravity Roles

## 8.1 Distinction Lab

Purpose:

- produce three non-overlapping product directions;
- expose AI-slop risk;
- identify the strongest Signature Behavior;
- test the head-to-head advantage.

Required outputs:

```text
Direction A — Functional Clarity
Direction B — Proof-First
Direction C — Signature Experience
```

No code changes during this phase.

---

## 8.2 Experience Builder

Purpose:

- translate an approved distinction into UX;
- implement the primary interaction;
- ensure the Signature Moment is visible;
- validate the judge journey.

Required input:

```text
approved DISTINCTION-BRIEF.md
approved UX handoff
approved scope
```

---

## 8.3 Browser QA

Purpose:

- test the real happy path;
- find visible errors;
- inspect console and network behavior;
- validate demo timing;
- produce evidence.

Browser QA must test:

```text
happy path
signature path
failure path
empty state
loading state
recovery path
```

---

## 8.4 Demo Director

Purpose:

- rehearse the chronological demo;
- confirm the Signature Moment appears on time;
- remove unnecessary screens;
- collect final screenshots and walkthrough artifacts.

Demo Director must not rewrite product behavior.

It may only recommend:

- reordering;
- shortening;
- clearer copy;
- stronger proof visibility;
- cleaner transitions;
- removal of distractions.

---


## 8.5 Design Execution Routing

Antigravity may execute design and front-end work only after the upstream
Product, UX, and visual decisions are sufficiently stable.

### Activation Rule

Classify the primary surface as exactly one of:

```text
MARKETING_UI
FUNCTIONAL_UI
DASHBOARD_UI
MOBILE_UI
```

Do not use `HYBRID_UI`.

When a project contains multiple surface types, split the work into separate
delegations with separate acceptance criteria.

If no judge-visible surface exists, do not create a design execution task.

### Required Design Execution Inputs

Every visual implementation task must specify:

```yaml
design_execution:
  surface_type: MARKETING_UI | FUNCTIONAL_UI | DASHBOARD_UI | MOBILE_UI
  approved_visual_direction:
  approved_signature_behavior:
  approved_signature_moment:
  primary_design_skill:
  component_system:
  motion_strategy: NONE | APPROVED
  visual_asset_strategy: NONE | APPROVED
  browser_validation_path:
  viewport_targets:
  required_states:
  allowed_files:
  forbidden_files:
```

Antigravity must not infer or redefine missing creative decisions.

If `surface_type`, `approved_visual_direction`, `browser_validation_path`, or
`allowed_files` is missing, stop and return:

```text
BLOCKED — DESIGN EXECUTION INPUT INCOMPLETE
```

### MARKETING_UI

Use for:

- landing pages;
- portfolio pages;
- submission pages;
- narrative hero sections;
- campaign-style storytelling.

Priorities:

- distinctive visual direction;
- typography;
- composition;
- hierarchy;
- narrative pacing;
- focused use of the approved Signature Moment.

Avoid:

- generic gradient-heavy SaaS templates;
- fake product activity;
- arbitrary dashboard cards;
- motion without narrative purpose;
- visual choices that contradict product truth.

Marketing UI may be expressive.

It must still preserve readability, accessibility, evidence boundaries, and
product truth.

### FUNCTIONAL_UI

Use for:

- operational applications;
- forms;
- consoles;
- decision tools;
- agent interfaces;
- customer workflows.

Priorities:

- clarity;
- states;
- actions;
- feedback;
- accessibility;
- component reliability;
- responsive behavior;
- task completion.

Prefer established components over hand-building common primitives.

Do not treat the functional product layer as a landing page.

### DASHBOARD_UI

Use for:

- analytics;
- monitoring;
- investigation;
- reporting;
- dense information interfaces.

Priorities:

- information architecture;
- grouping;
- density;
- comparison;
- scanability;
- progressive disclosure;
- hierarchy between signal and context;
- empty, loading, error, partial, and success states.

Avoid:

- arbitrary KPI-card grids;
- equal visual weight for all information;
- decorative charts without decisions;
- excessive color;
- hidden filters or unclear time ranges;
- landing-page composition applied to operational data.

A dashboard must answer:

```text
What changed?
Why does it matter?
What should the user inspect or do next?
```

### MOBILE_UI

Use only for genuinely mobile-first products.

Priorities:

- thumb reach;
- touch-target size;
- safe areas;
- mobile navigation;
- keyboard and input behavior;
- reduced density;
- platform-aware interaction.

Do not create mobile UI by shrinking a desktop layout.

Do not introduce a platform or stack rewrite without explicit approval.

### Skill and Tool Selection

Antigravity must use:

- at most one primary design skill per delegated surface;
- at most one primary component system;
- at most one motion strategy;
- one explicit browser-validation path.

Do not stack competing style skills.

Do not load unrelated design skills into context.

```text
Design skill
→ supplies rules, judgment, and implementation constraints

Component system or registry
→ supplies reliable primitives and implementation resources

MCP or live connector
→ supplies current resources or tool access

Antigravity
→ applies approved choices within scope
```

A component registry does not replace:

- UX reasoning;
- product hierarchy;
- accessibility checks;
- evidence validation;
- browser testing;
- human taste approval.

Antigravity must inspect the existing project before adding dependencies.

Every new dependency must be declared in the Return Packet.

### Motion Rules

Motion is allowed only when it:

- explains a state transition;
- directs attention;
- clarifies causality;
- supports the approved Signature Moment;
- improves demonstration comprehension.

Do not add:

- generic scroll reveals;
- decorative motion on every card;
- continuous background movement;
- animation that delays user action;
- animation that hides loading or failure states;
- motion that substitutes for missing functionality.

Respect reduced-motion preferences when motion is present.

`motion_strategy: NONE` means no motion dependency may be added.

### Generated Visual Asset Rules

Generated images or videos may support:

- marketing surfaces;
- hero sections;
- explanatory illustrations;
- non-evidentiary demonstration storytelling.

They must not:

- represent an unbuilt product state as real;
- replace technical proof;
- imitate a live integration;
- conceal missing implementation;
- contradict the approved product identity;
- be described as verified or measured evidence.

Every generated visual asset must be disclosed in the Return Packet.

### Context-Minimization Rule

Load only:

- the active delegation;
- the selected surface section;
- the approved visual direction;
- the relevant component-system rules;
- the required browser path.

Do not load all design skills or all surface rules into every task.

The goal is controlled judgment, not maximum prompt volume.

---

## 9. Antigravity Prompt Template

```text
You are operating inside the Hackathon Claude OS as a bounded specialist.

Role:
[ROLE]

Read only:
- the approved task contract;
- the relevant approved Product and UX artifacts;
- the approved Distinction Brief;
- the selected design-execution section when this is a visual task;
- the current repository instructions.

Objective:
[OBJECTIVE]

Branch and worktree:
[BRANCH]
[WORKTREE]

Allowed paths:
[ALLOWED PATHS]

Forbidden paths:
[FORBIDDEN PATHS]

Protected decisions:
[PROTECTED DECISIONS]

Design execution:
[SURFACE TYPE OR NOT_APPLICABLE]
[APPROVED VISUAL DIRECTION]
[PRIMARY DESIGN SKILL]
[COMPONENT SYSTEM]
[MOTION STRATEGY]
[BROWSER VALIDATION PATH]

Acceptance criteria:
[ACCEPTANCE CRITERIA]

Required tests:
[TESTS]

Required evidence:
[EVIDENCE]

Rules:
- Do not modify protected files.
- Do not change architecture or backend contracts.
- Do not change sponsor claims.
- Do not change evidence labels.
- Do not redefine the Signature Behavior or Signature Moment.
- Do not fabricate proof.
- Do not add unapproved design skills or dependencies.
- Do not use generated visuals as technical evidence.
- Stop if secret access is required.
- Stop if deployment changes are required.
- Stop if a protected path must be modified.
- Stop if the visual direction is missing or contradictory.
- Do not merge.
- Commit only to the delegated branch.

Return:
1. branch and commit;
2. files changed;
3. dependencies added;
4. tests run;
5. browser paths and viewports tested;
6. states verified;
7. evidence produced;
8. protected decisions preserved;
9. unresolved issues;
10. claims not verified;
11. deviations from brief;
12. merge recommendation.
```

---

## 10. Antigravity Return Packet

Every completed task must return:

```yaml
antigravity_return:
  task_id:
  role:
  branch:
  commit:
  objective:

  scope:
    files_changed:
    protected_files_touched:
    dependencies_added:
    scope_deviations:

  design_execution:
    applicable:
    surface_type:
    approved_visual_direction_received:
    primary_design_skill_used:
    component_system_used:
    motion_strategy:
    generated_visual_assets:
    viewport_sizes_tested:
    states_verified:
      - default
      - loading
      - empty
      - error
      - partial
      - success
    accessibility_checks:
    deviations_from_visual_brief:

  validation:
    tests_run:
    test_results:
    build_result:
    browser_paths_tested:
    console_errors:
    network_errors:

  evidence:
    artifacts_created:
    claims_verified:
    claims_unverified:
    evidence_limitations:

  outcome:
    unresolved_issues:
    known_risks:
    result: PASS | PASS_WITH_RISKS | BLOCKED | REJECT
    merge_recommendation:
```

Allowed merge recommendations:

```text
READY_FOR_AUDIT
READY_WITH_KNOWN_RISKS
NOT_READY
REJECT
```

Antigravity never returns `MERGED`.

Subjective statements such as `looks premium`, `feels modern`, or
`design is complete` are not evidence.

---

## 11. Claude Integration Audit

Claude Code must review every Antigravity return packet.

Audit checklist:

```text
[ ] Scope respected.
[ ] Protected files untouched.
[ ] No hidden contract changes.
[ ] No unsupported claims added.
[ ] Sponsor causality preserved.
[ ] Evidence labels remain accurate.
[ ] Tests actually passed.
[ ] Browser path is reproducible.
[ ] Signature behavior remains real.
[ ] No regression to happy path.
[ ] No deployment risk introduced.
[ ] No freeze rule violated.
[ ] Surface type is correctly classified when applicable.
[ ] Only one primary design skill governed the delegated surface.
[ ] Component system matches the approved stack.
[ ] Visual direction matches the approved brief.
[ ] Motion is absent or explicitly justified.
[ ] Required states and viewport targets were tested.
[ ] Accessibility checks are recorded.
[ ] Functional UI was not treated as marketing UI.
[ ] Dashboard hierarchy is credible when applicable.
[ ] Mobile behavior is genuinely mobile-aware when applicable.
[ ] Generated assets are not presented as technical proof.
```

Claude verdict:

```text
PASS
PASS_WITH_FIXES
REJECT
```

Claude must not merge if:

- protected files were modified;
- tests were skipped without explanation;
- browser evidence conflicts with code state;
- claims exceed evidence;
- the Signature Moment is simulated;
- the sponsor integration became decorative;
- the delegated scope expanded silently;
- required UI states are missing;
- the approved visual direction was replaced;
- generated media is used as implementation proof.

---

## 12. Human Approval Points

Faadil must approve:

```text
1. final product direction;
2. Judge Memory Sentence;
3. Signature Behavior;
4. Signature Moment;
5. major visual direction;
6. visible proof;
7. merge of major UX or visual changes;
8. final demo sequence.
```

Antigravity may recommend.

Claude may audit.

Neither replaces human product selection.

---

## 13. Anti-Slop Review

Before accepting Antigravity output, verify:

```text
[ ] The result does not look like a generic SaaS template.
[ ] The primary screen is specific to the product.
[ ] The interface does not default to chatbot-first.
[ ] The visual hierarchy supports the Signature Behavior.
[ ] The proof is visible.
[ ] The sponsor technology matters.
[ ] Copy is product-specific.
[ ] No fake activity indicators exist.
[ ] No unnecessary KPI cards exist.
[ ] No decorative complexity was added.
[ ] The product still feels authored.
```

### Surface-Specific Checks

For `MARKETING_UI`:

```text
[ ] Typography and composition follow one coherent direction.
[ ] The hero communicates product value quickly.
[ ] Motion, if present, has narrative purpose.
[ ] The page does not invent unavailable capabilities.
```

For `FUNCTIONAL_UI`:

```text
[ ] Primary action is obvious.
[ ] States and feedback are understandable.
[ ] Components behave consistently.
[ ] Visual restraint supports task completion.
```

For `DASHBOARD_UI`:

```text
[ ] Information is grouped by decision value.
[ ] The strongest signal is visually dominant.
[ ] Filters, units, and time ranges are explicit.
[ ] Charts support a question or action.
[ ] The screen avoids equal-weight card overload.
```

For `MOBILE_UI`:

```text
[ ] Primary actions are reachable.
[ ] Touch targets are credible.
[ ] Navigation is mobile-aware.
[ ] Inputs and keyboard behavior are considered.
[ ] The layout is not merely compressed desktop UI.
```

If more than three applicable checks fail:

```text
VERDICT = REVISE
```

---

## 14. Browser Validation Protocol

Required browser checks:

### Functional
- page loads;
- primary action works;
- Signature Behavior triggers;
- proof appears;
- error recovery works.

### Technical
- no blocking console errors;
- no failed critical requests;
- no broken asset paths;
- no hydration failure;
- no cross-origin failure on critical flow.

### Visual
- desktop layout;
- mobile layout;
- text clipping;
- overflow;
- focus visibility;
- contrast;
- reduced-motion behavior when applicable;
- loading state;
- error state;
- proof visibility;
- signature state contrast.

### Demo
- total path length;
- dead time;
- scroll dependence;
- cursor travel;
- loading delay;
- transition clarity;
- final resolution.

---

## 15. Evidence Artifact Standard

Allowed artifacts:

```text
screenshot
walkthrough
console capture
network capture
test output
build output
trace
log
receipt
before/after state
```

Every artifact must include:

```yaml
artifact:
  type:
  generated_at:
  branch:
  commit:
  path_tested:
  evidence_label:
  claim_supported:
  limitations:
```

Use only canonical evidence labels defined by `HACKATHON-EVIDENCE.md`.

Do not use an artifact without a commit reference when the repository is
changing quickly.

Generated media must be marked as presentation material, not implementation
evidence.

---

## 16. State Fields

Add or maintain the following block in `HACKATHON-STATE.md`:

```yaml
antigravity:
  enabled: false
  mode: REVIEW_DRIVEN
  active_role: NONE
  task_id: null
  assigned_scope: null

  repository:
    branch: null
    worktree: null
    protected_paths: []
    last_commit: null

  design_execution:
    applicable: false
    surface_type: null
    approved_visual_direction_ref: null
    primary_design_skill: null
    component_system: null
    motion_strategy: NONE
    browser_validation_path: null

  validation:
    last_return_packet: null
    evidence_status: null
    claude_audit_verdict: null
    merge_status: NOT_APPLICABLE

  last_updated: null
```

Allowed `active_role` values:

```text
DISTINCTION_LAB
EXPERIENCE_BUILDER
BROWSER_QA
DEMO_DIRECTOR
NONE
```

Allowed `surface_type` values:

```text
MARKETING_UI
FUNCTIONAL_UI
DASHBOARD_UI
MOBILE_UI
null
```

Allowed `merge_status` values:

```text
NOT_APPLICABLE
AWAITING_AUDIT
APPROVED
MERGED
REJECTED
```

`HACKATHON-STATE.md` is updated by Claude Code after audit, not by Antigravity.

---

## 17. Frozen Project Rule

If:

```yaml
project_status: SUBMITTED / FROZEN
```

then:

```text
Antigravity write access = prohibited
```

Allowed frozen-project use:

- read-only audit;
- retrospective analysis;
- screenshot review;
- demo critique;
- future-process lessons.

Not allowed:

- code edits;
- UI polish;
- README edits;
- submission edits;
- deployment changes;
- proof regeneration;
- video replacement;

unless an explicit external trigger reopens the project.

---

## 18. Stop Conditions

Antigravity must stop and return control if:

- a secret is required;
- production credentials are required;
- payment is required;
- a mainnet transaction is required;
- protected files must change;
- architecture must change;
- sponsor integration is unavailable;
- authentication blocks progress;
- the repository is dirty outside the delegated branch;
- evidence cannot be produced honestly;
- the task exceeds the timebox;
- the project is frozen;
- the happy path regresses;
- the approved visual direction is missing;
- the surface type is unclassified;
- multiple competing design skills are requested;
- generated media would conceal missing implementation;
- the required browser path cannot be tested.

---

## 19. End-of-Task Checklist

```text
[ ] Changes are committed.
[ ] Return packet is complete.
[ ] Tests are recorded.
[ ] Browser path and tested viewports are recorded.
[ ] Required UI states are recorded.
[ ] Evidence is linked to branch and commit.
[ ] Known risks and limitations are listed.
[ ] Generated assets are disclosed.
[ ] No protected files changed.
[ ] No unsupported claims added.
[ ] Claude audit is requested.
[ ] HACKATHON-STATE.md is updated only after audit.
```

---

## 20. Final Operating Rule

Use Antigravity to increase:

```text
distinctiveness
+ judge clarity
+ visible proof
+ interaction quality
+ browser confidence
```

Do not use it to increase:

```text
uncontrolled autonomy
+ scope
+ hidden complexity
+ unsupported claims
+ style stacking
+ repository risk
```

Final principle:

```text
Claude Code selects and protects the constraints.
Antigravity implements within those constraints.
Claude Code audits the result.
Faadil approves the product and creative direction.
```
