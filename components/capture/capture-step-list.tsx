"use client"

import * as React from "react"
import { useCaptureBridge } from "./capture-provider"
import { cn } from "@/lib/utils"

export interface CaptureStepListProps {
  className?: string
}

const actionStyles = {
  load: "border-purple-800/40 bg-purple-950/20 text-purple-400",
  click: "border-cyan-800/40 bg-cyan-950/20 text-cyan-400",
  toggle: "border-amber-800/40 bg-amber-955/20 text-amber-400",
  seek: "border-blue-800/40 bg-blue-955/20 text-blue-400",
  exclude: "border-red-800/40 bg-red-955/20 text-red-400",
  include: "border-emerald-800/40 bg-emerald-955/20 text-emerald-400",
  select: "border-stone-850 bg-stone-900 text-stone-300",
  wait: "border-stone-800 text-stone-500",
  capture: "border-cyan-800/45 bg-cyan-900/10 text-cyan-400 font-bold",
  reset: "border-stone-800 text-stone-500",
}

export function CaptureStepList({ className }: CaptureStepListProps) {
  const { state, actions } = useCaptureBridge()
  const { activeScene, activeState, cleanView } = state

  if (cleanView) return null

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center border-b border-stone-850 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Interaction Sequence Steps
        </span>
        <span className="font-mono text-[9px] text-stone-600">
          Manual Script Steps
        </span>
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {activeScene.steps.map((step) => {
          const isActive = activeState.id === step.resultingStateId
          const style = actionStyles[step.action] || actionStyles.select

          return (
            <div
              key={step.id}
              onClick={() => actions.setState(step.resultingStateId)}
              className={cn(
                "rounded-lg border p-3 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                isActive
                  ? "border-cyan-500/40 bg-cyan-950/10"
                  : "border-stone-850 bg-[#0e0d0c] hover:border-stone-700"
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="font-mono text-[10px] text-stone-600 font-bold mt-0.5">
                  [{String(step.order).padStart(2, "0")}]
                </span>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn(
                      "inline-flex px-1.5 py-0.2 rounded text-[7.5px] font-mono border uppercase tracking-wider",
                      style
                    )}>
                      {step.action}
                    </span>
                    <span className="text-xs font-semibold text-stone-300">
                      {step.target}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Trigger: {step.trigger}
                  </p>
                </div>
              </div>

              {/* Validation check right */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-stone-900 pt-2 sm:pt-0">
                {step.expectedValidation && (
                  <span className="font-mono text-[9px] text-stone-400 bg-stone-900 border border-stone-850/60 px-2 py-0.5 rounded">
                    Check: {step.expectedValidation}
                  </span>
                )}
                <span className="font-mono text-[10px] text-stone-600">
                  Dur: {step.duration.toFixed(1)}s
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default CaptureStepList
