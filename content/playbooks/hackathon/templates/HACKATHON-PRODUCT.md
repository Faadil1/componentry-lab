HACKATHON-PRODUCT.mdHACKATHON PRODUCT
Mission
Transform the selected hackathon idea into the smallest credible product capable of producing strong judge belief.
The Product Department converts strategy into:

a clear user
a precise problem
a focused workflow
an approved distinctive product behavior
a visible proof
a buildable MVP
a technically credible architecture
a causal sponsor integration
a reliable demo foundation

The objective is not to maximize features.
The objective is to maximize:

clarity
distinction preservation
proof
feasibility
judging value
demo reliability
technical credibility
sponsor causality
head-to-head advantage


Claude's Role
You are:

Product Strategist
MVP Architect
AI Product Designer
Technical Product Manager
Scope Controller
Risk Analyst
Proof Designer
Distinction Contract Guardian
Sponsor Causality Auditor

You must protect the project from:

vague positioning
oversized scope
feature creep
weak proof
distinction drift
generic AI product behavior
superficial sponsor technology
untested technical assumptions
unclear user value
a second competing Signature Moment


Required Inputs
The Product Department receives:

Product Context Packet
selected idea
runner-up reference
approved DISTINCTION-BRIEF.md
Product Handoff Packet (`product_handoff`)
Judge Memory Sentence
Non-Obvious Truth
Product Metaphor
Signature Behavior
Signature Moment
Visible Technical Proof
Sponsor Causality
Head-to-Head Advantage
Anti-Slop Kill List
Hackathon Snapshot
Judging Strategy
Landscape constraints
Portfolio constraints
build time
demo limit
mandatory technologies
critical risks
current HACKATHON-STATE.md

Do not reopen rejected ideas unless the selected idea becomes blocked.

If `DISTINCTION-BRIEF.md` is missing or has verdict `FAIL`:

```text
PRODUCT → BLOCKED
```

The Product Department must preserve the approved distinction. It must not
invent a new Judge Memory Sentence, Signature Behavior, or Signature Moment.

Core Principles
Principle 1 — Product Before Features
Define:

user
problem
trigger
workflow
Signature Behavior
proof
outcome

before listing features.

The approved distinction is a product contract, not optional positioning copy.

Principle 2 — One Primary User
Do not design for:

consumers
enterprises
developers
regulators
investors

at the same time.
Choose one primary user.
Secondary users may exist, but they should not distort the MVP.

Principle 3 — One Primary Workflow
The MVP should have one dominant path.

Example:

```text
Signal
↓
Investigation
↓
Signature Behavior
↓
Evidence
↓
Decision
↓
Action
```

Avoid multiple disconnected workflows.

The workflow must contain the actual condition that triggers the approved
Signature Behavior.

Principle 4 — Proof Is a Product Requirement
The product must visibly prove:

what happened
what condition triggered the Signature Behavior
how the system reached the result
why the sponsor technology mattered
why the result matters
what action follows

The proof must exist in the product state, not only in narration or README text.


Principle 5 — Sponsor Technology Must Be Causal
The mandatory technology should enable the core product behavior.

The Product Blueprint must state:

```text
what the sponsor technology enables
what would fail or materially weaken without it
where that dependency becomes visible
```

It must not be an optional infrastructure detail or logo-level integration.

Principle 6 — Build the Smallest Winning Experience
Every feature must justify itself through:

judging score
Signature Behavior
proof
reliability
required functionality
demo value
head-to-head advantage

Otherwise remove it.

Principle 7 — Preserve One Distinctive Direction
The product must preserve:

- one Judge Memory Sentence;
- one Signature Behavior;
- one Signature Moment;
- one Product Metaphor when structurally useful;
- one primary demo story.

Do not add a second distinctive mechanism merely to make the product feel larger.

Principle 8 — Beat the Competent Generic Baseline
The MVP must make the approved head-to-head advantage visible.

Do not approve a product that remains equivalent to:

- CRUD + LLM;
- generic chatbot;
- generic dashboard;
- prompt → answer workflow;
- sponsor SDK used only in the backend.

Product Workflow
Step 0 — Validate the Distinction Contract

Record:

```yaml
distinction_contract:
  verdict:
  approved_direction:
  judge_memory_sentence:
  non_obvious_truth:
  product_metaphor:
  signature_behavior:
  signature_moment:
  visible_proof:
  sponsor_causality:
  competent_generic_baseline:
  head_to_head_advantage:
  anti_slop_kill_list:
```

Proceed only when:

```text
verdict = PASS | PASS_WITH_RISKS
```

If `PASS_WITH_RISKS`, copy the unresolved risks into the Product Blueprint and
protect them from being silently ignored.

Step 1 — Define Positioning
Complete:
yamlpositioning:
  one_sentence:
  category:
  target_user:
  primary_problem:
  non_obvious_truth:
  unique_value:
  judge_memory_sentence:
  measurable_outcome:
Formula:

[Project] helps [target user] solve [specific problem] by [distinct workflow], producing [measurable or visible outcome].


Step 2 — Define User and Buyer
Record:
yamluser_model:
  primary_user:
  secondary_user:
  economic_buyer:
  trigger_event:
  current_workaround:
  adoption_barrier:
If buyer is unknown:

mark UNKNOWN
do not invent

For hackathon purposes, user clarity is mandatory even when buyer clarity is not.

Step 3 — Define the Problem
A strong problem statement includes:

current situation
user pain
consequence
existing limitation
urgency

Template:
yamlproblem:
  current_state:
  pain:
  consequence:
  current_alternative:
  why_current_alternative_fails:

Step 4 — Define the Product Outcome
State:
yamloutcome:
  user_before:
  triggering_condition:
  signature_behavior:
  system_action:
  visible_state_change:
  user_after:
  decision_improved:
  value_created:

Step 5 — Define the Core Workflow
Use:
yamlcore_workflow:
  trigger:
  input:
  analysis_or_action:
  signature_condition:
  signature_behavior:
  visible_state_change:
  sponsor_enabled_step:
  proof:
  recommendation:
  user_action:
  outcome:
The workflow should be understandable in under 30 seconds.

Step 6 — Define the Core Proof
The project must have one central proof.
Examples:

dynamically generated investigation
verified evidence timeline
real-time risk detection
measurable time reduction
live workflow completion
visible sponsor technology action

Record:
yamlcore_proof:
  claim:
  visible_evidence:
  technical_evidence:
  business_evidence:
  sponsor_dependency:
  evidence_label:
  verification_method:

Step 7 — Define the Signature Moment
Record:

```yaml
signature_moment:
  trigger:
  precondition:
  signature_behavior:
  visible_change:
  technical_mechanism:
  proof_shown:
  consequence:
  judge_takeaway:
  target_duration_seconds:
```

The Signature Moment must:

- happen within 60 seconds;
- last approximately 5–15 seconds;
- be understandable without deep technical explanation;
- support a high-value judging criterion;
- expose proof;
- be reproducible;
- be difficult to dismiss as scripted;
- reinforce the Judge Memory Sentence.

A decorative animation or generic model response does not qualify.


Step 8 — Define the MVP
Use four levels.
Must Have
Required for:

core proof
judging eligibility
sponsor technology usage
demo flow

Should Have
Improves score but is not essential.
Could Have
Only if time remains after reliability.
Will Not Build
Explicitly excluded.

Feature Evaluation
For every proposed feature score:
yamlfeature:
  name:
  judging_value: 0-5
  distinction_value: 0-5
  proof_value: 0-5
  sponsor_causality_value: 0-5
  demo_value: 0-5
  reliability_value: 0-5
  effort: 0-5
  dependency_risk: 0-5
  genericity_risk: 0-5
  decision: KEEP | DEFER | REMOVE
A feature should usually be removed when:

total value is lower than effort + risk
judges will not see it
it does not support proof
it does not support the Signature Behavior
it creates a second workflow
it creates a second Signature Moment
it weakens sponsor causality
it increases genericity
it weakens reliability


MVP Reduction Integration
Use HACKATHON-LOOPS.md when:

total effort exceeds available time
demo has too many steps
dependencies are excessive
optional features compete with reliability


Step 9 — Define Technical Architecture
Record:
yamlarchitecture:
  frontend:
  backend:
  model:
  agent_framework:
  tools:
  data_source:
  database:
  sponsor_technology:
  sponsor_causality_path:
  signature_behavior_path:
  proof_generation_path:
  hosting:
  authentication:
  observability:
  fallback_mode:
Architecture should explain:

where intelligence lives
how data flows
where sponsor technology is used
what sponsor technology causally enables
where the Signature Behavior is generated
how outputs are verified
what happens when a component fails


Architecture Simplicity Rule
Prefer:

fewer services
fewer external dependencies
fewer tool calls
fewer authentication flows
one primary data path

Avoid architecture complexity that judges cannot reward.

Step 10 — Define the Data Model
Record:
yamldata:
  source:
  type:
  real_or_synthetic:
  volume:
  freshness:
  schema:
  labels:
  access_status:
  privacy_risk:
  quality_risk:
  fallback_dataset:
Be explicit when data is synthetic.
Do not present synthetic results as real-world validated outcomes.

Step 11 — Define the Agent or AI Role
If AI is used, define:
yamlai_role:
  task:
  why_ai_is_needed:
  competent_non_ai_baseline:
  decision_authority:
  tools_available:
  context_available:
  output:
  verification:
  failure_mode:
  human_control:
Clarify whether AI:

summarizes
classifies
reasons
plans
executes
investigates
recommends
acts

Do not claim agentic behavior without visible autonomy or dynamic decision-making.

Step 12 — Define the Technical Spike
Identify the single most fragile assumption.
Examples:

model can call tools reliably
API supports required function
data can be accessed
latency fits demo
sponsor service can deploy
model output can be verified

Record:
yamltechnical_spike:
  assumption:
  distinction_dependency:
  sponsor_dependency:
  test:
  success_condition:
  visible_proof_required:
  failure_condition:
  time_limit:
  result: NOT_TESTED | PROVEN | UNCERTAIN | BLOCKED
  implication:
Run the spike before building full UX.

Technical Spike Decision
PROVEN
Continue.
UNCERTAIN
Simplify, add fallback, or run one targeted validation loop.
BLOCKED
Load runner-up or redesign the core mechanism.
Do not hide a blocked assumption behind UI work.

Step 13 — Define Reliability
Identify:

API failures
model failures
tool-call failures
cold starts
quota limits
authentication failures
data failures
latency
rendering failures
deployment failures

Record:
yamlreliability:
  critical_dependencies:
  first_failure_point:
  signature_behavior_failure:
  proof_failure:
  sponsor_failure:
  mitigation:
  fallback:
  signature_moment_fallback:
  acceptable_residual_risk:

Step 14 — Define Responsible Use
When relevant, record:
yamlresponsible_ai:
  privacy:
  bias:
  hallucination:
  false_positive_risk:
  explainability:
  human_oversight:
  user_control:
  disclosure:

Step 15 — Define Success Metrics
Hackathon metrics:

demo completion
response time
workflow completion
Signature Behavior completion
output accuracy
visible evidence
sponsor action visibility
user understanding
judge comprehension

Product metrics may include:

time saved
risk reduced
actions completed
false positives
user adoption
cost per workflow

Record only metrics that can be measured or credibly estimated.

Step 16 — Define Non-Goals
Explicitly exclude:

secondary workflows
a second Signature Behavior
a second Signature Moment
production-scale features
unnecessary integrations
advanced permissions
full enterprise reporting
broad marketplace functions
generic dashboard filler
features judges will not see


Step 17 — Define Product Risks
Classify:
Fatal
Blocks the product.
Critical
Threatens proof or demo.
Mitigable
Can be reduced.
Acceptable
Can remain with disclosure.
Record:
yamlrisk:
  description:
  severity:
  probability:
  impact:
  mitigation:
  fallback:

Step 18 — Define Product Completion
The product is complete when:

core workflow works end-to-end
approved distinction remains intact
Signature Behavior is triggered by a real condition
central technical assumption is proven
sponsor technology is causally central
core proof is visible
Signature Moment is reproducible
head-to-head advantage is visible
demo fits the limit
fallback exists
claims are verifiable
scope fits available time


Product Blueprint
Produce:
yamlproduct_blueprint:
  name:
  positioning:
  user:
  buyer:
  problem:
  outcome:

  distinction:
    judge_memory_sentence:
    non_obvious_truth:
    product_metaphor:
    signature_behavior:
    signature_moment:
    visible_proof:
    sponsor_causality:
    competent_generic_baseline:
    head_to_head_advantage:
    anti_slop_kill_list:
    verdict:
    risks:

  core_workflow:
  core_proof:

  mvp:
    must_have:
    should_have:
    could_have:
    will_not_build:

  architecture:
  data:
  ai_role:
  technical_spike:
  reliability:
  responsible_ai:
  success_metrics:
  risks:
  definition_of_done:

Product-to-Execution Packet
Produce:
yamlexecution_context_packet:
  product:
    name:
    core_workflow:
    must_have:
    non_goals:

  technical:
    architecture:
    spike_status:
    critical_dependencies:
    fallback:

  effort:
    estimated_scope:
    build_time:
    risk_buffer:

  proof:
    core_proof:
    signature_behavior:
    signature_moment:
    visible_proof:
    sponsor_causality:
    head_to_head_advantage:

  antigravity_boundary:
    allowed_product_scope:
    forbidden_product_scope:
    protected_contracts:

  risks:
    fatal:
    critical:
    mitigable:

Product-to-UX Packet
Produce:
yamlux_context_packet:
  user:
  primary_action:
  workflow:
  judge_memory_sentence:
  product_metaphor:
  signature_behavior:
  signature_moment:
  proof:
  sponsor_causality:
  head_to_head_advantage:
  anti_slop_kill_list:
  technical_transparency:
  non_goals:
  demo_limit:

Product-to-Demo Packet
Produce:
yamldemo_context_packet:
  problem:
  user:
  trigger:
  core_workflow:
  judge_memory_sentence:
  signature_behavior:
  signature_moment:
  core_proof:
  sponsor_causality:
  head_to_head_advantage:
  consequence:
  action:
  technical_evidence:
  evidence_label:
  fallback:

Antigravity Product Boundary

Antigravity may support the approved product only through
`HACKATHON-ANTIGRAVITY.md`.

Allowed after Product approval:

- prototype the approved Signature Behavior;
- test the approved interaction path;
- identify browser friction;
- suggest bounded visual alternatives;
- validate whether proof is understandable.

Antigravity may not:

- redefine the user or problem;
- replace the approved Signature Behavior;
- create a second Signature Moment;
- change architecture contracts;
- change sponsor causality claims;
- change evidence labels;
- merge its own branch.

Any write task requires a dedicated branch or worktree and Claude Code audit.

HACKATHON-STATE Update
Update:
yamlphase_update:
  phase: PRODUCT
  status:
  distinction_contract_validated:
  distinction_verdict:
  positioning_added:
  user_added:
  workflow_added:
  signature_behavior_locked:
  signature_moment_locked:
  proof_added:
  sponsor_causality_locked:
  head_to_head_advantage_locked:
  mvp_defined:
  technical_spike_status:
  risks_added:
  artifacts_created:
    - Product Blueprint
    - Execution Context Packet
    - UX Context Packet
    - Demo Context Packet
  next_phase: EXECUTION | UX | PIVOT | STOP

Product Score
Score:

| Criterion | Weight |
|---|---:|
| Problem Clarity | 8 |
| User Clarity | 8 |
| Core Workflow | 12 |
| Signature Behavior | 12 |
| Proof Strength | 14 |
| Sponsor Causality | 10 |
| Feasibility | 12 |
| Demo Potential | 8 |
| Reliability | 8 |
| Scope Discipline | 5 |
| Head-to-Head Advantage | 3 |
| **Total** | **100** |

Minimum recommended score:

```text
80 / 100
```

Mandatory minimums:

```text
Signature Behavior ≥ 7/12
Proof Strength ≥ 8/14
Sponsor Causality ≥ 6/10
Feasibility ≥ 7/12
```

Failing a mandatory minimum prevents `PRODUCT DEFINED`.

Product Critical Review
Ask:

Is the user real and specific?
Is the problem important?
Is the workflow different from a generic chatbot?
Does the product preserve the approved Signature Behavior?
Is the Signature Behavior triggered by a real condition?
Is the sponsor technology causally central?
Can the proof be verified?
Can the Signature Moment happen reliably?
Is the head-to-head advantage visible?
Does any feature violate the Anti-Slop Kill List?
Is the scope realistic?
Is the data available?
Is the AI actually necessary?
Can the project survive one failed dependency?
Would judges understand the value quickly?


Token Efficiency Rules
1. One Product Only
Do not build full blueprints for runner-up ideas.

2. Reuse Context Packets
Do not repeat Judging, Landscape, or Portfolio analysis.

3. Use Feature Scoring
Avoid long feature debates.

4. Technical Spike First
Do not spend tokens designing a blocked system.

5. Separate MVP and Future Product
Do not mix hackathon scope with full production scope.

6. Use Explicit Non-Goals
Reduce downstream confusion and feature creep.

7. Keep Architecture Decision-Relevant
Do not document implementation details that do not affect feasibility, proof, or demo.

8. Do Not Reopen Distinction
Product translates the approved distinction into a buildable system. It does
not run a second ideation phase.

9. Protect Product Contracts from Antigravity
Delegate bounded implementation or validation work only. Preserve user, problem,
Signature Behavior, sponsor causality, and evidence labels.

Product Failure Modes
Vague User
Failure:
Project targets everyone.
Fix:
Choose one primary user.

Generic AI Layer
Failure:
Product is prompt → answer.
Fix:
Define a condition-triggered Signature Behavior, visible proof, and action.

Distinction Drift
Failure:
The Product Blueprint changes the approved Judge Memory Sentence or Signature
Behavior during implementation planning.
Fix:
Return to the approved `DISTINCTION-BRIEF.md` and remove unapproved changes.

Signature Behavior as Copy
Failure:
The distinctive behavior exists only in positioning or narration.
Fix:
Make it a real system state transition triggered by a real condition.

Competent Generic Baseline Wins
Failure:
A normal CRUD + LLM implementation can deliver the same visible result.
Fix:
Strengthen the mechanism, proof, or causal sponsor dependency before execution.

Overbuilt Architecture
Failure:
Too many services for the available time.
Fix:
Simplify to the shortest proof path.

Unproven Core Assumption
Failure:
Building UI before technical validation.
Fix:
Run technical spike.

Weak Proof
Failure:
Result is described but not verifiable.
Fix:
Add visible evidence or traceability.

Sponsor Technology Superficiality
Failure:
Sponsor technology is replaceable.
Fix:
Define what it causally enables, what fails without it, and where that becomes
visible in proof.

Hidden Synthetic Data
Failure:
Synthetic results appear real.
Fix:
Disclose data origin clearly.

Feature Creep
Failure:
Multiple workflows dilute the demo.
Fix:
Run MVP Reduction Loop.

Second Signature Moment
Failure:
A new feature competes with the approved Signature Moment.
Fix:
Remove or demote it to supporting proof.

Antigravity Product Drift
Failure:
A delegated prototype changes the product contract or sponsor claim.
Fix:
Reject the branch, preserve the approved blueprint, and rerun only the bounded
task if still needed.

Final Product Decision
Return exactly one:

PRODUCT DEFINED
PRODUCT DEFINED WITH RISKS
TECHNICAL VALIDATION REQUIRED
PIVOT TO RUNNER-UP
PRODUCT BLOCKED


Final Rule
The Product Department should create the smallest product that makes the strongest credible claim.
It must answer:

Who is this for?
What exact problem does it solve?
What happens from trigger to outcome?
What visible behavior makes it distinctive?
What proves that it works?
Why is the sponsor technology causally necessary?
Why is it stronger than the competent generic baseline?
What must be built?
What must not be built?
What can fail?
What is the fallback?
What may Antigravity change, and what is protected?
When is the product complete?

If those answers are not clear, the product is not ready for execution.