"use client"

import * as React from "react"
import { useCaptureBridge } from "./capture-provider"
import { CaptureStage } from "./capture-stage"
import { cn } from "@/lib/utils"

export interface CaptureCleanViewProps {
  className?: string
}

export function CaptureCleanView({ className }: CaptureCleanViewProps) {
  const { state, actions } = useCaptureBridge()
  const { cleanView } = state

  if (!cleanView) return null

  return (
    <div
      className={cn(
        "fixed inset-0 bg-[#070707] z-50 flex flex-col items-center justify-center p-6 transition-all duration-300",
        className
      )}
      role="dialog"
      aria-label="Clean view mode"
    >
      {/* Return hint top */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40 text-stone-500 font-mono text-[10px]">
        <span>Demo Capture Clean View</span>
        <button
          type="button"
          onClick={actions.toggleCleanView}
          className="px-2 py-1 rounded border border-stone-850 hover:border-stone-700 hover:text-stone-300 transition-colors"
          aria-label="Exit Clean View"
        >
          Exit View (ESC)
        </button>
      </div>

      {/* Capture stage centered */}
      <div className="w-full max-w-5xl max-h-[85vh] flex items-center justify-center">
        <CaptureStage className="w-full h-full" />
      </div>

      {/* Safe Area indicators helper text bottom */}
      <div className="absolute bottom-4 font-mono text-[9px] text-stone-600 text-center">
        Clean view mode hides controls for target frame grabbers.
      </div>
    </div>
  )
}
export default CaptureCleanView
