"use client"

import * as React from "react"
import { useRecipeStudio } from "./recipe-provider"
import { cn } from "@/lib/utils"

export interface RecipeCapturePlanProps {
  className?: string
}

export function RecipeCapturePlan({ className }: RecipeCapturePlanProps) {
  const { state, actions } = useRecipeStudio()
  const { activeRecipe, activeCaptureStateId, cleanView } = state
  const [copied, setCopied] = React.useState(false)

  if (cleanView) return null

  const handleCopyPlan = async () => {
    await actions.copyCapturePlan()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("rounded-lg border border-stone-850 bg-[#0e0d0c] p-4 space-y-3.5", className)}>
      <div className="flex justify-between items-center border-b border-stone-900 pb-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Recipe Capture Plan
        </span>
        <button
          type="button"
          onClick={handleCopyPlan}
          className={cn(
            "font-mono text-[9px] uppercase tracking-wider font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
            copied ? "text-emerald-400" : "text-cyan-400 hover:text-cyan-300"
          )}
        >
          {copied ? "Copied Plan" : "Copy Capture Plan"}
        </button>
      </div>

      {/* Navigation triggers row */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={actions.previousCaptureState}
          className="flex-1 px-3 py-2 rounded border border-stone-850 bg-stone-900/60 hover:text-stone-200 transition-colors font-mono text-[10px] uppercase font-bold"
        >
          ← Previous Frame
        </button>
        <button
          type="button"
          onClick={actions.nextCaptureState}
          className="flex-1 px-3 py-2 rounded border border-stone-850 bg-stone-900/60 hover:text-stone-200 transition-colors font-mono text-[10px] uppercase font-bold"
        >
          Next Frame →
        </button>
      </div>

      {/* States checklist */}
      <div className="space-y-2">
        {activeRecipe.capturePlan.states.map((st) => {
          const isActive = activeCaptureStateId === st.id
          return (
            <div
              key={st.id}
              onClick={() => actions.setCaptureState(st.id)}
              className={cn(
                "rounded-md border p-3 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs",
                isActive
                  ? "border-cyan-500/40 bg-cyan-950/15"
                  : "border-stone-900 bg-stone-950/40 hover:border-stone-850"
              )}
            >
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn(
                    "text-[10px] font-bold uppercase font-mono",
                    isActive ? "text-cyan-400" : "text-stone-400"
                  )}>
                    {st.label}
                  </span>
                  {st.isSignatureFrame && (
                    <span className="inline-flex px-1 rounded text-[7.5px] font-mono border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 uppercase tracking-widest shrink-0">
                      Signature
                    </span>
                  )}
                  {st.isCapturePoint && (
                    <span className="inline-flex px-1 rounded text-[7.5px] font-mono border border-amber-800/40 bg-amber-955/20 text-amber-400 uppercase tracking-widest shrink-0">
                      Capture
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-stone-500 leading-normal">
                  {st.expectedVisualResult}
                </p>
              </div>

              <div className="font-mono text-[9px] text-stone-600 shrink-0 text-right">
                <span className="block">{st.viewport}</span>
                <span className="block mt-0.5">{st.chromeMode}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default RecipeCapturePlan
