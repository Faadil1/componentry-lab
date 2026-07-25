"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { cn } from "@/lib/utils"

export interface DecisionTraceProps {
  className?: string
}

const traceStyles = {
  signal_read: {
    badge: "border-cyan-800/40 bg-cyan-950/20 text-cyan-400",
    border: "border-cyan-950",
  },
  evidence_check: {
    badge: "border-emerald-800/40 bg-emerald-950/20 text-emerald-400",
    border: "border-emerald-950",
  },
  rule_evaluated: {
    badge: "border-stone-850 bg-stone-900 text-stone-300",
    border: "border-stone-900",
  },
  outcome_produced: {
    badge: "border-purple-800/40 bg-purple-950/20 text-purple-400",
    border: "border-purple-950",
  },
  contradiction_detected: {
    badge: "border-red-800/40 bg-red-950/20 text-red-400",
    border: "border-red-950",
  },
  uncertainty_flagged: {
    badge: "border-amber-800/40 bg-amber-950/20 text-amber-400",
    border: "border-amber-950",
  },
}

export function DecisionTrace({ className }: DecisionTraceProps) {
  const { state } = useDecisionSystem()
  const { evaluation } = state
  const { trace } = evaluation
  const [detailed, setDetailed] = React.useState(false)

  if (trace.length === 0) return null

  // Compact filter: skip redundant signal reads or keep only key milestones
  const renderedTrace = detailed
    ? trace
    : trace.filter(t => t.type !== "signal_read")

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Chronological Decision Trace
        </span>
        <button
          type="button"
          onClick={() => setDetailed(!detailed)}
          className="font-mono text-[9.5px] text-cyan-400 hover:underline hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
          aria-pressed={detailed}
        >
          {detailed ? "Show Milestones" : "Show Full Execution Trace"}
        </button>
      </div>

      {/* Execution timeline log */}
      <div className="relative border-l border-stone-800 ml-3 pl-5 space-y-4">
        {renderedTrace.map((entry) => {
          const style = traceStyles[entry.type] || traceStyles.rule_evaluated

          return (
            <div key={entry.order} className="relative group">
              {/* Dot marker */}
              <div className={cn(
                "absolute -left-[25.5px] top-1.5 w-2 h-2 rounded-full border bg-[#0a0a09]",
                style.border
              )} />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-stone-600 font-bold">
                      [{String(entry.order).padStart(2, "0")}]
                    </span>
                    <span className="text-xs font-semibold text-stone-200">
                      {entry.label}
                    </span>
                    <span className={cn(
                      "inline-flex px-1.5 py-0.2 rounded text-[7.5px] font-mono border uppercase tracking-wider",
                      style.badge
                    )}>
                      {entry.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {entry.description}
                  </p>
                </div>

                <div className="text-[10px] sm:text-right shrink-0 mt-1 sm:mt-0 font-mono">
                  <span className="text-stone-600 uppercase tracking-widest block text-[8px]">Effect</span>
                  <span className="text-stone-400">{entry.effect}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
