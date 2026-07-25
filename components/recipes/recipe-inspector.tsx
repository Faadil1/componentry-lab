"use client"

import * as React from "react"
import { useRecipeStudio } from "./recipe-provider"
import { cn } from "@/lib/utils"

export interface RecipeInspectorProps {
  className?: string
}

export function RecipeInspector({ className }: RecipeInspectorProps) {
  const { state } = useRecipeStudio()
  const [visible, setVisible] = React.useState(true)

  const {
    activeRecipeId,
    activeRecipe,
    activeSectionId,
    activeCaptureStateId,
    viewport,
    cleanView,
  } = state

  if (cleanView) return null

  const capturePointsCount = activeRecipe.capturePlan.states.filter(s => s.isCapturePoint).length
  const systemsUsed = activeRecipe.systems.map(s => s.systemId).join(", ")

  const rows = [
    { label: "Recipe ID", value: activeRecipeId },
    { label: "Category", value: activeRecipe.category.toUpperCase() },
    { label: "Status", value: activeRecipe.status.toUpperCase() },
    { label: "Active Section", value: activeSectionId },
    { label: "Active Capture State", value: activeCaptureStateId },
    { label: "Signature State", value: activeRecipe.signatureStateId },
    { label: "Simulated Viewport", value: viewport },
    { label: "Systems Integrated", value: systemsUsed },
    { label: "Interaction Count", value: String(activeRecipe.interactions.length) },
    { label: "Capture Points Count", value: String(capturePointsCount) },
    { label: "Deterministic Gate", value: "YES" },
    { label: "Capture Ready", value: "YES" },
  ]

  return (
    <div className={cn("rounded-lg border border-stone-800 bg-[#0e0d0c] overflow-hidden text-xs", className)}>
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="flex items-center justify-between w-full px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
        aria-expanded={visible}
        aria-label="Toggle recipe inspector"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Recipe Inspector
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
              <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider">
                {row.label}
              </span>
              <span className="font-mono text-[10px] text-stone-200 tabular-nums text-right font-semibold">
                {row.value}
              </span>
            </div>
          ))}

          {/* Accessibility notes */}
          {activeRecipe.accessibilityNotes.length > 0 && (
            <div className="p-3 border-t border-stone-850 bg-stone-950/40 space-y-1.5">
              <span className="font-mono text-[8.5px] text-emerald-400 uppercase tracking-widest block font-bold">Accessibility Rules</span>
              <ul className="list-disc pl-3 text-[10.5px] text-stone-400 space-y-1">
                {activeRecipe.accessibilityNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Limitations */}
          {activeRecipe.limitations.length > 0 && (
            <div className="p-3 border-t border-stone-850 bg-stone-950/40 space-y-1.5">
              <span className="font-mono text-[8.5px] text-amber-500 uppercase tracking-widest block font-bold">Limitations</span>
              <ul className="list-disc pl-3 text-[10.5px] text-stone-400 space-y-1">
                {activeRecipe.limitations.map((lim) => (
                  <li key={lim.id}>{lim.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default RecipeInspector
