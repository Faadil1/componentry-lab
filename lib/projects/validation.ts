// ─────────────────────────────────────────────────────────────
// Project Brain Workspace — Validation & Integrity
// ─────────────────────────────────────────────────────────────

import type {
  ProjectBrain,
  ProjectIntegrityReport,
  ProjectFact,
  ProjectAssumption,
  ProjectDecision,
  ProjectRejection,
  ProjectEvidence,
  ProjectRisk,
  ProjectOutput,
  ProjectAction,
  ProjectLearning
} from "./types"
import { CONFIRMED_REGISTRY_IDS } from "../playbooks/registry-relations"
import { KNOWN_PLAYBOOK_IDS } from "../playbooks/metadata"


// Confirmed Recipe IDs from lib/recipes/types.ts
const CONFIRMED_RECIPE_IDS = new Set([
  "product-launch-recipe",
  "operational-workspace-recipe",
  "data-story-recipe",
  "broadcast-package-recipe"
])

export function validateProjectBrain(project: ProjectBrain): ProjectIntegrityReport {
  const errors: string[] = []
  const warnings: string[] = []
  const unknownRegistryIds: string[] = []
  const unknownPlaybookIds: string[] = []
  const unknownRecipeIds: string[] = []
  const invalidDecisionRelations: string[] = []
  const invalidEvidenceRelations: string[] = []
  const unresolvedAssumptions: string[] = []
  const unresolvedRisks: string[] = []
  const inconsistentPhases: string[] = []
  const blockedOutputs: string[] = []

  // Helper to strictly validate mandatory arrays
  const checkMandatoryArray = <T>(val: unknown, name: string): T[] => {
    if (!val || !Array.isArray(val)) {
      errors.push(`Project is missing required array property: '${name}'.`)
      return []
    }
    return val as T[]
  }

  // Mandatory arrays extraction
  checkMandatoryArray<ProjectFact>(project.facts, "facts")
  const assumptions = checkMandatoryArray<ProjectAssumption>(project.assumptions, "assumptions")
  const decisions = checkMandatoryArray<ProjectDecision>(project.decisions, "decisions")
  checkMandatoryArray<ProjectRejection>(project.rejections, "rejections")
  const evidence = checkMandatoryArray<ProjectEvidence>(project.evidence, "evidence")
  const risks = checkMandatoryArray<ProjectRisk>(project.risks, "risks")
  const outputs = checkMandatoryArray<ProjectOutput>(project.outputs, "outputs")
  checkMandatoryArray<ProjectAction>(project.nextActions, "nextActions")
  checkMandatoryArray<ProjectLearning>(project.learnings, "learnings")
  checkMandatoryArray<string>(project.openQuestions, "openQuestions")

  // 1. Core Identity check (Fails build if missing)
  if (!project.id) {
    errors.push("Project is missing a valid 'id'.")
  }
  if (!project.slug) {
    errors.push("Project is missing a valid 'slug'.")
  }

  // 2. Phase & Status check (Fails build if unknown)
  const VALID_STATUSES = new Set([
    "intake",
    "researching",
    "positioning",
    "designing",
    "building",
    "verifying",
    "presenting",
    "submitted",
    "published",
    "paused",
    "archived"
  ])
  if (!VALID_STATUSES.has(project.status)) {
    errors.push(`Project has unknown status: '${project.status}'.`)
  }

  // 3. Registry V2 IDs Validation (Fails build if unknown)
  const selectedRegistryIds = project.selectedRegistryIds ?? []
  for (const regId of selectedRegistryIds) {
    if (!CONFIRMED_REGISTRY_IDS.has(regId)) {
      unknownRegistryIds.push(regId)
      errors.push(`Project references unknown Registry ID: '${regId}'.`)
    }
  }

  // 4. Playbook IDs Validation (Fails build if unknown)
  const selectedPlaybookIds = project.selectedPlaybookIds ?? []
  for (const pbId of selectedPlaybookIds) {
    if (!KNOWN_PLAYBOOK_IDS.has(pbId)) {
      unknownPlaybookIds.push(pbId)
      errors.push(`Project references unknown Playbook ID: '${pbId}'.`)
    }
  }

  // 5. Recipe IDs Validation (Fails build if unknown)
  const selectedRecipeIds = project.selectedRecipeIds ?? []
  for (const recipeId of selectedRecipeIds) {
    const canonicalRecipeId = recipeId.endsWith("-recipe") ? recipeId : `${recipeId}-recipe`
    if (!CONFIRMED_RECIPE_IDS.has(canonicalRecipeId)) {
      unknownRecipeIds.push(recipeId)
      errors.push(`Project references unknown Recipe ID: '${recipeId}'.`)
    }
  }

  // 6. Decision Relations check (Fails build if invalid supersedes target)
  const decisionIds = new Set(decisions.map((d) => d.id))
  for (const dec of decisions) {
    if (dec.supersedes && !decisionIds.has(dec.supersedes)) {
      invalidDecisionRelations.push(`${dec.id} → supersedes → ${dec.supersedes}`)
      errors.push(`Decision '${dec.id}' supersedes an unknown decision ID: '${dec.supersedes}'.`)
    }
    if (dec.supersededBy && !decisionIds.has(dec.supersededBy)) {
      invalidDecisionRelations.push(`${dec.id} → supersededBy → ${dec.supersededBy}`)
      errors.push(`Decision '${dec.id}' is superseded by an unknown decision ID: '${dec.supersededBy}'.`)
    }
  }

  // 7. Evidence Relations check
  const outputIds = new Set(outputs.map((o) => o.id))
  for (const ev of evidence) {
    if (ev.linkedDecisionId && !decisionIds.has(ev.linkedDecisionId)) {
      invalidEvidenceRelations.push(`${ev.id} → decision → ${ev.linkedDecisionId}`)
      errors.push(`Evidence '${ev.id}' links to an unknown decision ID: '${ev.linkedDecisionId}'.`)
    }
    if (ev.linkedOutputId && !outputIds.has(ev.linkedOutputId)) {
      invalidEvidenceRelations.push(`${ev.id} → output → ${ev.linkedOutputId}`)
      errors.push(`Evidence '${ev.id}' links to an unknown output ID: '${ev.linkedOutputId}'.`)
    }
  }

  // 8. Capture signature validation (Fails build if invalid signature state)
  const captureStatesList = project.capturePlan?.states ?? []
  const captureStateIds = new Set(captureStatesList.map((s) => s.id))
  if (project.signatureStateId && !captureStateIds.has(project.signatureStateId)) {
    errors.push(`Signature State ID '${project.signatureStateId}' is invalid or missing from capture states.`)
  }

  // ── Warnings (Non-fatal, does not fail build) ───────────────
  const missingProof = !project.primaryClaim || evidence.length === 0
  const missingAudience = !project.audience
  const missingSuccessDefinition = !project.successDefinition
  const missingCaptureStates = captureStatesList.length === 0
  const missingSignatureFrame = !project.signatureFrame
  const missingVideoPurpose = !project.videoPlan || !project.videoPlan.purpose

  if (missingProof) warnings.push("Project is missing a primary claim or evidence stubs.")
  if (missingAudience) warnings.push("Project has no defined target audience.")
  if (missingSuccessDefinition) warnings.push("Project lacks success metrics.")
  if (missingCaptureStates) warnings.push("No capture states are declared.")
  if (missingSignatureFrame) warnings.push("Signature frame timestamp is not set.")
  if (missingVideoPurpose) warnings.push("Video production plan is missing purpose statement.")

  // Unresolved assumptions
  for (const asm of assumptions) {
    if (asm.status === "unresolved") {
      unresolvedAssumptions.push(asm.id)
      warnings.push(`Assumption '${asm.id}' ('${asm.label}') is unresolved.`)
    }
  }

  // Unresolved risks
  for (const rsk of risks) {
    if (rsk.status === "open" || rsk.status === "triggered") {
      unresolvedRisks.push(rsk.id)
      warnings.push(`Risk '${rsk.id}' ('${rsk.label}') is active and unresolved.`)
    }
  }

  // Blocked outputs
  for (const out of outputs) {
    if (out.status === "blocked") {
      blockedOutputs.push(out.id)
      warnings.push(`Output '${out.id}' ('${out.label}') is currently blocked.`)
    }
  }

  // Simple readiness computation
  // Start with 100%, subtract penalties for warnings/active issues
  let score = 100
  score -= warnings.length * 5
  score -= errors.length * 15
  const readinessScore = Math.max(0, Math.min(100, score))

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    unknownRegistryIds,
    unknownPlaybookIds,
    unknownRecipeIds,
    invalidDecisionRelations,
    invalidEvidenceRelations,
    missingProof,
    missingAudience,
    missingSuccessDefinition,
    unresolvedAssumptions,
    unresolvedRisks,
    missingCaptureStates,
    missingSignatureFrame,
    missingVideoPurpose,
    inconsistentPhases,
    blockedOutputs,
    readinessScore
  }
}

export function assertProjectBrainIntegrity(project: ProjectBrain): void {
  const report = validateProjectBrain(project)
  if (!report.valid) {
    throw new Error(
      `[Project Brain Integrity] Project '${project.title}' is corrupt:\n${report.errors.join("\n")}`
    )
  }
}
