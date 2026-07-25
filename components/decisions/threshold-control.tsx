"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { cn } from "@/lib/utils"

export interface ThresholdControlProps {
  className?: string
}

export function ThresholdControl({ className }: ThresholdControlProps) {
  const { state, actions } = useDecisionSystem()
  const { activeScenario, thresholdOverrides } = state
  const { configurableThresholds } = activeScenario

  if (!configurableThresholds || configurableThresholds.length === 0) {
    return (
      <div className={cn("rounded-lg border border-stone-850 bg-[#0c0b0a] p-4 text-center", className)}>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-600 block mb-2">
          Threshold Configuration
        </span>
        <p className="font-mono text-[10px] text-stone-500 italic">
          No configurable thresholds for this scenario.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-stone-850 bg-[#0c0b0a] p-4 space-y-4", className)}>
      <div className="flex items-center justify-between border-b border-stone-900 pb-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Threshold Override Lab
        </span>
        <button
          type="button"
          onClick={actions.resetThresholds}
          className="font-mono text-[9px] text-cyan-400 hover:underline hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
        >
          Reset Overrides
        </button>
      </div>

      <div className="space-y-4">
        {configurableThresholds.map((threshold) => {
          const currentValue = threshold.id in thresholdOverrides
            ? thresholdOverrides[threshold.id]
            : threshold.value

          const hasOverride = threshold.id in thresholdOverrides

          return (
            <div key={threshold.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-300">
                  {threshold.label}
                </span>
                <div className="flex items-center gap-1.5 font-mono">
                  {hasOverride && (
                    <span className="text-[9px] text-amber-500 uppercase font-bold shrink-0">
                      Modified
                    </span>
                  )}
                  <span className="text-stone-100 font-bold tabular-nums">
                    {currentValue}
                    {threshold.unit || ""}
                  </span>
                  <span className="text-stone-600">/</span>
                  <span className="text-stone-500">
                    Def: {threshold.defaultValue}
                    {threshold.unit || ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={threshold.min}
                  max={threshold.max}
                  step={threshold.step}
                  value={currentValue}
                  onChange={(e) => actions.setThreshold(threshold.id, parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-500 h-1 bg-stone-900 rounded-lg cursor-pointer appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  aria-label={`Override threshold for ${threshold.label}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
