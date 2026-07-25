"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { decisionPresets } from "@/lib/decisions/presets"
import type { DecisionMode } from "@/lib/decisions/types"
import { cn } from "@/lib/utils"

export interface ScenarioSwitcherProps {
  className?: string
}

const MODES: Array<{ key: DecisionMode; label: string; desc: string }> = [
  { key: "observed", label: "Observed", desc: "Baseline metrics" },
  { key: "stress", label: "Stress", desc: "Extreme conditions" },
  { key: "edge", label: "Edge Case", desc: "Ambiguous limits" },
]

export function ScenarioSwitcher({ className }: ScenarioSwitcherProps) {
  const { state, actions } = useDecisionSystem()
  const { activeScenario, mode } = state

  const scenariosList = Object.values(decisionPresets)

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {/* Scenario select */}
      <div className="rounded-lg border border-stone-850 bg-[#0c0b0a] p-4 space-y-3">
        <div className="border-b border-stone-900 pb-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">
            Select Decision Scenario
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {scenariosList.map((scenario) => {
            const isSelected = activeScenario.id === scenario.id
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => actions.setScenario(scenario)}
                className={cn(
                  "w-full flex flex-col text-left p-3 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                  isSelected
                    ? "border-cyan-500/40 bg-stone-900 text-stone-200"
                    : "border-stone-900 bg-stone-950/40 text-stone-400 hover:border-stone-800 hover:text-stone-300"
                )}
                aria-pressed={isSelected}
              >
                <span className="text-xs font-bold font-mono tracking-wide uppercase">
                  {scenario.label}
                </span>
                <span className="text-[10px] text-stone-500 leading-normal mt-1 block">
                  {scenario.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mode switches */}
      <div className="rounded-lg border border-stone-850 bg-[#0c0b0a] p-4 space-y-3">
        <div className="border-b border-stone-900 pb-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">
            Telemetry Simulation Mode
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {MODES.map((item) => {
            const isSelected = mode === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => actions.setMode(item.key)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                  isSelected
                    ? "border-cyan-500/40 bg-stone-900 text-stone-200"
                    : "border-stone-900 bg-stone-950/40 text-stone-400 hover:border-stone-800 hover:text-stone-300"
                )}
                aria-pressed={isSelected}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-stone-500 leading-normal mt-0.5 block">
                    {item.desc}
                  </span>
                </div>

                <span className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  isSelected ? "bg-cyan-400" : "bg-stone-700"
                )} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
