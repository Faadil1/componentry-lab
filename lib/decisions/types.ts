// ─────────────────────────────────────────────────────────────
// Data & Decision Components — Core Types
// ─────────────────────────────────────────────────────────────

export type DecisionStatus =
  | "pending"
  | "approved"
  | "blocked"
  | "review"
  | "insufficient"

export type SignalStatus = "normal" | "warning" | "critical" | "unknown"

export type EvidenceStatus =
  | "available"
  | "missing"
  | "disputed"
  | "expired"
  | "excluded"

export type EvidenceStrength = "weak" | "moderate" | "strong"

export type EvidenceDirection = "supports" | "contradicts" | "contextual"

export type RuleStatus = "pass" | "fail" | "unknown" | "skipped"

export type DecisionMode = "observed" | "stress" | "edge"

export type DecisionOutcome =
  | "proceed"
  | "hold"
  | "review"
  | "reject"
  | "insufficient-evidence"

export type RuleOperator =
  | "greater-than"
  | "greater-than-or-equal"
  | "less-than"
  | "less-than-or-equal"
  | "equals"
  | "not-equals"
  | "between"
  | "includes"
  | "exists"
  | "not-exists"

export interface DecisionSignal {
  id: string
  label: string
  value: number | string | boolean | null
  unit?: string
  status: SignalStatus
  source: string
  timestamp: string
  thresholdsDescription?: string
}

export interface DecisionEvidence {
  id: string
  label: string
  source: string
  direction: EvidenceDirection
  strength: EvidenceStrength
  status: EvidenceStatus
  date: string
  affectedRuleIds: string[]
  exclusionReason?: string
}

export interface DecisionCondition {
  signalId: string
  operator: RuleOperator
  value: number | string | boolean
  secondValue?: number | string | boolean // For 'between'
}

export interface DecisionRule {
  id: string
  label: string
  condition: DecisionCondition
  status: RuleStatus
  weight: number // Relative importance
  affectedEvidenceIds: string[]
  consequence: string // What happens if fails
  changeConditionDescription: string // What is needed to change
}

export interface DecisionReason {
  ruleId?: string
  evidenceId?: string
  message: string
  type: "info" | "warning" | "error"
}

export interface DecisionTraceEntry {
  order: number
  type: "signal_read" | "evidence_check" | "rule_evaluated" | "outcome_produced" | "contradiction_detected" | "uncertainty_flagged"
  label: string
  description: string
  sourceOrRuleId?: string
  effect: string
}

export interface DecisionSnapshot {
  scenarioId: string
  mode: DecisionMode
  outcome: DecisionOutcome
  status: DecisionStatus
  confidence: number
  includedEvidenceIds: string[]
  excludedEvidenceIds: string[]
  ruleResults: Record<string, RuleStatus>
  missingEvidenceIds: string[]
  contradictions: string[]
  thresholdOverrides: Record<string, number>
}

export interface DecisionScenario {
  id: string
  label: string
  description: string
  question: string
  modes: Record<DecisionMode, {
    signals: DecisionSignal[]
    evidence: DecisionEvidence[]
  }>
  rules: DecisionRule[]
  configurableThresholds: Array<{
    id: string
    label: string
    value: number
    defaultValue: number
    min: number
    max: number
    step: number
    unit?: string
  }>
  outcomeMapping: Record<string, {
    outcome: DecisionOutcome
    status: DecisionStatus
    recommendation: string
  }>
  limitations: string[]
}

export interface DecisionEvaluation {
  outcome: DecisionOutcome
  status: DecisionStatus
  confidence: number
  coverage: number
  consistency: number
  ruleResults: Record<string, RuleStatus>
  trace: DecisionTraceEntry[]
  missingEvidenceIds: string[]
  contradictions: string[]
  reasons: DecisionReason[]
}

export interface DecisionConfig {
  initialMode: DecisionMode
}

export interface DecisionState {
  activeScenario: DecisionScenario
  mode: DecisionMode
  signals: DecisionSignal[]
  evidence: DecisionEvidence[]
  rules: DecisionRule[]
  evaluation: DecisionEvaluation
  selectedSignalId: string | null
  selectedEvidenceId: string | null
  selectedRuleId: string | null
  thresholdOverrides: Record<string, number>
  excludedEvidenceIds: string[]
  decisionSnapshot: DecisionSnapshot
}

export interface DecisionContext {
  state: DecisionState
  actions: {
    setScenario: (sc: DecisionScenario) => void
    setMode: (m: DecisionMode) => void
    selectSignal: (id: string | null) => void
    selectEvidence: (id: string | null) => void
    selectRule: (id: string | null) => void
    setThreshold: (id: string, value: number) => void
    resetThresholds: () => void
    toggleEvidence: (id: string) => void
    includeAllEvidence: () => void
    resetScenario: () => void
  }
}
