"use client"

// ─────────────────────────────────────────────────────────────
// Project Evidence Section — Verification and proofs
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import { cn } from "@/lib/utils"

export function ProjectEvidence() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject || activeProject.evidence.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No technical evidence registered.
      </div>
    )
  }

  const getStrengthStyle = (strength: string) => {
    switch (strength) {
      case "direct":
        return "border-emerald-800/30 bg-emerald-950/10 text-emerald-700 font-bold"
      case "supporting":
        return "border-cyan-800/30 bg-cyan-950/10 text-cyan-700"
      case "contextual":
        return "border-stone-300 bg-stone-100 text-stone-500"
      default:
        return "border-amber-800/30 bg-amber-950/10 text-amber-700 font-semibold"
    }
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Evidence Board
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Verifiable facts, screenshots, or logs backing technical claims.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeProject.evidence.map((ev) => (
          <div
            key={ev.id}
            className="rounded border border-stone-200 bg-white p-4 space-y-3"
          >
            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-mono text-[8px] text-stone-400 uppercase block">
                  ID: {ev.id} · Type: {ev.type}
                </span>
                <span className="font-mono text-[11px] font-bold text-neutral-950 uppercase">
                  {ev.label}
                </span>
              </div>
              <span className={cn(
                "font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border",
                getStrengthStyle(ev.strength)
              )}>
                {ev.strength} proof
              </span>
            </div>

            {/* Claims supported */}
            <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed">
              <span className="font-semibold text-neutral-800">Claim:</span> &ldquo;{ev.claimSupported}&rdquo;
            </p>

            {/* Location or references */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-stone-100 pt-2.5 font-mono text-[9px] text-stone-400 uppercase">
              <div>
                Location: <span className="font-semibold text-neutral-800 lowercase break-all">{ev.routeOrFile}</span>
              </div>
              <div>
                Source: <span className="font-semibold text-neutral-850">{ev.source}</span>
              </div>
              {ev.limitation && (
                <div className="col-span-2 text-amber-600 italic">
                  Limitation: {ev.limitation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProjectEvidence
