"use client"

import * as React from "react"
import { useInteractionPlayer } from "./player-provider"
import { formatTimecode } from "@/lib/player/timeline"
import { cn } from "@/lib/utils"

export function PlayerInspector({ className }: { className?: string }) {
  const { state, config } = useInteractionPlayer()
  const [visible, setVisible] = React.useState(true)

  const rows: Array<{ label: string; value: string }> = [
    { label: "Status", value: state.status },
    { label: "Mode", value: state.mode },
    { label: "Current Time", value: `${state.currentTime.toFixed(3)}s` },
    { label: "Duration", value: `${state.duration.toFixed(1)}s` },
    { label: "Progress", value: `${(state.progress * 100).toFixed(1)}%` },
    { label: "Frame", value: `${state.frame}` },
    { label: "FPS", value: `${state.fps}` },
    { label: "Playback Rate", value: `${state.playbackRate}×` },
    { label: "Active Scene", value: state.activeScene?.label ?? "—" },
    { label: "Scene Progress", value: `${(state.activeSceneProgress * 100).toFixed(1)}%` },
    { label: "Selected Marker", value: state.selectedMarker?.label ?? "—" },
    { label: "Aspect Ratio", value: config.aspectRatio },
    { label: "Timecode", value: formatTimecode(state.currentTime, state.fps) },
  ]

  return (
    <div className={cn("rounded-lg border border-stone-800 bg-[#0e0d0c] overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="flex items-center justify-between w-full px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-inset"
        aria-expanded={visible}
        aria-label="Toggle player inspector"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Player Inspector
        </span>
        <span className="font-mono text-[10px] text-stone-600">
          {visible ? "▼" : "▶"}
        </span>
      </button>

      {visible && (
        <div className="border-t border-stone-800">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-3 py-1.5 border-b border-stone-900 last:border-b-0"
            >
              <span className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">
                {row.label}
              </span>
              <span className="font-mono text-[11px] text-stone-200 tabular-nums text-right">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
