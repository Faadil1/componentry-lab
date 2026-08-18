export type GovernedDirectorActionState = {
  status:
    | "IDLE"
    | "APPLIED"
    | "NO_CHANGE"
    | "BLOCKED"
    | "REJECTED"
    | "STALE_PROPOSAL"
    | "ALREADY_CANONICAL"
    | "ALREADY_STARTED"
    | "ALREADY_COMPLETED"
    | "INVALID"
  receiptId: string | null
  auditTraceRef: string | null
  error: string | null
}
