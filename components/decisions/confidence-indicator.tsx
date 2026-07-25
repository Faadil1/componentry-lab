"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { cn } from "@/lib/utils"

export interface ConfidenceIndicatorProps {
  className?: string
}

export function ConfidenceIndicator({ className }: ConfidenceIndicatorProps) {
  const { state } = useDecisionSystem()
  const { evaluation } = state
  const { confidence, coverage, consistency, contradictions, missingEvidenceIds } = evaluation

  return (
    <div className={cn("rounded-lg border border-stone-850 bg-[#0c0b0a] p-4 space-y-4", className)}>
      <div className="flex items-center justify-between border-b border-stone-900 pb-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Confidence Anatomy & Verification
        </span>
        <span className="font-mono text-[9px] text-stone-600">
          Trace Parameters
        </span>
      </div>

      {/* Synthetic Confidence Score */}
      <div className="grid gap-4 sm:grid-cols-[100px_1fr] items-center">
        <div className="flex flex-col items-center justify-center bg-stone-950/40 rounded-lg p-3 border border-stone-900">
          <span className="font-mono text-[8px] text-stone-500 uppercase tracking-widest">Score</span>
          <span className="font-mono text-2xl font-black text-cyan-400 tabular-nums">
            {confidence}
          </span>
        </div>

        <div className="space-y-1">
          <div className="h-2 rounded bg-stone-900 overflow-hidden border border-stone-850">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="font-mono text-[9px] text-stone-600 block text-right">
            COMPLETENESS &amp; COHERENCE METRIC
          </span>
        </div>
      </div>

      {/* Diagnostic breakdown metrics */}
      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <div className="bg-stone-950/20 border border-stone-900/60 p-3 rounded-lg space-y-1">
          <div className="flex items-center justify-between font-mono text-[9px] text-stone-500 uppercase tracking-wider">
            <span>Evidence Coverage</span>
            <span className="text-stone-300 font-bold tabular-nums">{Math.round(coverage * 100)}%</span>
          </div>
          <p className="text-[10px] text-stone-500 leading-normal">
            Reflects the ratio of verified, active evidence to total requirements.
          </p>
        </div>

        <div className="bg-stone-950/20 border border-stone-900/60 p-3 rounded-lg space-y-1">
          <div className="flex items-center justify-between font-mono text-[9px] text-stone-500 uppercase tracking-wider">
            <span>Evidence Coherence</span>
            <span className="text-stone-300 font-bold tabular-nums">{Math.round(consistency * 100)}%</span>
          </div>
          <p className="text-[10px] text-stone-500 leading-normal">
            Strength-weighted consistency score of supporting vs contradictory evidence.
          </p>
        </div>
      </div>

      {/* Constraints Warning & Context */}
      <div className="border-t border-stone-900 pt-3 space-y-2">
        <p className="font-mono text-[9.5px] text-stone-600 leading-normal">
          • Contradictions active: <span className="text-stone-400 font-mono font-bold">{contradictions.length}</span>
        </p>
        <p className="font-mono text-[9.5px] text-stone-600 leading-normal">
          • Missing parameters: <span className="text-stone-400 font-mono font-bold">{missingEvidenceIds.length}</span>
        </p>

        <div className="rounded border border-stone-900 bg-stone-950/30 p-2.5">
          <p className="font-mono text-[9px] text-stone-500 leading-relaxed text-center">
            &ldquo;This score reflects evidence completeness and consistency, not predictive certainty.&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}
