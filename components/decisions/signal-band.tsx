"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { formatSignalStatus } from "@/lib/decisions/formatters"
import { cn } from "@/lib/utils"

export interface SignalBandProps {
  density?: "compact" | "standard"
  className?: string
}

const statusSymbols = {
  normal: "✓",
  warning: "▲",
  critical: "✗",
  unknown: "?",
}

const statusBgColors = {
  normal: "bg-emerald-950/20 text-emerald-400 border-emerald-800/40",
  warning: "bg-amber-950/20 text-amber-400 border-amber-800/40",
  critical: "bg-red-950/20 text-red-400 border-red-800/40",
  unknown: "bg-stone-900 text-stone-500 border-stone-850",
}

export function SignalBand({ density = "standard", className }: SignalBandProps) {
  const { state, actions } = useDecisionSystem()
  const { signals, selectedSignalId, rules } = state

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Signal Observation Band
        </span>
        <span className="font-mono text-[9px] text-stone-600">
          Telemetry Source Points
        </span>
      </div>

      <div className="grid gap-2 lg:grid-cols-4">
        {signals.map((sig) => {
          const isSelected = selectedSignalId === sig.id
          const isUnknown = sig.value === null || sig.value === undefined
          const status = sig.status
          const symbol = statusSymbols[status] || "?"
          const colorClass = statusBgColors[status] || statusBgColors.unknown

          // Find rules that are mapped to this signal
          const matchedRules = rules.filter(r => r.condition.signalId === sig.id)

          return (
            <button
              key={sig.id}
              type="button"
              onClick={() => actions.selectSignal(isSelected ? null : sig.id)}
              className={cn(
                "flex flex-col text-left rounded-lg border p-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                isSelected
                  ? "border-cyan-500/40 bg-[#121110] shadow-sm shadow-cyan-500/5"
                  : "border-stone-800 bg-[#0e0d0c] hover:border-stone-700",
                density === "compact" ? "p-2.5 space-y-1.5" : "space-y-3"
              )}
              aria-pressed={isSelected}
              aria-label={`Signal ${sig.label}: current value ${isUnknown ? "unknown" : `${sig.value}${sig.unit || ""}`}, status ${formatSignalStatus(status)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between w-full gap-2">
                <span className="font-mono text-[10px] text-stone-500 uppercase tracking-wider truncate">
                  {sig.source}
                </span>
                <span className="font-mono text-[9px] text-stone-600 shrink-0">
                  {sig.timestamp}
                </span>
              </div>

              {/* Title & Value */}
              <div>
                <span className="text-xs font-semibold text-stone-300 block truncate">
                  {sig.label}
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={cn(
                    "font-mono text-lg font-bold tracking-tight tabular-nums",
                    isUnknown ? "text-stone-600" : "text-stone-100"
                  )}>
                    {isUnknown ? "NULL" : String(sig.value)}
                  </span>
                  {sig.unit && !isUnknown && (
                    <span className="font-mono text-[10px] text-stone-500">{sig.unit}</span>
                  )}
                </div>
              </div>

              {/* Threshold info / metadata */}
              {sig.thresholdsDescription && density === "standard" && (
                <div className="text-[10px] text-stone-500 font-mono italic truncate w-full">
                  {sig.thresholdsDescription}
                </div>
              )}

              {/* Footer status pill & rules mapping */}
              <div className="flex items-center justify-between w-full pt-1 border-t border-stone-900">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border",
                  colorClass
                )}>
                  <span>{symbol}</span>
                  <span>{formatSignalStatus(status)}</span>
                </span>

                {matchedRules.length > 0 && (
                  <span className="font-mono text-[9px] text-stone-600">
                    {matchedRules.length} {matchedRules.length === 1 ? "rule" : "rules"}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
