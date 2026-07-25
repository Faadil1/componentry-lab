"use client"

import * as React from "react"
import { useRecipeStudio } from "./recipe-provider"
import { cn } from "@/lib/utils"

export function ProductLaunchRecipe() {
  const { state } = useRecipeStudio()
  const { activeCaptureStateId } = state
  const [clicked, setClicked] = React.useState(false)

  React.useEffect(() => {
    if (activeCaptureStateId === "setup" || activeCaptureStateId === "orientation") {
      setTimeout(() => setClicked(false), 0)
    } else if (activeCaptureStateId === "result" || activeCaptureStateId === "signature") {
      setTimeout(() => setClicked(true), 0)
    }
  }, [activeCaptureStateId])

  const showBorders = activeCaptureStateId !== "setup"
  const showCTA = activeCaptureStateId !== "setup" && activeCaptureStateId !== "orientation"
  const showLogs = clicked || activeCaptureStateId === "result" || activeCaptureStateId === "signature"

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#0a0a09] text-stone-100 p-6 selection:bg-cyan-500/20 selection:text-stone-100 font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Top quiet header */}
        <div className="flex justify-between items-center border-b border-stone-850 pb-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-stone-500 font-bold">
            Project Catalyst
          </span>
          <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase">
            v1.0.0
          </span>
        </div>

        {/* Headline statement */}
        <div className="space-y-2 text-left">
          <h2 className="text-2xl font-black tracking-tight text-stone-100 leading-none Outfit">
            Coordinate without noise.
          </h2>
          <p className="text-xs text-stone-400 leading-relaxed Inter">
            A quiet workspace built to evaluate team operations logs, expose missing parameters, and resolve gate criteria deterministically.
          </p>
        </div>

        {/* Dashboard stage mockup container */}
        <div className={cn(
          "rounded-xl border p-5 transition-all duration-500 text-left relative overflow-hidden",
          showBorders ? "border-cyan-500/20 bg-[#0e0d0c]/80 shadow-md shadow-cyan-500/5" : "border-stone-900 bg-stone-950/40 opacity-40"
        )}>
          {/* Spotlight background effect */}
          {showBorders && (
            <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 to-transparent pointer-events-none" />
          )}

          <div className="space-y-4 relative z-10">
            <span className="font-mono text-[8px] text-stone-500 uppercase tracking-widest block border-b border-stone-900 pb-1.5">
              Active Session Queue
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-stone-950/50 border border-stone-900">
                <span className="text-stone-400">CI Pipeline Coverage</span>
                <span className="font-mono text-stone-200">98.4%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-stone-950/50 border border-stone-900">
                <span className="text-stone-400">Active Defects Ticket</span>
                <span className="font-mono text-stone-200">0</span>
              </div>
            </div>

            {/* CTA action button */}
            {showCTA && (
              <button
                type="button"
                onClick={() => setClicked(!clicked)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                  clicked
                    ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400"
                    : "border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40"
                )}
              >
                {clicked ? "Verification Executed" : "Execute Gate Check"}
              </button>
            )}

            {/* Simulated output log console */}
            {showLogs && (
              <div className="font-mono text-[9px] text-stone-500 bg-stone-950/70 p-3 rounded border border-stone-900 space-y-1 mt-3 animate-fade-in">
                <span className="text-cyan-400 block mb-1">Execution Status:</span>
                <p>&gt; pipeline_run_id: #842</p>
                <p>&gt; check_rules_passed: TRUE</p>
                <p className="text-emerald-400">&gt; candidate_gate_cleared: APPROVED</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer memory hook */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-stone-600 font-mono italic">
            &ldquo;Show the product before explaining the product.&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}
export default ProductLaunchRecipe
