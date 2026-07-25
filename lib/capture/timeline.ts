// ─────────────────────────────────────────────────────────────
// Demo & Capture Bridge — Timeline Computations
// ─────────────────────────────────────────────────────────────

import type { CaptureState, CaptureStep } from "./types"

/**
 * Finds a state by its identifier.
 */
export function findStateById(states: CaptureState[], id: string): CaptureState | undefined {
  return states.find(s => s.id === id)
}

/**
 * Finds a step associated with a resulting state identifier.
 */
export function findStepByStateId(steps: CaptureStep[], stateId: string): CaptureStep | undefined {
  return steps.find(s => s.resultingStateId === stateId)
}

/**
 * Converts frame index to timeline seconds.
 */
export function frameToTime(frame: number, fps: number): number {
  return Math.max(0, frame / fps)
}

/**
 * Converts timeline seconds to frame index.
 */
export function timeToFrame(time: number, fps: number): number {
  return Math.floor(Math.max(0, time) * fps)
}

/**
 * Returns all states marked as capture frames.
 */
export function getCapturePoints(states: CaptureState[]): CaptureState[] {
  return states.filter(s => s.isCapturePoint)
}

/**
 * Gets the signature display state for a scene.
 */
export function getSignatureState(states: CaptureState[], signatureId: string): CaptureState | undefined {
  return states.find(s => s.id === signatureId && s.stateType === "signature") || states.find(s => s.id === signatureId)
}
