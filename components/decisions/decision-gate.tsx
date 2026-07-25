"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { formatOutcome, formatStatus } from "@/lib/decisions/formatters"
import { getDecisionChangeConditions } from "@/lib/decisions/evaluator"
import { cn } from "@/lib/utils"

export interface DecisionGateProps {
  className?: string
}

const outcomeConfigs = {
  proceed: {
    label: "Proceed",
    bg: "bg-[#091b14] border-emerald-500/30 text-emerald-400",
    pill: "bg-emerald-500/20 text-emerald-400 border-emerald-800/40",
    dot: "bg-emerald-400",
    border: "border-emerald-500/25",
    desc: "Deployment pipeline cleared. Candidate matches all validation gates.",
  },
  hold: {
    label: "Hold",
    bg: "bg-[#1f190e] border-amber-500/30 text-amber-400",
    pill: "bg-amber-500/20 text-amber-400 border-amber-800/40",
    dot: "bg-amber-400",
    border: "border-amber-500/25",
    desc: "Verification hold triggered. Active contradictions or missing audit files.",
  },
  review: {
    label: "Review",
    bg: "bg-[#121b24] border-cyan-500/30 text-cyan-400",
    pill: "bg-cyan-500/20 text-cyan-400 border-cyan-800/40",
    dot: "bg-cyan-400",
    border: "border-cyan-500/25",
    desc: "Escalated for manual review. Check warning rules or threshold deviations.",
  },
  reject: {
    label: "Reject",
    bg: "bg-[#240c0c] border-red-500/30 text-red-400",
    pill: "bg-red-500/20 text-red-400 border-red-800/40",
    dot: "bg-red-400",
    border: "border-red-500/25",
    desc: "Candidate rejected. High severity rules failed during execution.",
  },
  "insufficient-evidence": {
    label: "Insufficient Evidence",
    bg: "bg-[#18181b] border-stone-700 text-stone-300",
    pill: "bg-stone-800 text-stone-400 border-stone-850",
    dot: "bg-stone-500",
    border: "border-stone-800",
    desc: "Incomplete validation ledger. Required verification log is missing or excluded.",
  },
}

export function DecisionGate({ className }: DecisionGateProps) {
  const { state } = useDecisionSystem()
  const { activeScenario, rules, evaluation } = state
  const { outcome, status, confidence, ruleResults, missingEvidenceIds, contradictions } = evaluation

  const currentConfig = outcomeConfigs[outcome as keyof typeof outcomeConfigs] || outcomeConfigs["insufficient-evidence"]

  // Calculate stats
  const totalRules = rules.length
  const passedRules = rules.filter(r => ruleResults[r.id] === "pass").length
  const failedRules = rules.filter(r => ruleResults[r.id] === "fail").length
  const skippedRules = rules.filter(r => ruleResults[r.id] === "skipped").length
  const unknownRules = rules.filter(r => ruleResults[r.id] === "unknown").length

  // Change conditions list
  const changeConditions = React.useMemo(() => {
    return getDecisionChangeConditions(outcome, rules, ruleResults, missingEvidenceIds, contradictions)
  }, [outcome, rules, ruleResults, missingEvidenceIds, contradictions])

  // Get active scenario mapping recommendation
  const mappingKey = `${outcome}:${status}`
  const scenarioConfig = activeScenario.outcomeMapping[mappingKey]
  const recommendation = scenarioConfig?.recommendation ?? currentConfig.desc

  return (
    <div
      className={cn(
        "rounded-xl border p-6 space-y-6 transition-all duration-300",
        currentConfig.bg,
        className
      )}
      role="region"
      aria-label="Decision evaluation gate"
      aria-live="polite"
    >
      {/* Primary result header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-stone-500 block mb-1">
            Gate Outcome
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
            {formatOutcome(outcome)}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border",
            currentConfig.pill
          )}>
            <span className={cn("w-2 h-2 rounded-full shrink-0", currentConfig.dot)} />
            {formatStatus(status)}
          </span>

          <div className="bg-stone-950/40 rounded-lg px-3.5 py-1.5 border border-stone-850 flex flex-col items-center shrink-0">
            <span className="font-mono text-[8px] text-stone-500 uppercase tracking-widest block">
              Confidence
            </span>
            <span className="font-mono text-sm font-bold text-stone-100 tabular-nums">
              {confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Decision rationale statement */}
      <div className="bg-stone-950/30 rounded-lg p-4 border border-stone-900/40 text-sm leading-relaxed space-y-2">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block">
          Recommendation
        </span>
        <p className="text-stone-200 font-medium">
          {recommendation}
        </p>
      </div>

      {/* Grid of validation items */}
      <div className="grid gap-4 sm:grid-cols-2 text-xs">
        {/* Rules resolved breakdown */}
        <div className="space-y-2">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block">
            Rules Resolved ({passedRules}/{totalRules})
          </span>
          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="bg-stone-950/20 border border-stone-900/40 p-2 rounded-md">
              <span className="text-[10px] text-stone-500 block">PASSED</span>
              <span className="text-sm font-bold text-emerald-400 tabular-nums">{passedRules}</span>
            </div>
            <div className="bg-stone-950/20 border border-stone-900/40 p-2 rounded-md">
              <span className="text-[10px] text-stone-500 block">FAILED</span>
              <span className="text-sm font-bold text-red-400 tabular-nums">{failedRules}</span>
            </div>
            <div className="bg-stone-950/20 border border-stone-900/40 p-2 rounded-md">
              <span className="text-[10px] text-stone-500 block">SKIPPED</span>
              <span className="text-sm font-bold text-stone-400 tabular-nums">{skippedRules}</span>
            </div>
            <div className="bg-stone-950/20 border border-stone-900/40 p-2 rounded-md">
              <span className="text-[10px] text-stone-500 block">UNRESOLVED</span>
              <span className="text-sm font-bold text-amber-400 tabular-nums">{unknownRules}</span>
            </div>
          </div>
        </div>

        {/* Dynamic conditions to change decision */}
        <div className="space-y-2">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block">
            Transition Checklist
          </span>
          <div className="bg-stone-950/20 border border-stone-900/40 rounded-lg p-3 space-y-2 max-h-[120px] overflow-y-auto">
            {changeConditions.length > 0 ? (
              changeConditions.map((cond, i) => (
                <div key={i} className="flex gap-2 text-stone-300 leading-normal">
                  <span className="text-cyan-400 font-bold shrink-0">•</span>
                  <p>{cond}</p>
                </div>
              ))
            ) : (
              <p className="text-stone-500 font-mono italic">No conditions to transition.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
