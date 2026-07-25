"use client"

import * as React from "react"
import { useCaptureBridge } from "./capture-provider"
import { formatTimecode } from "@/lib/player/timeline"
import { cn } from "@/lib/utils"

export interface CaptureInspectorProps {
  className?: string
}

export function CaptureInspector({ className }: CaptureInspectorProps) {
  const { state } = useCaptureBridge()
  const [visible, setVisible] = React.useState(true)

  const {
    activeScene,
    activeState,
    viewport,
    aspectRatio,
    chromeMode,
    safeArea,
    customWidth,
    customHeight,
    cleanView,
  } = state

  if (cleanView) return null

  const rows = [
    { label: "Scene ID", value: activeScene.id },
    { label: "State ID", value: activeState.id },
    { label: "State Type", value: activeState.stateType.toUpperCase() },
    { label: "Is Capture Point", value: activeState.isCapturePoint ? "YES" : "NO" },
    { label: "Is Signature Frame", value: activeState.stateType === "signature" ? "YES" : "NO" },
    { label: "Timecode", value: formatTimecode(activeState.time, activeScene.fps) },
    { label: "Frame Index", value: String(activeState.frame) },
    { label: "Viewport Preset", value: viewport },
    { label: "Dimensions", value: `${viewport === "custom" ? customWidth : activeScene.viewport} × ${viewport === "custom" ? customHeight : ""}` },
    { label: "Aspect Ratio", value: aspectRatio },
    { label: "Chrome Mode", value: chromeMode },
    { label: "Safe Area Overlay", value: safeArea },
  ]

  return (
    <div className={cn("rounded-lg border border-stone-800 bg-[#0e0d0c] overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="flex items-center justify-between w-full px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-inset"
        aria-expanded={visible}
        aria-label="Toggle capture inspector"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Capture Inspector
        </span>
        <span className="font-mono text-[10px] text-stone-600">
          {visible ? "▼" : "▶"}
        </span>
      </button>

      {visible && (
        <div className="border-t border-stone-850">
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

          {/* Notes display inside inspector */}
          {activeState.notes && (
            <div className="p-3 border-t border-stone-850 bg-stone-950/40">
              <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest block mb-1">State Notes</span>
              <p className="text-xs text-stone-400 leading-normal">{activeState.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default CaptureInspector
