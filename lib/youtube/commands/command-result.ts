// Command result type contract
// All commands return this unified result shape

export type CommandFailureReason =
  | "not_found"
  | "conflict"
  | "invalid_transition"
  | "invalid_input"
  | "already_resolved"
  | "already_published"

export type CommandResult<T = void> =
  | {
      success: true
      value?: T
      stateVersion: number
    }
  | {
      success: false
      reason: CommandFailureReason
      message: string
      currentStateVersion?: number
    }
