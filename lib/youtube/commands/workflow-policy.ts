// Workflow transition policy
// Defines valid state transitions for Wealth Decoded episode workflow

export const WORKFLOW_STAGES = [
  "TOPIC",
  "RESEARCH",
  "SCRIPT",
  "FACT_CHECK",
  "NARRATION",
  "SRT_LOCK",
  "VISUAL_COVERAGE_TIMELINE",
  "ASSET_REGISTER",
  "MASTER_EDIT_REMOTION",
  "ANIMATED_PLACEHOLDERS",
  "PARALLEL_ASSET_PRODUCTION",
  "CANDIDATE_ASSET_REVIEW",
  "AUTOMATIC_REPLACEMENT",
  "QA",
  "FINAL_RENDER",
  "PUBLISH",
] as const

export type WorkflowStage = (typeof WORKFLOW_STAGES)[number]

/**
 * Check if a workflow state is valid.
 */
export function isValidWorkflowState(state: string): state is WorkflowStage {
  return WORKFLOW_STAGES.includes(state as WorkflowStage)
}

/**
 * Check if a transition from one state to another is allowed.
 * V1 policy: forward to immediate next stage only.
 */
export function isValidTransition(fromState: string, toState: string): boolean {
  if (!isValidWorkflowState(fromState) || !isValidWorkflowState(toState)) {
    return false
  }

  // No-op transition rejected
  if (fromState === toState) {
    return false
  }

  const fromIndex = WORKFLOW_STAGES.indexOf(fromState)
  const toIndex = WORKFLOW_STAGES.indexOf(toState)

  // Only forward to immediate next stage allowed
  return toIndex === fromIndex + 1
}

/**
 * Get the next allowed workflow stage.
 */
export function getNextWorkflowStage(currentState: string): WorkflowStage | null {
  if (!isValidWorkflowState(currentState)) {
    return null
  }

  const currentIndex = WORKFLOW_STAGES.indexOf(currentState)
  if (currentIndex >= WORKFLOW_STAGES.length - 1) {
    return null
  }

  return WORKFLOW_STAGES[currentIndex + 1]
}
