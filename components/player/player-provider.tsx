"use client"

// ─────────────────────────────────────────────────────────────
// Universal Interaction Player — Provider & Context
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import type {
  PlayerActions,
  PlayerConfig,
  PlayerContextValue,
  PlayerMarker,
  PlayerMode,
  PlayerPlaybackRate,
  PlayerScene,
  PlayerState,
  PlayerStatus,
} from "@/lib/player/types"
import {
  clamp,
  computeFrame,
  computeProgress,
  computeSceneProgress,
  findActiveScene,
  findNearestMarker,
} from "@/lib/player/timeline"

// ── Internal reducer ─────────────────────────────────────────

type Action =
  | { type: "SET_STATUS"; status: PlayerStatus }
  | { type: "SET_MODE"; mode: PlayerMode }
  | { type: "SET_TIME"; time: number }
  | { type: "SET_PLAYBACK_RATE"; rate: PlayerPlaybackRate }
  | { type: "SET_SELECTED_MARKER"; marker: PlayerMarker | null }

interface InternalState {
  status: PlayerStatus
  mode: PlayerMode
  currentTime: number
  playbackRate: PlayerPlaybackRate
  selectedMarker: PlayerMarker | null
}

function reducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.status }
    case "SET_MODE":
      return { ...state, mode: action.mode }
    case "SET_TIME":
      return { ...state, currentTime: action.time }
    case "SET_PLAYBACK_RATE":
      return { ...state, playbackRate: action.rate }
    case "SET_SELECTED_MARKER":
      return { ...state, selectedMarker: action.marker }
    default:
      return state
  }
}

// ── Context ──────────────────────────────────────────────────

const PlayerContext = React.createContext<PlayerContextValue | null>(null)

// ── Hook ─────────────────────────────────────────────────────

export function useInteractionPlayer(): PlayerContextValue {
  const ctx = React.useContext(PlayerContext)
  if (!ctx) {
    throw new Error(
      "useInteractionPlayer must be used within a <PlayerProvider>. " +
      "Wrap your component tree with <PlayerProvider> or <InteractionPlayer>."
    )
  }
  return ctx
}

// ── Provider Props ───────────────────────────────────────────

export interface PlayerProviderProps {
  config: PlayerConfig
  scenes: PlayerScene[]
  markers: PlayerMarker[]
  initialTime?: number
  initialMode?: PlayerMode
  autoplay?: boolean
  loop?: boolean
  onStateChange?: (state: PlayerState) => void
  children: React.ReactNode
}

// ── Provider ─────────────────────────────────────────────────

export function PlayerProvider({
  config,
  scenes,
  markers,
  initialTime = 0,
  initialMode = "interactive",
  autoplay = false,
  loop = false,
  onStateChange,
  children,
}: PlayerProviderProps) {
  const duration = React.useMemo(
    () => scenes.reduce((max, s) => Math.max(max, s.start + s.duration), 0),
    [scenes]
  )

  const [internal, dispatch] = React.useReducer(reducer, {
    status: "idle" as PlayerStatus,
    mode: initialMode,
    currentTime: clamp(initialTime, 0, duration),
    playbackRate: 1 as PlayerPlaybackRate,
    selectedMarker: null,
  })

  // Refs for rAF loop to avoid stale closures
  const rafRef = React.useRef<number | null>(null)
  const lastTimeRef = React.useRef<number | null>(null)
  const currentTimeRef = React.useRef(internal.currentTime)
  const playbackRateRef = React.useRef(internal.playbackRate)
  const loopRef = React.useRef(loop)
  const durationRef = React.useRef(duration)

  // Sync refs in effects (React 19 disallows ref writes during render)
  React.useEffect(() => { currentTimeRef.current = internal.currentTime }, [internal.currentTime])
  React.useEffect(() => { playbackRateRef.current = internal.playbackRate }, [internal.playbackRate])
  React.useEffect(() => { loopRef.current = loop }, [loop])
  React.useEffect(() => { durationRef.current = duration }, [duration])

  // Respect prefers-reduced-motion
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  // ── Derived state ────────────────────────────────────────

  const activeScene = findActiveScene(internal.currentTime, scenes)
  const progress = computeProgress(internal.currentTime, duration)
  const frame = computeFrame(internal.currentTime, config.fps)
  const activeSceneProgress = activeScene
    ? computeSceneProgress(internal.currentTime, activeScene)
    : 0

  const playerState: PlayerState = React.useMemo(
    () => ({
      status: internal.status,
      mode: internal.mode,
      currentTime: internal.currentTime,
      duration,
      progress,
      frame,
      fps: config.fps,
      playbackRate: internal.playbackRate,
      activeScene,
      activeSceneProgress,
      selectedMarker: internal.selectedMarker,
    }),
    [internal, duration, progress, frame, config.fps, activeScene, activeSceneProgress]
  )

  // Notify parent of state changes
  const stateChangeRef = React.useRef(onStateChange)
  React.useEffect(() => { stateChangeRef.current = onStateChange }, [onStateChange])
  React.useEffect(() => {
    stateChangeRef.current?.(playerState)
  }, [playerState])

  // ── rAF playback loop ────────────────────────────────────

  React.useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastTimeRef.current = null

    if (internal.status !== "playing" || internal.mode !== "interactive") {
      return
    }

    const animLoop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
        rafRef.current = requestAnimationFrame(animLoop)
        return
      }

      const deltaMs = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp
      const deltaSec = (deltaMs / 1000) * playbackRateRef.current
      const newTime = currentTimeRef.current + deltaSec

      if (newTime >= durationRef.current) {
        if (loopRef.current) {
          dispatch({ type: "SET_TIME", time: 0 })
        } else {
          dispatch({ type: "SET_TIME", time: durationRef.current })
          dispatch({ type: "SET_STATUS", status: "ended" })
          return
        }
      } else {
        dispatch({ type: "SET_TIME", time: newTime })
      }

      rafRef.current = requestAnimationFrame(animLoop)
    }

    rafRef.current = requestAnimationFrame(animLoop)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      lastTimeRef.current = null
    }
  }, [internal.status, internal.mode])

  // ── Autoplay ─────────────────────────────────────────────

  React.useEffect(() => {
    if (autoplay && !prefersReducedMotion && internal.status === "idle") {
      dispatch({ type: "SET_STATUS", status: "playing" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Actions ──────────────────────────────────────────────

  const actions: PlayerActions = React.useMemo(() => ({
    play: () => {
      if (internal.currentTime >= duration) {
        dispatch({ type: "SET_TIME", time: 0 })
      }
      dispatch({ type: "SET_STATUS", status: "playing" })
    },
    pause: () => {
      dispatch({ type: "SET_STATUS", status: "paused" })
    },
    togglePlayback: () => {
      if (internal.status === "playing") {
        dispatch({ type: "SET_STATUS", status: "paused" })
      } else {
        if (internal.currentTime >= duration) {
          dispatch({ type: "SET_TIME", time: 0 })
        }
        dispatch({ type: "SET_STATUS", status: "playing" })
      }
    },
    restart: () => {
      dispatch({ type: "SET_TIME", time: 0 })
      dispatch({ type: "SET_STATUS", status: "playing" })
    },
    seek: (time: number) => {
      const t = clamp(time, 0, duration)
      dispatch({ type: "SET_TIME", time: t })
      if (internal.status === "ended") {
        dispatch({ type: "SET_STATUS", status: "paused" })
      }
    },
    seekBy: (delta: number) => {
      const t = clamp(internal.currentTime + delta, 0, duration)
      dispatch({ type: "SET_TIME", time: t })
      if (internal.status === "ended" && t < duration) {
        dispatch({ type: "SET_STATUS", status: "paused" })
      }
    },
    stepForward: () => {
      const step = 1 / config.fps
      const t = clamp(internal.currentTime + step, 0, duration)
      dispatch({ type: "SET_TIME", time: t })
      if (internal.status === "ended" && t < duration) {
        dispatch({ type: "SET_STATUS", status: "paused" })
      }
    },
    stepBackward: () => {
      const step = 1 / config.fps
      const t = clamp(internal.currentTime - step, 0, duration)
      dispatch({ type: "SET_TIME", time: t })
    },
    jumpToMarker: (marker: PlayerMarker) => {
      const t = clamp(marker.time, 0, duration)
      dispatch({ type: "SET_TIME", time: t })
      dispatch({ type: "SET_SELECTED_MARKER", marker })
      if (internal.status === "ended") {
        dispatch({ type: "SET_STATUS", status: "paused" })
      }
    },
    jumpToNextMarker: () => {
      const next = findNearestMarker(internal.currentTime, markers, 1)
      if (next) {
        dispatch({ type: "SET_TIME", time: clamp(next.time, 0, duration) })
        dispatch({ type: "SET_SELECTED_MARKER", marker: next })
      }
    },
    jumpToPreviousMarker: () => {
      const prev = findNearestMarker(internal.currentTime, markers, -1)
      if (prev) {
        dispatch({ type: "SET_TIME", time: clamp(prev.time, 0, duration) })
        dispatch({ type: "SET_SELECTED_MARKER", marker: prev })
      }
    },
    setPlaybackRate: (rate: PlayerPlaybackRate) => {
      dispatch({ type: "SET_PLAYBACK_RATE", rate })
    },
    setMode: (mode: PlayerMode) => {
      dispatch({ type: "SET_MODE", mode })
      if (mode === "capture") {
        dispatch({ type: "SET_STATUS", status: "paused" })
      }
    },
  }), [internal.currentTime, internal.status, duration, config.fps, markers])

  // ── Context value ────────────────────────────────────────

  const contextValue: PlayerContextValue = React.useMemo(
    () => ({
      state: playerState,
      actions,
      config,
      scenes,
      markers,
    }),
    [playerState, actions, config, scenes, markers]
  )

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  )
}
