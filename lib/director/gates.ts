import type { CanonicalBlocker, DirectorEvidenceReference, DirectorEvaluatorType, GateStatus, QualityGate } from "./types"

const UNIVERSAL_GATE_IDS = [
  "problem-or-intention-clarity",
  "scope",
  "distinction",
  "hero-demo-moment",
  "proof-or-evidence",
  "continuity-or-coherence",
  "technical-integrity",
  "presentation-readiness",
  "completion-readiness",
] as const

export function getUniversalGateIds(): string[] {
  return [...UNIVERSAL_GATE_IDS]
}

export function evaluateGate(
  gateId: string,
  name: string,
  evaluator: DirectorEvaluatorType,
  requiredEvidence: string[],
  evidence: DirectorEvidenceReference[],
  blockers: CanonicalBlocker[],
  decision: QualityGate["decision"],
  conditionLabels: string[],
  provenance: string,
  evaluatedAt: string
): QualityGate {
  const controllingEvidence = requiredEvidence.find((requiredId) =>
    evidence.some((item) => item.id === requiredId && item.status !== "missing")
  )
  const hasRequiredEvidence = requiredEvidence.length === 0 || Boolean(controllingEvidence)
  const status: GateStatus = blockers.length > 0 ? "blocked" : hasRequiredEvidence ? "pass" : "fail"

  return {
    gateId,
    name,
    status,
    requiredEvidence,
    controllingEvidence: controllingEvidence ?? null,
    decision: hasRequiredEvidence ? decision : "hold",
    conditions: conditionLabels,
    blockers,
    evaluatedAt,
    evaluator,
    provenance,
  }
}
