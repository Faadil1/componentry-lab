HACKATHON LOOPS
Mission
Improve Hackathon Claude outputs through controlled iteration without wasting tokens, repeating context, or endlessly rewriting completed work.
Loops exist to improve:

evidence quality
project selection
distinction
feasibility
MVP clarity
demo reliability
UI polish readiness
submission readiness
venture validation

Loops must always be:

bounded
targeted
measurable
incremental
resumable
evidence-driven
token-aware
contract-safe
freeze-aware

A loop must never exist simply because “more improvement may be possible.”

Core Principle
Loop only when there is measurable decision value.
Stop when:

the target is reached
the decision no longer changes
the marginal improvement is too small
no new evidence exists
the maximum iteration count is reached
the user must make a decision
the root cause belongs to another department
the project is SUBMITTED / FROZEN and has not been reopened


Global Loop Requirements
Before starting any loop, define:

loop name
trigger
target
metric
baseline
maximum iterations
stop conditions
affected fields
affected artifact
protected contracts
required evidence
evidence labels
expected decision impact
freeze status

A loop without a target and stop condition is invalid.

A loop is also invalid when:

- it attempts to repair an upstream structural problem in a downstream module;
- it changes the approved distinction without revalidation;
- it changes evidence labels without new evidence;
- it modifies a `SUBMITTED / FROZEN` project without explicit reopening;
- it delegates write work to Antigravity without a bounded branch or worktree.

Global Loop Limits
Default maximum automatic iterations:
3
Exceptions:

Critical Review Loop: 2
MVP Reduction Loop: 2
Distinction Refinement Loop: 2
UI Polish Revision Loop: 2
Venture Validation Loop: 2

Any additional iteration requires explicit user instruction.

Global Improvement Threshold
A loop should continue only if one of the following is true:

expected score improvement is at least 3 points
a blocking unknown may be resolved
a critical risk may be mitigated
an eligibility decision may change
the selected idea may change
readiness status may change
demo reliability may materially improve
Distinction verdict may change
UI Polish gate may change
sponsor causality may become demonstrable
Antigravity integration risk may be resolved
real-world validation may become actionable

Stop when improvement is below 3 points unless the change resolves a fatal risk.

Delta-Only Rule
Each iteration must output only:

what changed
why it changed
affected score
decision impact
remaining weakness
CONTINUE or STOP

Do not rewrite:

the full project
the full idea card
the full submission
the full research summary
the full product blueprint
the full Distinction Brief
the full visual system

Unchanged content remains valid.

Score Update Rule
Recalculate only affected criteria.
Example:
A UX improvement may affect:

Demo Potential
User Value
Differentiation
Signature Behavior Visibility

It should not automatically recalculate:

Eligibility
Technical Feasibility
Prior-Work Risk


Loop State Format
Every loop must maintain:
yamlloop:
  name:
  status: NOT_STARTED | ACTIVE | COMPLETE | STOPPED | BLOCKED
  trigger:
  target:
  metric:
  iteration:
  max_iterations:
  baseline:
  current:
  affected_fields:
  affected_artifact:
  protected_contracts:
  owner:
  branch_or_worktree:
  changes:
  evidence_added:
  evidence_labels:
  freeze_status:
  remaining_weakness:
  stop_reason:
  next_action:

LOOP 1 — RESEARCH GAP LOOP
Purpose
Resolve only the missing external evidence that blocks a decision.
Trigger
Start when:

eligibility is unclear
prior-work policy is unclear
mandatory technology is unclear
submission requirements are unclear
judging criteria are incomplete
current submission evidence is insufficient
a funding program requires current verification

Do Not Start When

more research is merely interesting
the decision can already be made confidently
additional sources repeat known findings
no blocking unknown exists

Process
Iteration 1

List blocking unknowns.
Rank by decision impact.
Research only the highest-impact unknowns.
Update confidence.
Reassess decision.

Iteration 2

Research unresolved high-impact unknowns.
Prefer official sources.
Resolve source conflicts.
Update state.

Iteration 3

Make final targeted attempt.
If unresolved, mark UNKNOWN.
Block dependent decisions if necessary.

Stop Conditions
Stop when:

all blocking unknowns are resolved
two searches add no new useful evidence
official sources are unavailable
maximum iterations are reached
remaining unknowns do not affect the decision

Output
yamlresearch_gap_iteration:
  unknown_targeted:
  query_or_source:
  new_evidence:
  confidence_before:
  confidence_after:
  decision_impact:
  remaining_unknowns:
  action: CONTINUE | STOP

LOOP 2 — IDEA REFINEMENT LOOP
Purpose
Improve a promising idea without regenerating the full idea set.
Trigger
Start when:

best idea scores between 70 and 79
idea has a fixable weakness
differentiation is weak but correctable
Distinction Pre-Screen is weak but correctable
demo potential is weak but correctable
sponsor technology fit is weak but correctable
feasibility can improve through scope reduction

Do Not Start When

idea violates eligibility
idea is fundamentally off-theme
required technology is superficial
score is below 65
weakness requires a completely different concept
a stronger finalist already exists

Process

Identify the two weakest criteria.
Propose one high-leverage modification.
Update only affected fields.
Recalculate only affected scores.
Compare with baseline.
Keep or reject modification.
Continue only if improvement remains meaningful.

Preferred Improvement Order

Eligibility and theme fit
Mandatory technology fit
Distinction Pre-Screen
Differentiation
Demo potential
Feasibility
User value
Portfolio value

Stop Conditions
Stop when:

score reaches 80
improvement is below 3 points
three iterations are complete
remaining weakness requires a new idea
the runner-up becomes stronger

Output
yamlidea_refinement_iteration:
  idea_id:
  weak_criteria:
  change:
  score_before:
  affected_scores_before:
  affected_scores_after:
  total_score_after:
  decision_impact:
  action: CONTINUE | STOP | REPLACE_WITH_RUNNER_UP

LOOP 3 — CRITICAL REVIEW LOOP
Purpose
Challenge the preferred idea or submission from multiple judge perspectives.
Trigger
Start when:

a project is about to be selected
a project is about to be submitted
a high-severity objection remains
sponsor technology usage may appear superficial
the project may appear generic or recycled
claims may appear scripted or unverifiable

Judge Perspectives

Technical Judge
Product Judge
Business Judge
Sponsor Judge
Generalist Judge
Time-Pressed Judge
Skeptical Competitor
Visual Quality Judge when a visual surface exists

Process
Each perspective returns only:
yamlreview:
  perspective:
  objection:
  severity: LOW | MEDIUM | HIGH | FATAL
  evidence:
  fix:
  affected_score:
Then:

Merge duplicate objections.
Rank by severity.
Fix only high-impact issues.
Reassess affected scores.

Stop Conditions
Stop when:

no FATAL objection remains
no unresolved HIGH objection remains
maximum 2 iterations are complete
remaining objections are acceptable risks
proposed fixes damage feasibility more than they help

Output
yamlcritical_review_iteration:
  objections_added:
  duplicates_merged:
  fatal_remaining:
  high_remaining:
  fixes_applied:
  score_impact:
  action: CONTINUE | STOP | PIVOT

LOOP 4 — MVP REDUCTION LOOP
Purpose
Reduce scope until the project fits time, reliability, and demo constraints.
Trigger
Start when:

build exceeds available time
demo is too complex
too many features exist
technical dependencies are excessive
the Signature Moment is buried
the Signature Behavior is diluted
sponsor causality is obscured
reliability is weakened by optional functionality

Feature Test
For every feature ask:

Does it improve judging score?
Does it create core proof?
Does it support the Signature Behavior?
Does it support the Signature Moment?
Does it preserve sponsor causality?
Is it required by the rules?
Does it improve reliability?
Will judges actually see it?

If all answers are no:
Remove it.
Process

List all features.
Mark:

CORE
SUPPORTING
OPTIONAL


Remove OPTIONAL features.
Recalculate effort.
Remove SUPPORTING features that do not affect proof.
Recheck user journey and demo.
Preserve only the smallest winning experience.

Stop Conditions
Stop when:

scope fits available time
core proof remains intact
Signature Behavior remains intact
Signature Moment remains intact
sponsor causality remains intact
no non-essential feature remains
two iterations are complete

Output
yamlmvp_reduction_iteration:
  removed:
  preserved:
  effort_before:
  effort_after:
  proof_impact:
  demo_impact:
  action: CONTINUE | STOP | PIVOT

LOOP 5 — DEMO RELIABILITY LOOP
Purpose
Increase the probability that the demo succeeds under real judging conditions.
Trigger
Start when:

live API may fail
tool calls are unstable
latency is high
cold starts exist
data loading is slow
fallback is missing
the Signature Moment depends on one fragile step
proof labels may become unclear during fallback

Process

Simulate the demo path.
Identify the first likely failure.
Add one mitigation.
Define fallback.
Re-simulate.
Record residual risk.

Risk Priorities

Core workflow failure
Missing output
Excessive latency
Authentication failure
Data dependency failure
UI confusion
Signature Behavior failure
proof disappearance
evidence-label mismatch
Timing overrun

Mitigation Examples

minimum cloud instance
seeded dataset
cached result
retry logic
prerecorded fallback
static screenshot
simplified live path
offline result mode
reduced number of tool calls

Stop Conditions
Stop when:

all critical failure points are mitigated
fallback is ready and truthfully labeled
Signature Moment remains reproducible
three iterations are complete
remaining risk is acceptable
reliability cannot improve without changing the product

Output
yamldemo_reliability_iteration:
  failure_point:
  severity:
  mitigation:
  fallback:
  risk_before:
  risk_after:
  action: CONTINUE | STOP | REDESIGN

LOOP 6 — SUBMISSION AUDIT LOOP
Purpose
Raise the submission to the readiness threshold using targeted corrections.
Trigger
Start when:

score is below 85
no fatal blocker exists
failed gates are repairable
evidence mapping is incomplete
written sections are weak
judging coverage is incomplete
demo and submission are nearly ready

Process

Identify lowest-scoring criteria.
Identify failed gates.
Select highest-leverage correction.
Update only affected artifact.
Recalculate only affected scores.
Check readiness status.

Priority Order

Eligibility
Required deliverables
Core functionality
Mandatory technology
Sponsor causality
Verifiable proof
Distinction and Signature Behavior
Demo reliability
Required UI Polish
Antigravity governance
Differentiation
Written clarity
Portfolio polish

Stop Conditions
Stop when:

score reaches 85
all required gates pass
no critical risk remains
improvement is below 3 points
three iterations are complete
remaining issue requires rebuilding the product

Output
yamlsubmission_audit_iteration:
  failed_gate:
  weak_criterion:
  correction:
  score_before:
  score_after:
  readiness_before:
  readiness_after:
  action: CONTINUE | STOP | NOT_READY

LOOP 7 — DISTINCTION REFINEMENT LOOP
Purpose
Strengthen the selected idea's approved distinction without reopening broad
ideation or changing the core problem unnecessarily.

Trigger
Start when:

the selected idea passed the Idea threshold
Distinction verdict is REVISE
Distinction verdict is PASS_WITH_RISKS with a repairable weakness
Judge Memory Sentence is forgettable
Signature Behavior is unclear or not product-level
Signature Moment lacks visible proof
sponsor causality is weak
head-to-head advantage is not visible
Anti-Slop Kill List is incomplete

Do Not Start When

the idea is ineligible
the central technical assumption is blocked
the idea score is below the selection threshold
the weakness requires a completely new user or problem
full implementation has already been frozen
the project is SUBMITTED / FROZEN

Protected Contracts

primary user
primary problem
mandatory technology
official judging constraints
confirmed evidence
approved strategic decision

Process

Identify the single weakest distinction component.
Propose one high-leverage correction.
Update only the affected distinction fields.
Test the correction against:

judge memory
functional visibility
technical proof
sponsor causality
competent generic baseline
demo feasibility

Recalculate only affected Distinction criteria.
Require human selection when two directions remain materially different.

Preferred Improvement Order

Signature Behavior
Visible Technical Proof
Sponsor Causality
Judge Memory Sentence
Signature Moment
Head-to-Head Advantage
Product Metaphor
Anti-Slop Kill List

Stop Conditions
Stop when:

verdict reaches PASS
verdict reaches PASS_WITH_RISKS with finite accepted risks
improvement is below 3 points
two iterations are complete
the correction requires a new idea
technical feasibility is damaged
human selection is required

Output
yamldistinction_refinement_iteration:
  weak_component:
  protected_contracts:
  change:
  score_before:
  affected_scores_before:
  affected_scores_after:
  score_after:
  verdict_before:
  verdict_after:
  visible_proof_impact:
  sponsor_causality_impact:
  head_to_head_impact:
  human_decision_required:
  action: CONTINUE | STOP | PIVOT | REPLACE_WITH_RUNNER_UP

LOOP 8 — UI POLISH REVISION LOOP
Purpose
Repair judge-visible visual defects after UX and proof are stable, without
redesigning the product or creating a second visual direction.

Trigger
Start when:

a judge-visible surface exists
UI Polish status is REVISION_REQUIRED
UI Polish status is READY_WITH_RISKS and a finite repair is worthwhile
Screenshot Recognition Test fails
Signature Behavior is visually unclear
proof is buried
sponsor causality is not visible
responsive behavior fails
accessibility issue is repairable
browser errors affect the judge path
generic AI or SaaS patterns remain

Do Not Start When

core proof is not stable
UX architecture is not approved
Distinction is not approved
the issue is a backend or evidence failure
no visual surface exists
the project is SUBMITTED / FROZEN
the proposed change requires a new visual direction

Protected Contracts

approved visual direction
Product Metaphor
Signature Behavior
Signature Moment
proof meaning
sponsor claims
evidence labels
primary demo path

Process

Select one judge-visible defect cluster.
Patch only affected components or states.
Run the required viewport and browser checks.
Verify:

Signature Behavior visibility
proof visibility
sponsor causality visibility
responsive behavior
accessibility
console and network status
screenshot recognition

Recalculate only affected UI Polish criteria.
Antigravity may execute the bounded patch only through a dedicated branch or
worktree and must return evidence for Claude audit.

Stop Conditions
Stop when:

UI Polish reaches READY
UI Polish reaches READY_WITH_RISKS with finite accepted risks
two iterations are complete
remaining issues are cosmetic and non-scoring
the root cause belongs to UX, Product, Execution, or Evidence
the change would reopen the approved visual direction

Output
yamlui_polish_revision_iteration:
  defect_cluster:
  affected_components:
  protected_contracts:
  owner:
  branch_or_worktree:
  change:
  browser_checks:
  evidence_added:
  score_before:
  affected_scores_before:
  affected_scores_after:
  score_after:
  status_before:
  status_after:
  remaining_risk:
  claude_audit_verdict:
  action: CONTINUE | STOP | ROUTE_UPSTREAM | NOT_READY

LOOP 9 — VENTURE VALIDATION LOOP
Purpose
Determine the smallest next validation for real-world commercialization.
Trigger
Start when:

the project shows real-world potential
market evidence is weak
buyer is unclear
data access is uncertain
funding readiness is uncertain
product-vs-service path is unclear

Do Not Start When

submission work is unfinished
project is not ready
user does not want commercialization analysis
no real-world value hypothesis exists

Process

Identify weakest commercial assumption.
Define smallest validation.
Define evidence required.
Estimate time and cost.
Reassess venture decision.

Validation Types

user interview
buyer interview
paid discovery
letter of intent
pilot
data access agreement
pricing test
landing page test
open-source release
technical feasibility test

Stop Conditions
Stop when:

clear next validation exists
venture decision becomes clear
two iterations are complete
evidence remains insufficient
project should remain portfolio-only

Output
yamlventure_validation_iteration:
  assumption:
  validation:
  evidence_required:
  cost:
  time:
  decision_before:
  decision_after:
  action: CONTINUE | STOP

Loop Selection Matrix
ConditionLoopMissing official informationResearch GapStrong idea below thresholdIdea RefinementSelected idea lacks approved distinctionDistinction RefinementHigh-severity objectionCritical ReviewScope too largeMVP ReductionDemo unstableDemo ReliabilityUI Polish gate repairableUI Polish RevisionSubmission below 85Submission AuditCommercial potential unclearVenture Validation
Only one primary loop should run at a time unless two loops are clearly independent.

Loop Priority
Use this priority order:

Research Gap
Critical Eligibility Issue
Technical Validation
Idea Refinement
Distinction Refinement
MVP Reduction
Demo Reliability
UI Polish Revision
Submission Audit
Venture Validation

Do not improve polish before resolving eligibility, feasibility, core proof,
or distinction.

Route upstream when the root cause is upstream:

```text
UI defect caused by UX architecture → UX
proof defect → Product / Execution / Evidence
sponsor-causality defect → Product / Technical Validation
distinction defect → Distinction Refinement
submission wording defect → Submission Audit
```

Loop Handoff Protocol
At the end of a loop, create:
yamlloop_handoff:
  loop:
  status:
  final_score:
  final_gate_status:
  unresolved:
  protected_contracts_preserved:
  evidence_labels_preserved:
  antigravity_used:
  claude_audit_verdict:
  freeze_status:
  state_fields_updated:
  artifact_updated:
  next_department:
Then update HACKATHON-STATE.md.

Token Budget Rules
Research Gap Loop
Use:

shortest possible query set
official sources first
maximum 3 evidence targets per iteration

Idea Refinement Loop
Use:

one change per iteration
no regeneration of all ideas
partial score updates only

Critical Review Loop
Use:

one objection per perspective
merged duplicates
short evidence statements

MVP Reduction Loop
Use:

feature table
no prose rewrite
effort deltas only

Distinction Refinement Loop
Use:

one component per iteration
no broad idea regeneration
partial distinction score updates only
human selection only for material direction choices

Demo Reliability Loop
Use:

failure / mitigation / fallback format
no full demo rewrite unless required

UI Polish Revision Loop
Use:

one defect cluster per iteration
affected components only
required browser evidence
no new visual direction

Submission Audit Loop
Use:

failed gate first
targeted patch only
no full submission rewrite

Venture Validation Loop
Use:

one assumption
one validation
one decision update


Loop Compression Rule
If a loop output exceeds the value of the change:
Compress to:
yamliteration:
target:
change:
score_delta:
decision_delta:
stop_reason:

User Decision Gate
Pause and ask for user direction only when:

two finalists are effectively tied
a major tradeoff depends on personal preference
budget or time commitment changes the project choice
commercialization requires personal risk tolerance
the user must choose between speed and ambition
two distinction directions remain materially different
a major visual direction must be selected

Do not ask for confirmation for routine internal improvements.

Anti-Loop Safeguards
Never:

restart from iteration 1 without reason
rerun a completed loop automatically
change unrelated sections
inflate scores without evidence
continue because “more improvement is possible”
perform unlimited brainstorming
rewrite complete artifacts when a patch is sufficient
use loops to hide a fundamentally weak idea
change evidence labels without new evidence
reopen approved distinction during UI Polish
run Antigravity write loops on the main branch
merge Antigravity output without Claude audit
modify a SUBMITTED / FROZEN project without explicit reopening


Final Loop Decision
Every loop must end with exactly one:

COMPLETE
STOPPED
BLOCKED
PIVOT
REPLACE WITH RUNNER-UP
NOT READY


Final Rule
A loop is valuable only when it changes:

evidence
score
risk
decision
readiness
next action
gate status

If none of these change, stop immediately.

A loop must preserve:

```text
truth
protected contracts
evidence labels
freeze integrity
```

Improvement that violates one of these is not improvement.