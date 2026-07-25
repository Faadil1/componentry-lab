"use client"

import * as React from "react"
import { useInteractionPlayer } from "./player-provider"
import { formatTimecode } from "@/lib/player/timeline"
import { cn } from "@/lib/utils"

const markerTypeColors: Record<string, { dot: string; text: string; bg: string }> = {
  scene: { dot: "bg-stone-400", text: "text-stone-300", bg: "bg-stone-800/50" },
  interaction: { dot: "bg-cyan-400", text: "text-cyan-300", bg: "bg-cyan-950/30" },
  evidence: { dot: "bg-amber-400", text: "text-amber-300", bg: "bg-amber-950/30" },
  decision: { dot: "bg-red-400", text: "text-red-300", bg: "bg-red-950/30" },
  capture: { dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-950/30" },
}

export function PlayerMarkers({ className }: { className?: string }) {
  const { state, actions, markers } = useInteractionPlayer()

  if (markers.length === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Markers
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={actions.jumpToPreviousMarker}
            className="px-2 py-1 rounded text-stone-500 hover:text-stone-300 font-mono text-[10px] border border-stone-800 hover:border-stone-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
            aria-label="Previous marker"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={actions.jumpToNextMarker}
            className="px-2 py-1 rounded text-stone-500 hover:text-stone-300 font-mono text-[10px] border border-stone-800 hover:border-stone-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
            aria-label="Next marker"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Marker list */}
      <div className="space-y-1">
        {markers.map((marker) => {
          const colors = markerTypeColors[marker.type] ?? markerTypeColors.scene
          const isSelected = state.selectedMarker?.id === marker.id
          return (
            <button
              key={marker.id}
              type="button"
              onClick={() => actions.jumpToMarker(marker)}
              className={cn(
                "flex items-center gap-3 w-full rounded-md px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                isSelected
                  ? `${colors.bg} border border-stone-700`
                  : "border border-transparent hover:bg-stone-900/50"
              )}
              aria-label={`Jump to ${marker.label} at ${formatTimecode(marker.time, state.fps)}`}
              aria-current={isSelected ? "true" : undefined}
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", colors.dot)} />
              <div className="flex-1 min-w-0">
                <span className={cn("text-xs font-medium truncate block", isSelected ? colors.text : "text-stone-300")}>
                  {marker.label}
                </span>
                {marker.description && (
                  <span className="text-[10px] text-stone-600 truncate block">{marker.description}</span>
                )}
              </div>
              <span className="font-mono text-[10px] text-stone-500 tabular-nums shrink-0">
                {formatTimecode(marker.time, state.fps)}
              </span>
              <span className="font-mono text-[9px] text-stone-600 uppercase tracking-wider shrink-0">
                {marker.type}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
