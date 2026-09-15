import "server-only"

import { buildTraceDesignCatalog } from "../creative-os/trace-design-catalog"
import { routeTraceDesign, type TraceDesignAsset } from "../creative-os/trace-design-studio"
import { getProjectById } from "../projects/repository"
import type { ProjectAuditResult, ProjectBrain, ProjectEvidence } from "../projects/types"
import { getTraceRuntimeExecutableSkillId, getTraceRuntimeTarget } from "./catalog"
import {
  completeTraceRun,
  createTraceRun,
  persistTraceActions,
  persistTraceArtifacts,
} from "./storage"
import type {
  TraceRuntimeActionDraft,
  TraceRuntimeArtifactDraft,
  TraceRuntimeExecutionDraft,
  TraceRuntimeInput,
  TraceRuntimeRun,
} from "./types"

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function topNames(assets: TraceDesignAsset[], limit: number): string[] {
  return unique(assets.map((asset) => asset.name)).slice(0, limit)
}

function projectLabel(project: ProjectBrain | undefined): string {
  return project?.title ?? "Unscoped TRACE Design run"
}

function makeArtifact(
  kind: TraceRuntimeArtifactDraft["kind"],
  title: string,
  summary: string,
  payload: Record<string, unknown>,
): TraceRuntimeArtifactDraft {
  return { kind, title, summary, payload }
}

function projectPatch(
  title: string,
  description: string,
  patch: Record<string, unknown>,
): TraceRuntimeActionDraft {
  return {
    type: "PROJECT_BRAIN_PATCH",
    title,
    description,
    authority: "LOCAL_REVERSIBLE",
    reversible: true,
    payload: { patch },
  }
}

function githubEvidenceAction(runId: string, project: ProjectBrain | undefined, content: string): TraceRuntimeActionDraft {
  const slug = project?.slug ?? "unscoped"
  return {
    type: "GITHUB_EVIDENCE_BRANCH",
    title: "Publish evidence on a dedicated GitHub branch",
    description: "Creates a new trace-run branch and writes a run evidence Markdown file. It never writes directly to master.",
    authority: "EXPLICIT_EXTERNAL",
    reversible: true,
    payload: {
      repository: "Faadil1/componentry-lab",
      baseBranch: "master",
      branch: `trace-run/${runId.replace(/^run_/, "")}`,
      path: `docs/evidence/trace-runs/${slug}-${runId}.md`,
      content,
      commitMessage: `evidence(trace-design): record ${runId}`,
    },
  }
}

function routeContext(input: TraceRuntimeInput, assets: TraceDesignAsset[]) {
  return routeTraceDesign(
    {
      mode: input.mode,
      surface: input.surface,
      concerns: input.concerns,
    },
    assets,
  )
}

function basicRouteDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const refs = topNames(route.references, 7)
  const skills = topNames(route.skills, 7)
  const agents = topNames(route.agents, 6)

  return {
    authorityUsed: "SUGGEST",
    summary: `${projectLabel(project)} routed through TRACE Design. Next move: ${route.nextAction.title}.`,
    findings: [
      route.nextAction.rationale,
      `References activated: ${refs.join(", ") || "none"}.`,
      `Skills activated: ${skills.join(", ") || "none"}.`,
      `Agents activated: ${agents.join(", ") || "none"}.`,
    ],
    evidence: [route.routeId, ...route.systems.slice(0, 4).map((item) => `${item.name} · ${item.status}`)],
    artifacts: [
      makeArtifact("ROUTE", "TRACE Design route", route.nextAction.title, {
        routeId: route.routeId,
        nextAction: route.nextAction,
        references: refs,
        skills,
        agents,
      }),
    ],
    actions: [],
  }
}

function artDirectionDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const references = topNames(route.references, 6)
  const primaryLineage = references[0] ?? "CARI-led lineage check"
  const principles = unique([
    ...(project?.designPrinciples ?? []),
    "Choose one primary aesthetic lineage before composing components",
    "Translate references into domain-native interface primitives",
    "Use contrast in material, rhythm and hierarchy instead of default SaaS decoration",
  ])
  const antiPatterns = unique([
    ...(project?.antiPatterns ?? []),
    "Reference collage without domain translation",
    "Default gradient/glassmorphism used as a substitute for art direction",
    "Multiple visual lineages competing above the fold",
  ])
  const patch: Record<string, unknown> = {
    references: unique([...(project?.references ?? []), ...references]),
    designPrinciples: principles,
    antiPatterns,
  }
  if (project && !project.visualDirection.trim()) {
    patch.visualDirection = `Primary lineage: ${primaryLineage}. Supporting references: ${references.slice(1, 4).join(", ") || "none"}. Translate motifs into product-native structure before decorative treatment.`
  }

  return {
    authorityUsed: "PREPARE",
    summary: `Prepared a differentiated art-direction contract for ${projectLabel(project)} using ${primaryLineage} as the first lineage anchor.`,
    findings: [
      `Primary lineage anchor: ${primaryLineage}.`,
      `Secondary references: ${references.slice(1).join(", ") || "none"}.`,
      "The patch preserves existing direction text and only fills visualDirection when it is currently empty.",
    ],
    evidence: [route.routeId, ...references],
    artifacts: [
      makeArtifact("BRIEF", "Art Direction Contract", `Primary lineage: ${primaryLineage}`, {
        primaryLineage,
        references,
        principles,
        antiPatterns,
        instruction: input.instruction ?? null,
      }),
      makeArtifact("PATCH", "Prepared Project Brain design patch", "Reversible design-intelligence update.", { patch }),
    ],
    actions: project ? [projectPatch("Apply art-direction patch", "Writes lineage references, design principles and anti-patterns into Project Brain. Existing visual direction is never overwritten.", patch)] : [],
  }
}

function componentRouterDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const selectedAssets = route.activated.filter((asset) => asset.kind === "COMPONENT").slice(0, 6)
  const registryIds = selectedAssets.map((asset) => asset.id.replace(/^component-/, ""))
  const patch = {
    selectedRegistryIds: unique([...(project?.selectedRegistryIds ?? []), ...registryIds]),
  }

  return {
    authorityUsed: "PREPARE",
    summary: `Prepared the smallest visible component set for ${projectLabel(project)}: ${selectedAssets.map((asset) => asset.name).join(", ") || "no matching reusable component yet"}.`,
    findings: [
      `${selectedAssets.length} Component Registry entries selected from the current route.`,
      "Selection is additive; existing Project Brain registry selections are preserved.",
      "No component code is promoted automatically by this run.",
    ],
    evidence: [route.routeId, ...selectedAssets.map((asset) => asset.id)],
    artifacts: [makeArtifact("ROUTE", "Component composition route", "Smallest fitting reusable set.", { selectedRegistryIds: registryIds, selectedAssets })],
    actions: project && registryIds.length > 0 ? [projectPatch("Apply component selection", "Adds routed Component Registry ids to Project Brain without deleting existing selections.", patch)] : [],
  }
}

function creativeDirectorDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  return {
    authorityUsed: "SUGGEST",
    summary: `Creative Director resolved one next move for ${projectLabel(project)}: ${route.nextAction.title}.`,
    findings: [
      route.nextAction.rationale,
      `Current project phase: ${project?.currentPhase ?? "unscoped"}.`,
      `Current readiness: ${project?.readiness ?? 0}%.`,
      "No direction is auto-promoted; the next move remains bounded to one action.",
    ],
    evidence: [route.routeId, ...(project?.blockers ?? []).map((item) => `blocker:${item}`)],
    artifacts: [makeArtifact("BRIEF", "Creative Director decision", route.nextAction.title, { routeId: route.routeId, nextAction: route.nextAction, projectPhase: project?.currentPhase ?? null })],
    actions: [],
  }
}

function designSystemDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const references = topNames(route.references, 5)
  const patch: Record<string, unknown> = {
    designPrinciples: unique([...(project?.designPrinciples ?? []), "One semantic purpose per component", "Responsive behavior is part of the component contract", "Reduced-motion and keyboard behavior are first-class states"]),
  }
  if (project && !project.accessibilityStrategy.trim()) patch.accessibilityStrategy = "Keyboard-operable interactive controls, visible focus states, semantic status messaging, and reduced-motion alternatives for non-essential motion."
  if (project && !project.responsiveStrategy.trim()) patch.responsiveStrategy = "Preserve information hierarchy across breakpoints; collapse composition before shrinking critical controls or proof surfaces."

  return {
    authorityUsed: "PREPARE",
    summary: `Prepared a design-system coherence update for ${projectLabel(project)}.`,
    findings: [
      `Reference support: ${references.join(", ") || "Component Registry foundations"}.`,
      "Accessibility and responsive fields are only filled when currently empty.",
      "Existing design principles remain intact and are deduplicated.",
    ],
    evidence: [route.routeId, "Component Registry V2", "RUNTIME_PROTOCOL.md"],
    artifacts: [makeArtifact("CHECKLIST", "Design-system contract", "Coherence, responsive and accessibility checks.", { references, patch })],
    actions: project ? [projectPatch("Apply design-system contract", "Adds design-system principles and fills missing responsive/accessibility strategy fields.", patch)] : [],
  }
}

function flowDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const patch: Record<string, unknown> = {}
  if (project && !project.interactionDirection.trim()) patch.interactionDirection = "Make state transitions explicit: idle → investigating → blocked → repairing → verified/finished. Keep primary actions deterministic and reversible where possible."
  if (project && !project.responsiveStrategy.trim()) patch.responsiveStrategy = "Preserve the task sequence on narrow screens; stack secondary context after the primary action and keep proof adjacent to the state it validates."
  if (project && !project.accessibilityStrategy.trim()) patch.accessibilityStrategy = "All flow-critical actions must be keyboard reachable, state changes announced semantically, and gesture-only interactions provided with an equivalent control."

  return {
    authorityUsed: "PREPARE",
    summary: `Prepared a product-flow contract for ${projectLabel(project)} on ${input.surface}.`,
    findings: [
      "State transitions should expose why a user is blocked and what repairs the state.",
      "Responsive adaptation must preserve task order, not merely visual layout.",
      "The patch only fills currently-empty flow strategy fields.",
    ],
    evidence: [route.routeId, "trace-studio-flow", ...(input.surface === "MOBILE_NATIVE" ? ["Appllama"] : [])],
    artifacts: [makeArtifact("BRIEF", "Product Flow Contract", "Interaction, responsive and accessibility guidance.", { surface: input.surface, patch })],
    actions: project && Object.keys(patch).length > 0 ? [projectPatch("Apply product-flow contract", "Fills missing interaction, responsive and accessibility strategy fields without overwriting existing decisions.", patch)] : [],
  }
}

function motionDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const motionContract = "Use motion to explain state change, causality or continuity. Keep decorative motion subordinate to task completion and provide reduced-motion equivalents."
  const patch: Record<string, unknown> = {}
  if (project && !project.interactionDirection.trim()) patch.interactionDirection = motionContract

  return {
    authorityUsed: "PREPARE",
    summary: `Prepared a motion contract for ${projectLabel(project)} with reduced-motion constraints.`,
    findings: [
      motionContract,
      "Prefer transform/opacity for routine UI transitions; reserve shader/canvas effects for intentional signature moments.",
      "Motion must never hide a gate, failure state or proof transition.",
    ],
    evidence: [route.routeId, "trace-studio-motion", "RUNTIME_PROTOCOL.md"],
    artifacts: [makeArtifact("BRIEF", "Motion Contract", motionContract, { reducedMotion: true, surface: input.surface })],
    actions: project && Object.keys(patch).length > 0 ? [projectPatch("Apply motion contract", "Fills interactionDirection only when the project has not already locked one.", patch)] : [],
  }
}

function runtimeReviewDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const now = new Date().toISOString()
  const checks = [
    { label: "Responsive hierarchy", passed: Boolean(project?.responsiveStrategy.trim()), remediation: "Define a responsive strategy before runtime promotion." },
    { label: "Accessibility strategy", passed: Boolean(project?.accessibilityStrategy.trim()), remediation: "Define keyboard, semantic-state and reduced-motion expectations." },
    { label: "Acceptance criteria", passed: (project?.acceptanceCriteria.length ?? 0) > 0, remediation: "Add measurable acceptance criteria for the current build slice." },
    { label: "Proof surface", passed: Boolean(project?.proofMoment.trim()), remediation: "Bind the build to a visible proof moment." },
  ]
  const auditResults: ProjectAuditResult[] = checks.map((check, index) => ({
    id: `trace-runtime-${Date.now()}-${index}`,
    label: `TRACE Runtime · ${check.label}`,
    passed: check.passed,
    consequence: check.passed ? "Runtime requirement is represented in Project Brain." : check.remediation,
    remediation: check.passed ? undefined : check.remediation,
    severity: check.passed ? "info" : "warning",
  }))
  const failed = checks.filter((check) => !check.passed)
  const patch = { auditResults: [...(project?.auditResults ?? []), ...auditResults] }

  return {
    authorityUsed: "PREPARE",
    summary: `Runtime review completed for ${projectLabel(project)}: ${checks.length - failed.length}/${checks.length} contract checks represented.`,
    findings: checks.map((check) => `${check.passed ? "PASS" : "HOLD"} · ${check.label}${check.passed ? "" : ` · ${check.remediation}`}`),
    evidence: [route.routeId, `runtime-review:${now}`, "RUNTIME_PROTOCOL.md"],
    artifacts: [makeArtifact("REPORT", "Runtime Review", `${failed.length} unresolved runtime contract checks.`, { checks, reviewedAt: now })],
    actions: project ? [projectPatch("Record runtime audit results", "Appends this runtime review to Project Brain auditResults. It does not change publication/submission gates.", patch)] : [],
  }
}

function assuranceDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const blockers = unique([...(project?.blockers ?? []), ...(project?.unresolvedProofGaps ?? [])])
  const warnings = unique([...(project?.warnings ?? []), ...((project?.auditResults ?? []).filter((item) => !item.passed).map((item) => item.label))])
  const verdict = blockers.length > 0 ? "HOLD" : warnings.length > 0 ? "CONDITIONAL" : "PASS"

  return {
    authorityUsed: "SUGGEST",
    summary: `Design / Experience Assurance verdict for ${projectLabel(project)}: ${verdict}.`,
    findings: [
      `Canonical blockers: ${blockers.length}.`,
      `Warnings / failed audits: ${warnings.length}.`,
      `Current readiness: ${project?.readiness ?? 0}%.`,
      verdict === "PASS" ? "No current Project Brain blocker prevents the next review step." : "Promotion should remain gated until the listed issues are resolved or explicitly accepted.",
    ],
    evidence: [route.routeId, ...blockers.map((item) => `blocker:${item}`), ...warnings.map((item) => `warning:${item}`)],
    artifacts: [makeArtifact("REPORT", "Assurance Review", verdict, { verdict, blockers, warnings, readiness: project?.readiness ?? 0 })],
    actions: [],
  }
}

function evidenceDraft(runId: string, input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const evidenceEntry: ProjectEvidence = {
    id: `trace-run-evidence-${runId}`,
    label: `TRACE Design runtime execution ${runId}`,
    claimSupported: "TRACE Design routing/execution completed and was recorded in the runtime ledger.",
    type: "test-result",
    source: "TRACE Design Runtime",
    strength: "supporting",
    status: "available",
    routeOrFile: `/trace-design?run=${encodeURIComponent(runId)}`,
    limitation: "This evidence proves runtime execution and recorded outputs; it does not by itself prove downstream UI correctness or external deployment success.",
  }
  const patch = { evidence: [...(project?.evidence ?? []), evidenceEntry] }
  const markdown = `# TRACE Design Runtime Evidence\n\n- Run: ${runId}\n- Project: ${projectLabel(project)}\n- Target: ${input.targetKind} ${input.targetId}\n- Mode: ${input.mode}\n- Surface: ${input.surface}\n- Concerns: ${input.concerns.join(", ") || "none"}\n- Route: ${route.routeId}\n\nThis file records that the TRACE Design runtime executed and persisted this run. It is supporting evidence, not a substitute for visual/runtime proof of the resulting product.\n`

  return {
    authorityUsed: "PREPARE",
    summary: `Prepared durable TRACE runtime evidence for ${projectLabel(project)}.`,
    findings: [
      "A supporting Project Brain evidence entry is ready to apply.",
      "A dedicated GitHub evidence branch is ready to create after explicit external approval.",
      "Neither action changes publication/submission gates.",
    ],
    evidence: [route.routeId, `run:${runId}`],
    artifacts: [makeArtifact("EVIDENCE", "TRACE Runtime Evidence", `Supporting evidence for ${runId}.`, { evidenceEntry, markdown })],
    actions: [
      ...(project ? [projectPatch("Attach runtime evidence to Project Brain", "Appends a supporting test-result evidence entry for this run.", patch)] : []),
      githubEvidenceAction(runId, project, markdown),
    ],
  }
}

function gateDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  const blockers = unique([...(project?.blockers ?? []), ...(project?.unresolvedProofGaps ?? []), ...(project?.blockedBy ?? [])])
  const failedAudits = (project?.auditResults ?? []).filter((item) => !item.passed)
  const verdict = blockers.length > 0 ? "HOLD" : failedAudits.length > 0 ? "REWORK" : "PASS"
  const next = verdict === "PASS" ? route.nextAction.title : blockers[0] ?? failedAudits[0]?.remediation ?? "Resolve the first failed gate before promotion."

  return {
    authorityUsed: "SUGGEST",
    summary: `TRACE Design gate for ${projectLabel(project)}: ${verdict}.`,
    findings: [
      `Open blockers: ${blockers.length}.`,
      `Failed recorded audits: ${failedAudits.length}.`,
      `Publication gate currently: ${project?.publicationGate ? "open" : "closed"}.`,
      `Submission gate currently: ${project?.submissionGate ? "open" : "closed"}.`,
      `Next: ${next}`,
    ],
    evidence: [route.routeId, ...blockers, ...failedAudits.map((item) => item.id)],
    artifacts: [makeArtifact("REPORT", "TRACE Design Gate", verdict, { verdict, blockers, failedAudits, next })],
    actions: [],
  }
}

function statusDraft(input: TraceRuntimeInput, project: ProjectBrain | undefined, assets: TraceDesignAsset[]): TraceRuntimeExecutionDraft {
  const route = routeContext(input, assets)
  return {
    authorityUsed: "SUGGEST",
    summary: `${projectLabel(project)} · phase ${project?.currentPhase ?? "unscoped"} · readiness ${project?.readiness ?? 0}% · next ${route.nextAction.title}.`,
    findings: [
      `Status: ${project?.status ?? "unscoped"}.`,
      `Blockers: ${project?.blockers.length ?? 0}.`,
      `Proof gaps: ${project?.unresolvedProofGaps.length ?? 0}.`,
      `Selected registry components: ${project?.selectedRegistryIds.length ?? 0}.`,
    ],
    evidence: [route.routeId, ...(project?.evidence.slice(-3).map((item) => item.id) ?? [])],
    artifacts: [makeArtifact("REPORT", "TRACE Design Status", "Live Project Brain status projection.", { phase: project?.currentPhase ?? null, status: project?.status ?? null, readiness: project?.readiness ?? 0, nextAction: route.nextAction })],
    actions: [],
  }
}

function executeSkill(
  runId: string,
  skillId: string,
  input: TraceRuntimeInput,
  project: ProjectBrain | undefined,
  assets: TraceDesignAsset[],
): TraceRuntimeExecutionDraft {
  switch (skillId) {
    case "trace-design":
      return basicRouteDraft(input, project, assets)
    case "trace-studio-art-direction":
      return artDirectionDraft(input, project, assets)
    case "trace-studio-component-router":
      return componentRouterDraft(input, project, assets)
    case "trace-studio-creative-director":
      return creativeDirectorDraft(input, project, assets)
    case "trace-studio-design-system":
      return designSystemDraft(input, project, assets)
    case "trace-studio-flow":
      return flowDraft(input, project, assets)
    case "trace-studio-motion":
      return motionDraft(input, project, assets)
    case "trace-studio-runtime-review":
      return runtimeReviewDraft(input, project, assets)
    case "trace-studio-assurance-review":
      return assuranceDraft(input, project, assets)
    case "trace-studio-evidence":
      return evidenceDraft(runId, input, project, assets)
    case "trace-studio-gate":
      return gateDraft(input, project, assets)
    case "trace-studio-next":
      return creativeDirectorDraft(input, project, assets)
    case "trace-studio-status":
      return statusDraft(input, project, assets)
    default:
      throw new Error(`TRACE runtime target is registered but has no executable handler: ${skillId}`)
  }
}

export async function executeTraceRuntime(input: TraceRuntimeInput): Promise<TraceRuntimeRun> {
  const target = getTraceRuntimeTarget(input.targetKind, input.targetId)
  if (!target) throw new Error(`Unknown TRACE runtime target: ${input.targetKind} ${input.targetId}`)
  const executableSkillId = getTraceRuntimeExecutableSkillId(input.targetKind, input.targetId)
  if (!executableSkillId) throw new Error(`No executable skill mapping for ${input.targetId}`)

  const runId = `run_${crypto.randomUUID()}`
  const createdAt = new Date().toISOString()
  const initial: TraceRuntimeRun = {
    runId,
    projectId: input.projectId,
    targetKind: input.targetKind,
    targetId: input.targetId,
    authorityUsed: target.authority,
    status: "RUNNING",
    summary: "TRACE Design runtime execution started.",
    findings: [],
    evidence: [],
    input,
    artifacts: [],
    actions: [],
    createdAt,
  }

  await createTraceRun(initial)

  try {
    const [catalog, project] = await Promise.all([
      buildTraceDesignCatalog(),
      input.projectId ? getProjectById(input.projectId) : Promise.resolve(undefined),
    ])
    if (input.projectId && !project) throw new Error(`Project Brain project not found: ${input.projectId}`)

    const draft = executeSkill(runId, executableSkillId, input, project, catalog.assets)
    const [artifacts, actions] = await Promise.all([
      persistTraceArtifacts(runId, input.projectId, draft.artifacts),
      persistTraceActions(runId, input.projectId, draft.actions),
    ])

    const completed: TraceRuntimeRun = {
      ...initial,
      authorityUsed: draft.authorityUsed,
      status: "SUCCEEDED",
      summary: draft.summary,
      findings: draft.findings,
      evidence: draft.evidence,
      artifacts,
      actions,
      completedAt: new Date().toISOString(),
    }
    await completeTraceRun(completed)
    return completed
  } catch (error) {
    const failed: TraceRuntimeRun = {
      ...initial,
      status: "FAILED",
      summary: "TRACE Design runtime execution failed.",
      error: error instanceof Error ? error.message : String(error),
      completedAt: new Date().toISOString(),
    }
    await completeTraceRun(failed)
    return failed
  }
}
