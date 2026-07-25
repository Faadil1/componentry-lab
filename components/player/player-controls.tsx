"use client"

import * as React from "react"
import { useInteractionPlayer } from "./player-provider"
import { formatTimecode } from "@/lib/player/timeline"
import type { PlayerPlaybackRate } from "@/lib/player/types"

const RATES: PlayerPlaybackRate[] = [0.5, 1, 1.5, 2]

export function PlayerControls() {
  const { state, actions } = useInteractionPlayer()
  const isPlaying = state.status === "playing"
  const isCapture = state.mode === "capture"

  // Keyboard shortcuts
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      if (tag === "input" || tag === "textarea" || target.isContentEditable) return

      switch (e.key) {
        case " ":
          e.preventDefault()
          actions.togglePlayback()
          break
        case "ArrowLeft":
          e.preventDefault()
          if (e.shiftKey) {
            actions.stepBackward()
          } else {
            actions.seekBy(-1)
          }
          break
        case "ArrowRight":
          e.preventDefault()
          if (e.shiftKey) {
            actions.stepForward()
          } else {
            actions.seekBy(1)
          }
          break
        case "Home":
          e.preventDefault()
          actions.seek(0)
          break
        case "End":
          e.preventDefault()
          actions.seek(state.duration)
          break
        case "m":
        case "M":
          e.preventDefault()
          actions.jumpToNextMarker()
          break
        case "r":
        case "R":
          e.preventDefault()
          actions.restart()
          break
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [actions, state.duration])

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-800 bg-[#141312] px-3 py-2">
      {/* Transport controls */}
      <div className="flex items-center gap-1">
        {/* Restart */}
        <button
          type="button"
          onClick={actions.restart}
          className="flex items-center justify-center w-8 h-8 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label="Restart"
          title="Restart (R)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>

        {/* Previous marker */}
        <button
          type="button"
          onClick={actions.jumpToPreviousMarker}
          className="flex items-center justify-center w-8 h-8 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label="Previous marker"
          title="Previous marker"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>

        {/* Step backward */}
        <button
          type="button"
          onClick={actions.stepBackward}
          className="flex items-center justify-center w-8 h-8 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label="Step backward"
          title="Step backward (Shift+←)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 19 2 12 11 5 11 19" />
            <line x1="22" y1="5" x2="22" y2="19" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={actions.togglePlayback}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-800 text-stone-100 hover:bg-stone-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          )}
        </button>

        {/* Step forward */}
        <button
          type="button"
          onClick={actions.stepForward}
          className="flex items-center justify-center w-8 h-8 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label="Step forward"
          title="Step forward (Shift+→)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 19 22 12 13 5 13 19" />
            <line x1="2" y1="5" x2="2" y2="19" />
          </svg>
        </button>

        {/* Next marker */}
        <button
          type="button"
          onClick={actions.jumpToNextMarker}
          className="flex items-center justify-center w-8 h-8 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label="Next marker"
          title="Next marker (M)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>

      {/* Timecode */}
      <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums px-2">
        <span className="text-stone-100">{formatTimecode(state.currentTime, state.fps)}</span>
        <span className="text-stone-600">/</span>
        <span className="text-stone-500">{formatTimecode(state.duration, state.fps)}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-w-2" />

      {/* Playback rate */}
      <div className="flex items-center gap-1">
        {RATES.map((rate) => (
          <button
            key={rate}
            type="button"
            onClick={() => actions.setPlaybackRate(rate)}
            className={`px-2 py-1 rounded font-mono text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
              state.playbackRate === rate
                ? "bg-cyan-950/50 text-cyan-300 border border-cyan-500/30"
                : "text-stone-500 hover:text-stone-300 border border-transparent"
            }`}
            aria-label={`Playback rate ${rate}x`}
            aria-pressed={state.playbackRate === rate}
          >
            {rate}×
          </button>
        ))}
      </div>

      {/* Mode toggle */}
      <button
        type="button"
        onClick={() => actions.setMode(isCapture ? "interactive" : "capture")}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
          isCapture
            ? "bg-red-950/40 text-red-400 border border-red-500/30"
            : "text-stone-500 hover:text-stone-300 border border-stone-700"
        }`}
        aria-pressed={isCapture}
        aria-label={isCapture ? "Switch to interactive mode" : "Switch to capture mode"}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isCapture ? "bg-red-500" : "bg-stone-600"}`} />
        {isCapture ? "Capture" : "Interactive"}
      </button>
    </div>
  )
}
