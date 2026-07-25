"use client"

import * as React from "react"
import { useInteractionPlayer } from "./player-provider"
import { formatTimecode } from "@/lib/player/timeline"
import type { PlayerAspectRatio, PlayerSnapshot } from "@/lib/player/types"
import { cn } from "@/lib/utils"

const RATIOS: PlayerAspectRatio[] = ["16:9", "4:3", "1:1", "9:16"]

export function PlayerCapturePanel({ className }: { className?: string }) {
  const { state, actions, config } = useInteractionPlayer()
  const [copied, setCopied] = React.useState(false)

  const snapshot: PlayerSnapshot = React.useMemo(() => ({
    currentTime: state.currentTime,
    frame: state.frame,
    activeSceneId: state.activeScene?.id ?? null,
    aspectRatio: config.aspectRatio,
    selectedMarkerId: state.selectedMarker?.id ?? null,
  }), [state.currentTime, state.frame, state.activeScene?.id, config.aspectRatio, state.selectedMarker?.id])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text
    }
  }, [snapshot])

  return (
    <div className={cn("rounded-lg border border-stone-800 bg-[#0e0d0c] p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold">
          Capture Panel
        </span>
      </div>

      {/* Timecode & Frame */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-stone-800 bg-stone-900/50 p-2.5">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-1">Timecode</span>
          <span className="font-mono text-sm text-stone-100 tabular-nums">{formatTimecode(state.currentTime, state.fps)}</span>
        </div>
        <div className="rounded-md border border-stone-800 bg-stone-900/50 p-2.5">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-1">Frame</span>
          <span className="font-mono text-sm text-stone-100 tabular-nums">F{state.frame}</span>
        </div>
      </div>

      {/* Step controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={actions.stepBackward}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-stone-700 bg-stone-900/50 text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition-colors font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label="Step backward one frame"
        >
          ← Frame
        </button>
        <button
          type="button"
          onClick={actions.stepForward}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-stone-700 bg-stone-900/50 text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition-colors font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label="Step forward one frame"
        >
          Frame →
        </button>
      </div>

      {/* Aspect Ratio */}
      <div>
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-2">Aspect Ratio</span>
        <div className="flex items-center gap-1">
          {RATIOS.map((ratio) => (
            <span
              key={ratio}
              className={cn(
                "px-2 py-1 rounded font-mono text-[10px] font-bold border",
                config.aspectRatio === ratio
                  ? "border-cyan-500/30 bg-cyan-950/30 text-cyan-300"
                  : "border-stone-800 text-stone-600"
              )}
            >
              {ratio}
            </span>
          ))}
        </div>
      </div>

      {/* Active scene */}
      <div>
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-1">Active Scene</span>
        <span className="font-mono text-xs text-stone-300">{state.activeScene?.label ?? "—"}</span>
      </div>

      {/* Copy state */}
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
          copied
            ? "border border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
            : "border border-stone-700 bg-stone-900/50 text-stone-300 hover:bg-stone-800 hover:text-stone-100"
        )}
        aria-label="Copy capture state to clipboard"
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Copied
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            Copy Capture State
          </>
        )}
      </button>
    </div>
  )
}
