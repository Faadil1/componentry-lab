"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { formatRuleStatus, formatOperator } from "@/lib/decisions/formatters"
import { cn } from "@/lib/utils"

export interface RuleMatrixProps {
  className?: string
}

const statusColors = {
  pass: "bg-emerald-950/20 text-emerald-400 border-emerald-800/40",
  fail: "bg-red-950/20 text-red-400 border-red-800/40",
  unknown: "bg-stone-900 text-stone-600 border-stone-850",
  skipped: "bg-stone-950/40 text-stone-500 border-stone-900",
}

export function RuleMatrix({ className }: RuleMatrixProps) {
  const { state, actions } = useDecisionSystem()
  const { rules, evaluation, signals, selectedRuleId, thresholdOverrides } = state
  const { ruleResults } = evaluation

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Evaluation Rule Matrix
        </span>
        <span className="font-mono text-[9px] text-stone-600">
          Deterministic Validation Gates
        </span>
      </div>

      {/* Grid wrapper for responsive matrix */}
      <div className="space-y-2">
        {rules.map((rule) => {
          const status = ruleResults[rule.id] || "unknown"
          const isSelected = selectedRuleId === rule.id
          const colorClass = statusColors[status] || statusColors.unknown

          // Get the observed signal value
          const signal = signals.find((s) => s.id === rule.condition.signalId)
          const observedValue = signal?.value ?? "—"
          const unit = signal?.unit ?? ""

          // Configured threshold
          const thresholdValue = rule.condition.signalId in thresholdOverrides
            ? thresholdOverrides[rule.condition.signalId]
            : rule.condition.value

          return (
            <button
              key={rule.id}
              type="button"
              onClick={() => actions.selectRule(isSelected ? null : rule.id)}
              className={cn(
                "w-full flex flex-col text-left rounded-lg border p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                isSelected
                  ? "border-cyan-500/40 bg-[#121110]"
                  : "border-stone-850 bg-[#0c0b0a] hover:border-stone-700"
              )}
              aria-pressed={isSelected}
              aria-label={`Rule: ${rule.label}. Status: ${formatRuleStatus(status)}`}
            >
              {/* Desktop & Laptop layout header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-stone-300">
                    {rule.label}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider border shrink-0",
                    colorClass
                  )}>
                    {formatRuleStatus(status)}
                  </span>
                </div>

                {/* Score weights */}
                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                  <span className="font-mono text-[9px] text-stone-600">
                    Impact: <span className="text-stone-400 font-bold">{rule.weight}x</span>
                  </span>
                </div>
              </div>

              {/* Formula specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-3.5 pt-3.5 border-t border-stone-900 text-xs">
                <div>
                  <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-1">
                    Telemetry Key
                  </span>
                  <span className="font-mono text-stone-300 truncate block">
                    {rule.condition.signalId}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-1">
                    Constraint
                  </span>
                  <span className="font-mono text-stone-300 block">
                    {formatOperator(rule.condition.operator)} {thresholdValue}
                    {unit}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-1">
                    Observed
                  </span>
                  <span className="font-mono text-stone-100 font-bold tabular-nums block">
                    {observedValue}
                    {observedValue !== "—" ? unit : ""}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-1">
                    Required Fix
                  </span>
                  <span className="text-stone-400 block truncate">
                    {rule.changeConditionDescription}
                  </span>
                </div>
              </div>

              {/* Extra details (Desktop only/Selected) */}
              {isSelected && (
                <div className="w-full mt-4 pt-3.5 border-t border-stone-900 space-y-2 text-xs">
                  <div>
                    <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-1">
                      Consequence on Failure
                    </span>
                    <p className="text-stone-300 leading-relaxed">{rule.consequence}</p>
                  </div>

                  {rule.affectedEvidenceIds.length > 0 && (
                    <div>
                      <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block mb-1">
                        Supporting Evidence Files
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {rule.affectedEvidenceIds.map((evId) => (
                          <span
                            key={evId}
                            className="inline-flex rounded-md bg-stone-900 border border-stone-850 px-2 py-0.5 font-mono text-[9px] text-stone-400"
                          >
                            {evId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
