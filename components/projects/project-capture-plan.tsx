"use client"

// ─────────────────────────────────────────────────────────────
// Project Capture Plan — Scripted key states timeline
// ─────────────────────────────────────────────────────────────

import { useState } from "react"
import { useProjectBrain } from "./project-provider"
import { cn } from "@/lib/utils"

export function ProjectCapturePlan() {
  const { state } = useProjectBrain()
  const { activeProject } = state
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!activeProject || activeProject.capturePlan.states.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No capture states mapped for this project.
      </div>
    )
  }

  const copyRestoreUrl = async (stateId: string, idx: number) => {
    // Find URL preset
    const restoreUrl = activeProject.restoreUrls[stateId] || `${activeProject.cleanViewRoute}&state=${stateId}`
    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${restoreUrl}` : restoreUrl
    await navigator.clipboard.writeText(fullUrl)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-4 text-left">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Capture States Timeline
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Scripted capture sequence coordinates. Signature frame: {activeProject.signatureStateId} (Frame {activeProject.signatureFrame}).
        </p>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {activeProject.capturePlan.states.map((st, idx) => {
          const isSignature = st.id === activeProject.signatureStateId
          const hasRestoreUrl = !!activeProject.restoreUrls[st.id]

          return (
            <div
              key={st.id}
              className={cn(
                "rounded border p-4 space-y-3 bg-white transition",
                isSignature ? "border-cyan-500 ring-1 ring-cyan-500/20" : "border-stone-200"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-[8px] text-stone-400 uppercase block">
                    State ID: {st.id} · type: {st.stateType}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-neutral-950 uppercase">
                      {st.label}
                    </span>
                    {isSignature && (
                      <span className="font-mono text-[8px] bg-cyan-950 text-cyan-200 border border-cyan-800 px-1 py-0.2 rounded-sm uppercase tracking-wide">
                        Signature state
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[9px] text-stone-500 tabular-nums">
                  frame: {st.frame} ({st.time}s)
                </span>
              </div>

              {/* Expected visual outcome */}
              {st.expectedVisualResult && (
                <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed border-l-2 border-stone-200 pl-2.5">
                  {st.expectedVisualResult}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2.5">
                <span className="font-mono text-[9px] text-stone-400 uppercase">
                  viewport: laptop (1280x720)
                </span>

                {hasRestoreUrl && (
                  <button
                    type="button"
                    onClick={() => copyRestoreUrl(st.id, idx)}
                    className="inline-flex h-6 items-center gap-1 rounded border border-stone-250 bg-white px-2 font-mono text-[9px] text-stone-500 transition hover:border-neutral-950 hover:text-neutral-950"
                  >
                    {copiedIndex === idx ? "✓ Copied" : "Copy Restore URL"}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default ProjectCapturePlan
