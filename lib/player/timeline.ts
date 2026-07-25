// ─────────────────────────────────────────────────────────────
// Universal Interaction Player — Timeline Engine
// Pure, deterministic functions. No side-effects.
// ─────────────────────────────────────────────────────────────

import type { PlayerMarker, PlayerScene } from "./types"

/** Clamp a numeric value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Compute the discrete frame index for a given time and fps. */
export function computeFrame(currentTime: number, fps: number): number {
  return Math.floor(currentTime * fps)
}

/** Compute global progress (0–1). */
export function computeProgress(currentTime: number, duration: number): number {
  if (duration <= 0) return 0
  return clamp(currentTime / duration, 0, 1)
}

/** Compute progress within a single scene (0–1). */
export function computeSceneProgress(
  currentTime: number,
  scene: PlayerScene
): number {
  if (scene.duration <= 0) return 0
  return clamp((currentTime - scene.start) / scene.duration, 0, 1)
}

/** Find the scene active at the given time, or null. */
export function findActiveScene(
  currentTime: number,
  scenes: PlayerScene[]
): PlayerScene | null {
  for (const scene of scenes) {
    if (currentTime >= scene.start && currentTime < scene.start + scene.duration) {
      return scene
    }
  }
  // If exactly at the end of the last scene, return that scene
  if (scenes.length > 0) {
    const last = scenes[scenes.length - 1]
    if (currentTime >= last.start + last.duration && currentTime >= last.start) {
      return last
    }
  }
  return null
}

/**
 * Find the nearest marker in a given direction relative to currentTime.
 * direction: 1 for next, -1 for previous.
 */
export function findNearestMarker(
  currentTime: number,
  markers: PlayerMarker[],
  direction: 1 | -1
): PlayerMarker | null {
  const sorted = [...markers].sort((a, b) => a.time - b.time)

  if (direction === 1) {
    // Find the first marker strictly after currentTime (with small epsilon)
    const epsilon = 0.001
    return sorted.find((m) => m.time > currentTime + epsilon) ?? null
  }

  // Find the last marker strictly before currentTime
  const epsilon = 0.001
  const reversed = [...sorted].reverse()
  return reversed.find((m) => m.time < currentTime - epsilon) ?? null
}

/**
 * Format a time value as a timecode string.
 * Output: "MM:SS.ff" where ff is the frame within the second.
 */
export function formatTimecode(seconds: number, fps: number = 30): string {
  const clamped = Math.max(0, seconds)
  const totalFrames = Math.floor(clamped * fps)
  const mins = Math.floor(clamped / 60)
  const secs = Math.floor(clamped % 60)
  const frames = totalFrames % fps

  const mm = String(mins).padStart(2, "0")
  const ss = String(secs).padStart(2, "0")
  const ff = String(frames).padStart(2, "0")

  return `${mm}:${ss}.${ff}`
}

/**
 * Format seconds as a simple duration string (e.g. "0:10").
 */
export function formatDuration(seconds: number): string {
  const clamped = Math.max(0, seconds)
  const mins = Math.floor(clamped / 60)
  const secs = Math.floor(clamped % 60)
  return `${mins}:${String(secs).padStart(2, "0")}`
}
