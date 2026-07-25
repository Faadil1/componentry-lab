"use client"

import * as React from "react"
import { useCaptureBridge, VIEWPORT_PRESETS } from "./capture-provider"
import type { CaptureAspectRatio, CaptureChromeMode, CaptureSafeArea } from "@/lib/capture/types"
import { cn } from "@/lib/utils"

export interface CaptureToolbarProps {
  className?: string
}

const RATIOS: CaptureAspectRatio[] = ["16:9", "4:3", "1:1", "9:16", "custom"]
const CHROMES: Array<{ key: CaptureChromeMode; label: string }> = [
  { key: "full", label: "Full Chrome" },
  { key: "minimal", label: "Minimal" },
  { key: "hidden", label: "Hidden" },
]
const SAFE_AREAS: CaptureSafeArea[] = ["off", "interface", "presentation", "broadcast", "cinematic"]

export function CaptureToolbar({ className }: CaptureToolbarProps) {
  const { state, actions } = useCaptureBridge()
  const {
    viewport,
    aspectRatio,
    chromeMode,
    safeArea,
    cleanView,
    customWidth,
    customHeight,
  } = state

  const handleCustomWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) actions.setCustomDimensions(Math.min(Math.max(val, 200), 3840), customHeight)
  }

  const handleCustomHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) actions.setCustomDimensions(customWidth, Math.min(Math.max(val, 200), 2160))
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-lg border border-stone-800 bg-[#121110] p-3 text-xs", className)}>
      {/* Viewport Select */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block">Viewport</span>
        <div className="flex flex-wrap items-center gap-1">
          {VIEWPORT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => actions.setViewport(preset.id)}
              className={cn(
                "px-2 py-1 rounded font-mono text-[9px] font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
                viewport === preset.id
                  ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
                  : "border border-stone-850 text-stone-400 hover:text-stone-200"
              )}
              aria-pressed={viewport === preset.id}
            >
              {preset.id}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic dimensions for custom mode */}
      {viewport === "custom" && (
        <div className="flex items-center gap-2 border-l border-stone-800 pl-3">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[8px] text-stone-500 uppercase tracking-widest">Width</span>
            <input
              type="number"
              value={customWidth}
              onChange={handleCustomWidth}
              className="w-16 rounded bg-stone-900 border border-stone-800 text-stone-200 font-mono text-[10px] text-center p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
            />
          </div>
          <span className="text-stone-600 mt-3 font-mono">×</span>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[8px] text-stone-500 uppercase tracking-widest">Height</span>
            <input
              type="number"
              value={customHeight}
              onChange={handleCustomHeight}
              className="w-16 rounded bg-stone-900 border border-stone-800 text-stone-200 font-mono text-[10px] text-center p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
            />
          </div>
        </div>
      )}

      {/* Aspect Ratio Selector */}
      <div className="flex flex-col gap-1.5 shrink-0 border-l border-stone-800 pl-3">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block">Aspect Ratio</span>
        <div className="flex items-center gap-1">
          {RATIOS.map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => actions.setAspectRatio(ratio)}
              className={cn(
                "px-2 py-1 rounded font-mono text-[9px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
                aspectRatio === ratio
                  ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
                  : "border border-stone-850 text-stone-400 hover:text-stone-200"
              )}
              aria-pressed={aspectRatio === ratio}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Chrome Mode Selector */}
      <div className="flex flex-col gap-1.5 shrink-0 border-l border-stone-800 pl-3">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block">Chrome mode</span>
        <div className="flex items-center gap-1">
          {CHROMES.map((cm) => (
            <button
              key={cm.key}
              type="button"
              onClick={() => actions.setChromeMode(cm.key)}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[9px] font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
                chromeMode === cm.key
                  ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
                  : "border border-stone-850 text-stone-400 hover:text-stone-200"
              )}
              aria-pressed={chromeMode === cm.key}
            >
              {cm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Safe Area Selector */}
      <div className="flex flex-col gap-1.5 shrink-0 border-l border-stone-800 pl-3">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block">Safe Areas</span>
        <div className="flex items-center gap-1">
          {SAFE_AREAS.map((sa) => (
            <button
              key={sa}
              type="button"
              onClick={() => actions.setSafeArea(sa)}
              className={cn(
                "px-2 py-1 rounded font-mono text-[9px] font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
                safeArea === sa
                  ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
                  : "border border-stone-850 text-stone-400 hover:text-stone-200"
              )}
              aria-pressed={safeArea === sa}
            >
              {sa}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-grow min-w-4" />

      {/* Reset & Clean View Buttons */}
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <button
          type="button"
          onClick={actions.toggleCleanView}
          className={cn(
            "px-2.5 py-1.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider transition-colors border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
            cleanView
              ? "bg-amber-950/30 text-amber-400 border-amber-500/40"
              : "border-stone-800 text-stone-400 hover:text-stone-200"
          )}
          aria-pressed={cleanView}
        >
          Clean View
        </button>

        <button
          type="button"
          onClick={actions.resetScene}
          className="px-2.5 py-1.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider transition-colors border border-stone-800 text-stone-400 hover:text-stone-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
export default CaptureToolbar
