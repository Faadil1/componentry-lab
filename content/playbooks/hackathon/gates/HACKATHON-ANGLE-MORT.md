# HACKATHON-ANGLE-MORT.md

## Status

```yaml
module: HACKATHON-ANGLE-MORT
type: optional_strategic_challenge_module
active_instruction: true
source_of_truth: false
governance_layer: false
default_call_name: "Angle-Mort Pass"
recommended_user_call: "Mode Hackathon Claude OS Copilot + Angle-Mort Pass"
```

## Purpose

`HACKATHON-ANGLE-MORT.md` is an optional strategic blind-spot module for Hackathon Claude OS.

It generates non-obvious angles, reversals, constraints, perspective shifts, and strategic challenges for hackathon qualification, idea selection, Distinction Gate, UX, demo design, audit preparation, and retrospective learning.

It helps answer:

- What are we not seeing?
- Why might this idea look generic?
- Why might judges misunderstand it?
- What hidden assumption are we accepting too quickly?
- What would make this project more memorable, more sponsor-causal, and harder to dismiss?
- What should Claude OS or Claude Code challenge before implementation?

This module is designed to work with:

- ChatGPT as Faadil’s strategic copilot;
- Hackathon Claude OS as the operating source of truth;
- Claude Code as the technical/repository execution lead;
- Antigravity as a bounded specialist executor only when explicitly authorized.

## Non-authority rule

This module does **not** override:

- `HACKATHON-CLAUDE.md`
- `HACKATHON-ORCHESTRATOR.md`
- `HACKATHON-OPERATING-GATES.md`
- `HACKATHON-STATE.md`
- `HACKATHON-EVIDENCE.md`
- `HACKATHON-LOOPS.md`
- `HACKATHON-DISTINCTION.md`
- `HACKATHON-UX.md`
- `HACKATHON-UI-POLISH.md`
- `HACKATHON-ANTIGRAVITY.md`
- `HACKATHON-DEMO.md`
- `HACKATHON-SUBMISSION.md`
- `HACKATHON-AUDIT.md`

It does not define canonical phases, evidence labels, readiness statuses, loop limits, submission status, or freeze discipline.

It generates angles. It does not verify, audit, introspect, fabricate proof, or change project state.

## When to use

Use an `Angle-Mort Pass` when:

- Faadil asks to “challenge” an idea;
- the idea feels too obvious;
- the project risks looking generic, recycled, or AI-generated;
- sponsor causality feels weak or decorative;
- the Signature Behavior is not memorable;
- the Signature Moment is unclear;
- the visible technical proof is not strong enough;
- the UI/UX lacks a visible state change;
- the demo story feels flat;
- judges may misunderstand the project;
- the current direction feels technically solid but strategically weak;
- the project needs a stronger head-to-head advantage;
- a finalist idea needs pressure-testing before Distinction Gate approval;
- a submitted project needs retrospective learning without reopening.

## When not to use

Do not use this module:

- before mandatory qualification facts are known, if those facts could invalidate the project;
- to bypass `QUALIFY`, `DECIDE`, `DISTINCTION GATE`, `DESIGN`, `DELIVER`, or `AUDIT`;
- to invent missing rules, dates, eligibility, prior-work policies, judging criteria, sponsor requirements, or API capabilities;
- to fabricate proof;
- to upgrade weak evidence through narration;
- to rename evidence labels;
- to override Faadil’s final approval;
- to reopen a `SUBMITTED / FROZEN` project without explicit authorization;
- to create unlimited idea variants;
- to stack competing visual directions or product metaphors;
- to replace UX, UI Polish, Audit, or Evidence modules.

If a loop is required, defer to `HACKATHON-LOOPS.md`.

## Relationship to Hackathon Claude OS phases

### QUALIFY

Use lightly.

Goal: expose hidden eligibility, policy, or feasibility risks.

Useful questions:

- What assumption could disqualify us?
- What official rule are we treating as obvious but have not verified?
- What API, SDK, platform, or environment dependency could collapse the build?
- What prior-work interpretation could create submission risk?

Do not generate project ideas until qualification blockers are checked.

### DECIDE

Use strongly.

Goal: challenge `REUSE`, `ADAPT`, `BUILD NEW`, or `DO NOT SUBMIT`.

Useful questions:

- Are we adapting an old project because it is truly strong, or because it is available?
- Would a new build be clearer, more sponsor-causal, or easier to prove?
- What would make `DO NOT SUBMIT` the correct decision?
- Which option has the strongest visible proof path?

### DISTINCTION GATE

Use strongly.

Goal: strengthen or break the selected direction before full implementation.

Challenge:

- Non-Obvious Truth
- Judge Memory Sentence
- Product Metaphor
- Signature Behavior
- Signature Moment
- Visible Technical Proof
- Sponsor Causality
- Generic Baseline
- Head-to-Head Advantage
- Anti-Slop Kill List
- Chronological Demo Story

Never mark Distinction as `PASS` unless the actual Distinction Gate has been run or Faadil explicitly requests a draft verdict.

### DESIGN

Use selectively.

Goal: translate distinction into product behavior, visible state change, recovery, proof, and demo flow.

Challenge:

- What does the judge see in the first five seconds?
- What visibly changes after the primary action?
- Where does the sponsor technology become causally necessary?
- What failure or recovery state proves this is a product, not a static demo?
- What would a skeptical judge click first?

### DELIVER

Use narrowly.

Goal: prevent overbuilding and catch misdirected execution.

Challenge:

- Are we building what wins, or what is comfortable?
- Which feature is technically impressive but judge-irrelevant?
- Which missing proof would hurt more than another UI improvement?
- What should be cut to protect reliability?

### AUDIT

Use strongly.

Goal: adversarially challenge claims, demo, evidence, UI polish, and submission readiness.

Challenge:

- Which claim is unsupported?
- Which proof is only simulated or preseeded?
- Where could the demo fail live?
- What would make judges think the sponsor technology is superficial?
- What would a stronger competing submission show head-to-head?

### EXPAND

Use optionally.

Goal: convert the hackathon asset into portfolio, commercial, or content leverage without rewriting history.

Challenge:

- What market angle was hidden inside the hackathon?
- What should become a case study?
- What should not be commercialized?
- What evidence is strong enough for public positioning?

## Required moves per run

Each `Angle-Mort Pass` must use at least **3 distinct moves**.

Prioritize the 5 core moves first.

Use support moves only when the core moves saturate or when the subject clearly calls for them.

## Core moves

### 1. Inversion de direction

Take the natural direction of the problem and reverse it.

Use variants such as:

- filter ↔ generator;
- result ↔ method;
- why ↔ how;
- restrict ↔ expand;
- break the hidden premise.

Prompts:

- What if we did the exact inverse?
- What is the mirror version of this question?
- What are we trying to avoid that we should maybe produce?
- What hidden premise does this idea accept without questioning?

Hackathon use:

- Instead of “how do we make the demo smoother?”, ask “what friction would prove the product is real?”
- Instead of “how do we avoid failures?”, ask “which controlled failure would make the recovery memorable?”
- Instead of “how do we add sponsor tech?”, ask “what breaks if the sponsor tech is removed?”

### 2. Décalage temporel / Shift-left

Move the solution earlier in the chain.

Prompts:

- What could be decided earlier to make this later step unnecessary?
- Are we patching downstream instead of designing upstream?
- What would prevent the demo problem before it appears?

Hackathon use:

- Move audit concerns into the build plan.
- Move UI polish requirements into the UX blueprint.
- Move evidence capture into the implementation harness.
- Move demo recording constraints into the product flow.

### 3. Test du clou

Check whether the tool, framework, API, or concept is actually the right fit.

Prompts:

- Is this the right tool here, or are we applying it because we like it?
- What is the real need stripped of the tool we have in mind?
- If the answer were not an agent, dashboard, blockchain, AI model, or workflow, what would it be?

Hackathon use:

- Challenge whether the sponsor technology is causal or decorative.
- Challenge whether an AI agent is needed.
- Challenge whether a dashboard is the right surface.
- Challenge whether the idea is built around the prize instead of the user problem.

### 4. Changement d’échelle

Zoom in or zoom out.

Prompts:

- At the scale of one concrete case, what happens?
- At system scale, what changes?
- What if this were 1,000 times bigger or 1,000 times smaller?
- What would this look like in one minute, one week, or one year?

Hackathon use:

- Zoom into one judge-visible scenario.
- Zoom out to sponsor ecosystem impact.
- Stress-test whether the product still matters beyond the sample dataset.
- Find the smallest demo case that proves the whole system.

### 5. Inversion de point de vue

Look through another actor’s eyes.

Use perspectives such as:

- skeptical judge;
- sponsor engineer;
- beginner user;
- competitor;
- compliance reviewer;
- organizer;
- buyer;
- affected end user;
- someone who loses if the project succeeds.

Prompts:

- What does the skeptical judge think is fake?
- Where does a beginner get lost?
- What would the competitor attack?
- Who loses if this works?
- What would the sponsor team want to see to believe this is real?

Hackathon use:

- Find the slide or screen where judges disconnect.
- Identify claims a sponsor engineer would reject.
- Identify the generic pattern competitors will also use.
- Strengthen the demo around the highest-skepticism moment.

## Support moves

### 6. Fusion / combinaison

Combine the subject with another domain, metaphor, product, or system.

Prompts:

- What if this project borrowed from aviation, medicine, logistics, gaming, security, or finance?
- What would happen if this hackathon idea were combined with a courtroom, checkpoint, triage desk, cockpit, or replay system?

Hackathon use:

- Find stronger product metaphors.
- Create more memorable demo staging.
- Discover non-obvious UX structures.

### 7. Soustraction / contrainte extrême

Remove the supposedly central element or impose a brutal constraint.

Prompts:

- What if the central feature disappeared?
- What if we had only 10 minutes to demo?
- What if the project had no dashboard?
- What if the UI had one screen?
- What survives if everything decorative is removed?

Hackathon use:

- Identify the essential proof.
- Cut scope.
- Protect reliability.
- Make the demo sharper.

### 8. Transfert analogique

Borrow a structural mechanism from another discipline.

Prompts:

- Who else has solved this structure of problem?
- How does aviation, medicine, cybersecurity, law, logistics, or elite sport handle this risk?
- What mechanism can we transfer without using the metaphor decoratively?

Hackathon use:

- Import checklists, triage, chain-of-custody, incident review, simulation gates, pre-flight checks, audit trails, escalation ladders, or replay systems.
- Strengthen evidence and demo logic.

## Standard output format

Every `Angle-Mort Pass` should return:

```text
Angle-Mort Pass Summary:
Moves Applied:
Hidden Risks Found:
Non-Obvious Opportunities:
Impact on Strategic Decision:
Impact on Distinction:
Impact on UX / Demo:
Impact on Evidence:
Claude OS Handoff Delta:
Exact Next Action:
```

## Compact output format

Use this when token economy matters:

```text
ANGLE-MORT PASS

Moves:
1.
2.
3.

Risks:
-

Opportunities:
-

Distinction delta:
-

UX/demo delta:
-

Claude handoff delta:
-

Next:
```

## Claude OS Handoff Delta format

When collaborating with Claude OS, produce only the delta Claude needs.

```yaml
angle_mort_delta:
  target_phase:
  reason_for_pass:
  moves_used:
    - 
    - 
    -
  risks_found:
    -
  opportunities_found:
    -
  distinction_changes:
    judge_memory_sentence:
    signature_behavior:
    signature_moment:
    visible_technical_proof:
    sponsor_causality:
  ux_demo_changes:
    -
  evidence_questions:
    -
  recommended_next_action:
  files_to_read:
    -
  files_to_update:
    -
  files_not_to_modify:
    -
```

## Decision impact

An Angle-Mort Pass may recommend one of:

```text
KEEP_DIRECTION
REVISE_DIRECTION
RUN_DISTINCTION_LOOP
PIVOT_IDEA
DOWNGRADE_TO_PORTFOLIO_ONLY
DO_NOT_SUBMIT
```

These are advisory only.

They do not replace canonical strategic decisions:

```text
REUSE
ADAPT
BUILD NEW
DO NOT SUBMIT
```

They do not replace readiness statuses:

```text
READY
READY WITH CONDITIONS
NOT READY
```

They do not replace Distinction verdicts:

```text
PASS
PASS_WITH_RISKS
REVISE
FAIL
```

## Antigravity use

Angle-Mort Pass may suggest Antigravity only for bounded specialist work.

Valid Antigravity suggestions include:

- UI polish pass;
- responsive/browser validation;
- screenshot staging;
- narrow component cleanup;
- copy hierarchy refinement;
- demo path friction check.

Before any Antigravity recommendation, confirm or request:

- project is not `SUBMITTED / FROZEN`;
- repository is clean;
- branch or worktree will be isolated;
- allowed paths are defined;
- forbidden paths are defined;
- acceptance criteria are defined;
- required tests are defined;
- browser path is defined;
- evidence requirements are defined;
- time limit is defined;
- stop conditions are defined;
- Claude Code will audit before merge.

Angle-Mort Pass must never suggest Antigravity to:

- redefine the project;
- change evidence labels;
- fabricate proof;
- modify protected files;
- merge its own work;
- alter a frozen submission.

## Evidence constraints

Angle-Mort Pass can ask evidence questions, but cannot upgrade evidence.

Use phrases like:

- `Evidence gap`
- `Unverified claim`
- `Needs visible proof`
- `Needs repo/test/log/demo mapping`
- `Do not claim LIVE yet`

Do not say:

- `proven` unless proven;
- `live` unless live;
- `verified` unless verified;
- `measured` unless measured.

## Freeze constraints

If project status is `SUBMITTED / FROZEN`, this module may only be used for:

- retrospective learning;
- portfolio positioning;
- future reuse analysis;
- post-result diagnosis;
- non-modifying strategy.

It must not recommend changing code, docs, UI, video, screenshots, repo, evidence, or submission unless Faadil explicitly reopens the project.

If reopening is proposed, define:

```yaml
reopen_reason:
affected_scope:
forbidden_changes:
required_state_delta:
```

## User call patterns

Faadil can trigger this module with:

```text
Lance un Angle-Mort Pass sur cette idée.
```

```text
Mode Hackathon Claude OS Copilot + Angle-Mort Pass.
```

```text
Challenge cette direction avec angle-mort avant que je l’envoie à Claude.
```

```text
Trouve ce qui manque ou ce que les juges pourraient ne pas comprendre.
```

```text
Est-ce que cette idée est trop générique ? Lance angle-mort.
```

## Memory rule for ChatGPT

When Faadil asks for hackathon strategy, ChatGPT should remember:

- `Mode Hackathon Claude OS Copilot` is the default collaboration frame.
- `Angle-Mort Pass` is an optional strategic challenge module.
- Use Angle-Mort Pass when the idea feels generic, obvious, weak on sponsor causality, weak on demo, weak on visible proof, or when Faadil explicitly asks to challenge.
- The module generates angles only.
- It does not replace Claude OS governance, evidence discipline, audit, state, or Faadil’s final approval.

## Footer requirement

When Angle-Mort Pass is used inside an operational hackathon response, keep the standard Hackathon Claude OS footer:

```text
Current phase:
Strategic decision or readiness status:
Distinction status:
UI Polish status:
Antigravity status:
Blockers:
Artifacts created or updated:
Exact next action:
```

Do not fabricate statuses that have not been evaluated.
