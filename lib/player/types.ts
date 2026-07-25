// ─────────────────────────────────────────────────────────────
// Universal Interaction Player — Core Types
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from "react"

/** Playback lifecycle status */
export type PlayerStatus = "idle" | "playing" | "paused" | "ended"

/** Operating mode */
export type PlayerMode = "interactive" | "capture"

/** Allowed playback speeds */
export type PlayerPlaybackRate = 0.5 | 1 | 1.5 | 2

/** Stage aspect ratios */
export type PlayerAspectRatio = "16:9" | "4:3" | "1:1" | "9:16"

/** Marker classification */
export type PlayerMarkerType =
  | "scene"
  | "interaction"
  | "evidence"
  | "decision"
  | "capture"

// ── Marker ───────────────────────────────────────────────────

export interface PlayerMarker {
  id: string
  label: string
  time: number
  type: PlayerMarkerType
  description?: string
}

// ── Scene ────────────────────────────────────────────────────

export interface PlayerScene {
  id: string
  label: string
  start: number
  duration: number
  description?: string
  markerType?: PlayerMarkerType
  render: (ctx: PlayerRenderContext) => ReactNode
}

// ── Render context passed to each scene ──────────────────────

export interface PlayerRenderContext {
  currentTime: number
  duration: number
  progress: number
  sceneProgress: number
  frame: number
  fps: number
  activeScene: PlayerScene | null
  mode: PlayerMode
}

// ── Player configuration ─────────────────────────────────────

export interface PlayerConfig {
  fps: number
  aspectRatio: PlayerAspectRatio
  loop: boolean
  autoplay: boolean
}

// ── Full player state ────────────────────────────────────────

export interface PlayerState {
  status: PlayerStatus
  mode: PlayerMode
  currentTime: number
  duration: number
  progress: number
  frame: number
  fps: number
  playbackRate: PlayerPlaybackRate
  activeScene: PlayerScene | null
  activeSceneProgress: number
  selectedMarker: PlayerMarker | null
}

// ── Serializable capture snapshot ────────────────────────────

export interface PlayerSnapshot {
  currentTime: number
  frame: number
  activeSceneId: string | null
  aspectRatio: PlayerAspectRatio
  selectedMarkerId: string | null
}

// ── Timeline layout context ──────────────────────────────────

export interface PlayerTimelineContext {
  scenes: PlayerScene[]
  markers: PlayerMarker[]
  duration: number
  currentTime: number
}

// ── Preset definition ────────────────────────────────────────

export interface PlayerPreset {
  id: string
  label: string
  description: string
  duration: number
  fps: number
  scenes: PlayerScene[]
  markers: PlayerMarker[]
  defaultAspectRatio: PlayerAspectRatio
}

// ── Player actions (for context consumers) ───────────────────

export interface PlayerActions {
  play: () => void
  pause: () => void
  togglePlayback: () => void
  restart: () => void
  seek: (time: number) => void
  seekBy: (delta: number) => void
  stepForward: () => void
  stepBackward: () => void
  jumpToMarker: (marker: PlayerMarker) => void
  jumpToNextMarker: () => void
  jumpToPreviousMarker: () => void
  setPlaybackRate: (rate: PlayerPlaybackRate) => void
  setMode: (mode: PlayerMode) => void
}

// ── Combined context value ───────────────────────────────────

export interface PlayerContextValue {
  state: PlayerState
  actions: PlayerActions
  config: PlayerConfig
  scenes: PlayerScene[]
  markers: PlayerMarker[]
}
