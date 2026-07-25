import type {
  DecisionOutcome,
  DecisionStatus,
  SignalStatus,
  EvidenceStatus,
  EvidenceDirection,
  RuleStatus,
  RuleOperator,
} from "./types"

export function formatOutcome(outcome: DecisionOutcome): string {
  switch (outcome) {
    case "proceed":
      return "Proceed / Approved"
    case "hold":
      return "Hold / Awaiting Verification"
    case "review":
      return "Under Active Review"
    case "reject":
      return "Rejected / Blocked"
    case "insufficient-evidence":
      return "Insufficient Evidence"
    default:
      return String(outcome).toUpperCase()
  }
}

export function formatStatus(status: DecisionStatus): string {
  switch (status) {
    case "approved":
      return "Approved"
    case "pending":
      return "Pending Decision"
    case "blocked":
      return "Blocked / Rejected"
    case "review":
      return "Needs Manual Review"
    case "insufficient":
      return "Insufficient Metrics"
    default:
      return String(status).toUpperCase()
  }
}

export function formatSignalStatus(status: SignalStatus): string {
  switch (status) {
    case "normal":
      return "Normal"
    case "warning":
      return "Warning"
    case "critical":
      return "Critical Anomaly"
    case "unknown":
      return "Unknown State"
    default:
      return String(status)
  }
}

export function formatEvidenceStatus(status: EvidenceStatus): string {
  switch (status) {
    case "available":
      return "Verified"
    case "missing":
      return "Missing Point"
    case "disputed":
      return "Disputed Data"
    case "expired":
      return "Expired Proof"
    case "excluded":
      return "Manually Excluded"
    default:
      return String(status)
  }
}

export function formatEvidenceDirection(direction: EvidenceDirection): string {
  switch (direction) {
    case "supports":
      return "Supports Proceed"
    case "contradicts":
      return "Contradicts Proceed"
    case "contextual":
      return "Contextual Background"
    default:
      return String(direction)
  }
}

export function formatRuleStatus(status: RuleStatus): string {
  switch (status) {
    case "pass":
      return "Passed"
    case "fail":
      return "Failed Condition"
    case "unknown":
      return "Unresolved Signal"
    case "skipped":
      return "Skipped (Evidence Excluded)"
    default:
      return String(status)
  }
}

export function formatOperator(operator: RuleOperator): string {
  switch (operator) {
    case "greater-than":
      return ">"
    case "greater-than-or-equal":
      return "≥"
    case "less-than":
      return "<"
    case "less-than-or-equal":
      return "≤"
    case "equals":
      return "="
    case "not-equals":
      return "≠"
    case "between":
      return "in range"
    case "includes":
      return "contains"
    case "exists":
      return "exists"
    case "not-exists":
      return "does not exist"
    default:
      return String(operator)
  }
}
