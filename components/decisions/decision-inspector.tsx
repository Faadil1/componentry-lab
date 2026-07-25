"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { cn } from "@/lib/utils"

export interface DecisionInspectorProps {
  className?: string
}

export function DecisionInspector({ className }: DecisionInspectorProps) {
  const { state } = useDecisionSystem()
  const [visible, setVisible] = React.useState(true)

  const {
    activeScenario,
    mode,
    evaluation,
    selectedSignalId,
    selectedEvidenceId,
    selectedRuleId,
    thresholdOverrides,
    excludedEvidenceIds,
  } = state

  const {
    outcome,
    status,
    confidence,
    coverage,
    consistency,
    ruleResults,
    missingEvidenceIds,
    contradictions,
  } = evaluation

  const passedCount = Object.values(ruleResults).filter(v => v === "pass").length
  const failedCount = Object.values(ruleResults).filter(v => v === "fail").length
  const unresolvedCount = Object.values(ruleResults).filter(v => v === "unknown").length

  const rows: Array<{ label: string; value: string }> = [
    { label: "Scenario ID", value: activeScenario.id },
    { label: "Simulation Mode", value: mode },
    { label: "Final Outcome", value: outcome.toUpperCase() },
    { label: "Decision Status", value: status.toUpperCase() },
    { label: "Confidence Score", value: `${confidence}%` },
    { label: "Evidence Coverage", value: `${Math.round(coverage * 100)}%` },
    { label: "Evidence Consistency", value: `${Math.round(consistency * 100)}%` },
    { label: "Rules Passed", value: String(passedCount) },
    { label: "Rules Failed", value: String(failedCount) },
    { label: "Rules Unresolved", value: String(unresolvedCount) },
    { label: "Contradictions Count", value: String(contradictions.length) },
    { label: "Missing Evidence Count", value: String(missingEvidenceIds.length) },
    { label: "Excluded Evidence Count", value: String(excludedEvidenceIds.length) },
    { label: "Selected Signal ID", value: selectedSignalId ?? "—" },
    { label: "Selected Evidence ID", value: selectedEvidenceId ?? "—" },
    { label: "Selected Rule ID", value: selectedRuleId ?? "—" },
    { label: "Threshold Overrides", value: Object.keys(thresholdOverrides).length > 0 ? Object.keys(thresholdOverrides).join(", ") : "None" },
  ]

  return (
    <div className={cn("rounded-lg border border-stone-800 bg-[#0e0d0c] overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="flex items-center justify-between w-full px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-inset"
        aria-expanded={visible}
        aria-label="Toggle decision inspector"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Decision System Inspector
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
              <span className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">
                {row.label}
              </span>
              <span className="font-mono text-[11px] text-stone-200 tabular-nums text-right">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
