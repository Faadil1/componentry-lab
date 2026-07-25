"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { formatEvidenceDirection, formatEvidenceStatus } from "@/lib/decisions/formatters"
import { cn } from "@/lib/utils"

export interface EvidenceLedgerProps {
  className?: string
}

const directionStyles = {
  supports: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-950/20 text-emerald-400 border-emerald-800/40",
  },
  contradicts: {
    dot: "bg-red-400",
    badge: "bg-red-950/20 text-red-400 border-red-800/40",
  },
  contextual: {
    dot: "bg-stone-400",
    badge: "bg-stone-900 text-stone-500 border-stone-850",
  },
}

export function EvidenceLedger({ className }: { className?: string }) {
  const { state, actions } = useDecisionSystem()
  const { evidence, selectedEvidenceId, excludedEvidenceIds } = state

  return (
    <div className={cn("space-y-3", className)}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Evidence Registry / Ledger
        </span>
        <button
          type="button"
          onClick={actions.includeAllEvidence}
          className="font-mono text-[9px] text-cyan-400 hover:underline hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
        >
          Include All Points
        </button>
      </div>

      {/* Ledger list */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {evidence.map((ev) => {
          const isSelected = selectedEvidenceId === ev.id
          const isExcluded = excludedEvidenceIds.includes(ev.id)
          const dirStyle = directionStyles[ev.direction] || directionStyles.contextual

          return (
            <div
              key={ev.id}
              onClick={() => actions.selectEvidence(isSelected ? null : ev.id)}
              className={cn(
                "group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border p-3.5 transition-all cursor-pointer",
                isExcluded
                  ? "border-stone-900 bg-stone-950/40 opacity-50 hover:opacity-75"
                  : isSelected
                    ? "border-cyan-500/40 bg-[#121110]"
                    : "border-stone-850 bg-[#0c0b0a] hover:border-stone-700"
              )}
            >
              {/* Status indicator line on left */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors",
                  isExcluded ? "bg-stone-800" : dirStyle.dot
                )}
              />

              {/* Main meta info */}
              <div className="flex-1 min-w-0 pl-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-200 truncate">
                    {ev.label}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono uppercase border shrink-0",
                    isExcluded ? "bg-stone-900 text-stone-600 border-stone-850" : dirStyle.badge
                  )}>
                    {isExcluded ? "Excluded" : formatEvidenceDirection(ev.direction)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 font-mono text-[9px] text-stone-600">
                  <span className="truncate">Source: {ev.source}</span>
                  <span>·</span>
                  <span>Date: {ev.date}</span>
                </div>
              </div>

              {/* Action toggles and info right */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 border-stone-900 pt-2.5 md:pt-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-stone-600">
                    Strength: <span className="text-stone-400 capitalize">{ev.strength}</span>
                  </span>
                  <span className="font-mono text-[9px] text-stone-600">
                    Status: <span className="text-stone-400">{formatEvidenceStatus(ev.status)}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    actions.toggleEvidence(ev.id)
                  }}
                  className={cn(
                    "px-2.5 py-1.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                    isExcluded
                      ? "border-stone-800 text-stone-500 bg-stone-900 hover:border-stone-700 hover:text-stone-300"
                      : "border-stone-800 text-stone-400 hover:border-red-500/40 hover:text-red-400 hover:bg-red-950/20"
                  )}
                  aria-label={isExcluded ? `Include evidence ${ev.label}` : `Exclude evidence ${ev.label}`}
                >
                  {isExcluded ? "Include" : "Exclude"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
