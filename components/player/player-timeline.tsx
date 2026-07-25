"use client"

import * as React from "react"
import { useInteractionPlayer } from "./player-provider"
import { formatTimecode } from "@/lib/player/timeline"
import { cn } from "@/lib/utils"

const markerTypeColors: Record<string, string> = {
  scene: "bg-stone-500",
  interaction: "bg-cyan-400",
  evidence: "bg-amber-400",
  decision: "bg-red-400",
  capture: "bg-emerald-400",
}

export function PlayerTimeline({ className }: { className?: string }) {
  const { state, actions, scenes, markers } = useInteractionPlayer()
  const trackRef = React.useRef<HTMLDivElement>(null)

  const handleSeek = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const x = e.clientX - rect.left
      const ratio = Math.max(0, Math.min(1, x / rect.width))
      actions.seek(ratio * state.duration)
    },
    [actions, state.duration]
  )

  const handleRangeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      actions.seek(parseFloat(e.target.value))
    },
    [actions]
  )

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Visual track */}
      <div className="relative">
        {/* Scene blocks */}
        <div
          ref={trackRef}
          className="relative h-8 rounded-md bg-[#1a1816] border border-stone-800 overflow-hidden cursor-pointer"
          onClick={handleSeek}
          role="presentation"
        >
          {/* Scene segments */}
          {scenes.map((scene, i) => {
            const left = (scene.start / state.duration) * 100
            const width = (scene.duration / state.duration) * 100
            const isActive = state.activeScene?.id === scene.id
            return (
              <div
                key={scene.id}
                className={cn(
                  "absolute top-0 bottom-0 border-r border-stone-700/50",
                  isActive ? "bg-stone-800/80" : "bg-stone-900/40",
                  i === 0 && "rounded-l-md",
                  i === scenes.length - 1 && "rounded-r-md border-r-0"
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={scene.label}
              >
                <span className="absolute bottom-0.5 left-1.5 font-mono text-[8px] text-stone-500 uppercase tracking-wider truncate max-w-full pr-1">
                  {scene.label}
                </span>
              </div>
            )
          })}

          {/* Marker pins */}
          {markers.map((marker) => {
            const position = (marker.time / state.duration) * 100
            return (
              <button
                key={marker.id}
                type="button"
                className="absolute top-0 w-0.5 h-full z-10 group focus-visible:outline-none"
                style={{ left: `${position}%` }}
                onClick={(e) => {
                  e.stopPropagation()
                  actions.jumpToMarker(marker)
                }}
                aria-label={`Jump to marker: ${marker.label}`}
                title={marker.label}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full -ml-[2px] mt-1", markerTypeColors[marker.type] ?? "bg-stone-400")} />
                <div className="w-px h-full bg-stone-600/50 mx-auto group-hover:bg-stone-400 group-focus-visible:ring-2 group-focus-visible:ring-cyan-500" />
              </button>
            )
          })}

          {/* Progress fill */}
          <div
            className="absolute top-0 bottom-0 bg-cyan-500/10 border-r-2 border-cyan-400 pointer-events-none z-10"
            style={{ width: `${state.progress * 100}%` }}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-20 pointer-events-none"
            style={{ left: `${state.progress * 100}%` }}
          >
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full -ml-[4px] -mt-0.5 shadow-sm shadow-cyan-500/30" />
          </div>
        </div>

        {/* Accessible range input (overlaid, invisible) */}
        <input
          type="range"
          min={0}
          max={state.duration}
          step={1 / state.fps}
          value={state.currentTime}
          onChange={handleRangeChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
          aria-label="Timeline position"
          aria-valuetext={`${formatTimecode(state.currentTime, state.fps)} of ${formatTimecode(state.duration, state.fps)}`}
        />
      </div>

      {/* Timecodes */}
      <div className="flex items-center justify-between font-mono text-[10px] text-stone-600 tabular-nums px-0.5">
        <span>{formatTimecode(state.currentTime, state.fps)}</span>
        <span>{formatTimecode(state.duration, state.fps)}</span>
      </div>
    </div>
  )
}
