"use client"

// ─────────────────────────────────────────────────────────────
// Project Decisions Section — Decision Ledger with immutability
// ─────────────────────────────────────────────────────────────

import { useState } from "react"
import { useProjectBrain } from "./project-provider"
import type { DecisionStatus } from "@/lib/projects/types"
import { cn } from "@/lib/utils"

export function ProjectDecisions() {
  const { state, actions } = useProjectBrain()
  const { activeProject, activeItemId } = state
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | "all">("all")

  if (!activeProject || activeProject.decisions.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No decisions recorded in this project ledger.
      </div>
    )
  }

  // Filter logic
  const filtered = activeProject.decisions.filter((d) => {
    if (statusFilter === "all") return true
    return d.status === statusFilter
  })

  const getStatusColor = (status: DecisionStatus) => {
    switch (status) {
      case "approved":
        return "border-emerald-800/30 bg-emerald-950/10 text-emerald-700 font-bold"
      case "superseded":
        return "border-stone-300 bg-stone-100 text-stone-500 line-through"
      case "rejected":
        return "border-red-800/30 bg-red-950/10 text-red-700"
      case "deferred":
        return "border-amber-800/30 bg-amber-950/10 text-amber-600"
      default:
        return "border-stone-250 bg-white text-stone-600"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "text-red-600 font-bold"
      case "high":
        return "text-orange-500"
      case "medium":
        return "text-amber-500"
      default:
        return "text-stone-400"
    }
  }

  return (
    <div className="space-y-4 text-left">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Decisions Ledger
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Traceable decision records. Superseded decisions are preserved for context.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-3" role="toolbar" aria-label="Decision ledger status filter">
        {(["all", "approved", "superseded", "proposed", "rejected", "deferred"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              "rounded px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide transition border",
              statusFilter === status
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-stone-250 bg-white text-stone-500 hover:border-neutral-500 hover:text-neutral-950"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.map((dec) => {
          const isSelected = activeItemId === dec.id
          return (
            <div
              key={dec.id}
              onClick={() => actions.selectItem(isSelected ? null : dec.id)}
              className={cn(
                "rounded border p-4 space-y-3 cursor-pointer transition text-left",
                isSelected
                  ? "border-neutral-950 bg-[#fafafa] shadow-xs"
                  : "border-stone-200 bg-white hover:border-stone-400"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-[8px] text-stone-400 uppercase block">
                    ID: {dec.id} · phase: {dec.phase}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-neutral-950 uppercase">
                    {dec.label}
                  </span>
                </div>
                <span className={cn(
                  "font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border",
                  getStatusColor(dec.status)
                )}>
                  {dec.status}
                </span>
              </div>

              {/* Description */}
              <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed">
                {dec.description}
              </p>

              {/* Rationale and considered alternatives */}
              {isSelected && (
                <div className="border-t border-stone-200 pt-3 space-y-3 animate-fade-in">
                  <div className="space-y-1">
                    <span className="font-mono text-[8px] text-stone-400 uppercase block font-semibold">
                      Rationale / Decision context
                    </span>
                    <p className="font-mono text-[10.5px] text-stone-700 italic leading-relaxed">
                      {dec.rationale}
                    </p>
                  </div>

                  {dec.alternativesConsidered.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] text-stone-400 uppercase block font-semibold">
                        Alternatives Considered
                      </span>
                      <ul className="list-disc pl-3 font-mono text-[10px] text-stone-500 space-y-0.5">
                        {dec.alternativesConsidered.map((alt, i) => (
                          <li key={i}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Meta stats */}
                  <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-2.5 font-mono text-[9px] text-stone-400 uppercase">
                    <div>
                      Reversible: <span className="font-semibold text-neutral-800">{dec.reversible ? "Yes" : "No"}</span>
                    </div>
                    <div>
                      Impact: <span className={cn("font-semibold", getImpactColor(dec.impact))}>{dec.impact}</span>
                    </div>
                    {dec.supersedes && (
                      <div className="col-span-2">
                        Supersedes: <span className="font-semibold text-neutral-800">{dec.supersedes}</span>
                      </div>
                    )}
                    {dec.supersededBy && (
                      <div className="col-span-2">
                        Superseded by: <span className="font-semibold text-neutral-800">{dec.supersededBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default ProjectDecisions
