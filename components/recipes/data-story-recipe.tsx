"use client"

import * as React from "react"
import { useRecipeStudio } from "./recipe-provider"
import { cn } from "@/lib/utils"

export function DataStoryRecipe() {
  const { state } = useRecipeStudio()
  const { activeCaptureStateId } = state

  // Map narrative steps
  const showAnomaly = activeCaptureStateId !== "setup"
  const highlightIssue = activeCaptureStateId === "interaction" || activeCaptureStateId === "result" || activeCaptureStateId === "signature"
  const showConclusion = activeCaptureStateId === "result" || activeCaptureStateId === "signature"

  return (
    <div className="w-full h-full bg-[#fbfaf6] text-neutral-900 p-6 md:p-10 overflow-y-auto font-sans selection:bg-[#c2410c]/20 selection:text-neutral-900">
      <div className="max-w-[65ch] mx-auto space-y-8">
        
        {/* Editorial header */}
        <div className="border-b border-stone-300 pb-3 flex justify-between items-center text-stone-500 font-mono text-[10px]">
          <span>EDITORIAL INQUIRY / CASE REPORT</span>
          <span>JULY 2026</span>
        </div>

        {/* Article title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 Outfit leading-[1.1]">
            Why the main metric fails to report risk.
          </h1>
          <p className="text-sm text-stone-600 italic Inter">
            A review of automated gates and critical anomalies. Written by systems validation crew.
          </p>
        </div>

        {/* Main narrative block */}
        <div className="space-y-4 text-sm leading-relaxed text-stone-800 Inter">
          <p>
            When assessing release readiness, teams often rely on aggregated pass rates. A dashboard displaying a <strong className="text-neutral-950 font-bold">98.4% success metric</strong> seems to suggest that deployment should proceed immediately.
          </p>

          {/* Anomaly visualization card */}
          {showAnomaly && (
            <div className={cn(
              "rounded-lg border p-4 my-6 transition-all duration-300",
              highlightIssue ? "border-[#c2410c]/30 bg-[#fffbeb]" : "border-stone-200 bg-[#fbfbfb]"
            )}>
              <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block mb-2">Telemetry Deviation</span>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span>sonar_warnings_count</span>
                  <span className={cn("font-bold", highlightIssue ? "text-[#c2410c]" : "text-stone-700")}>
                    48 / limit 15
                  </span>
                </div>
                
                {/* SVG Mini Meter */}
                <div className="h-2 rounded bg-stone-200 overflow-hidden relative">
                  <div
                    className={cn("h-full transition-all duration-500", highlightIssue ? "bg-[#c2410c]" : "bg-stone-500")}
                    style={{ width: highlightIssue ? "100%" : "30%" }}
                  />
                </div>
                <p className="text-[10px] text-stone-500">
                  {highlightIssue
                    ? "Warning threshold is breached. Static application security analysis shows 48 warnings in compilation scope."
                    : "Telemetry shows normal variance bounds."}
                </p>
              </div>
            </div>
          )}

          <p>
            However, this aggregate pass rate hides a critical detail. While 98% of checks are green, the remaining 2% represents a complete lack of rollback procedures logs verification.
          </p>

          {/* Signature interpretation view */}
          {highlightIssue && (
            <blockquote className="border-l-4 border-[#c2410c] pl-4 italic text-stone-700 my-4">
              &ldquo;A metric is not a decision. A high score cannot compensate for missing core verification logs.&rdquo;
            </blockquote>
          )}

          {/* Final conclusion */}
          {showConclusion && (
            <div className="rounded-lg border border-stone-200 bg-[#fbfbfb] p-4 text-xs space-y-3">
              <span className="font-mono text-[9px] text-[#c2410c] uppercase tracking-widest block font-bold">Conclusion Gate</span>
              <p className="text-stone-700">
                The gate status was resolved to <strong className="text-neutral-950 font-bold uppercase">HOLD</strong>. Manual intervention is required to re-establish the rollback simulations logs before deployment is authorized.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 pt-4 text-center">
          <p className="font-mono text-[9.5px] text-stone-500 italic">
            &ldquo;Data becomes useful when the sequence explains the change.&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}
export default DataStoryRecipe
