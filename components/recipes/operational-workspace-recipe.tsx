"use client"

import * as React from "react"
import { DecisionProvider } from "@/components/decisions/decision-provider"
import { DecisionGate } from "@/components/decisions/decision-gate"
import { SignalBand } from "@/components/decisions/signal-band"
import { EvidenceLedger } from "@/components/decisions/evidence-ledger"
import { RuleMatrix } from "@/components/decisions/rule-matrix"
import { DecisionTrace } from "@/components/decisions/decision-trace"
import { useRecipeStudio } from "./recipe-provider"

export function OperationalWorkspaceRecipe() {
  const { state } = useRecipeStudio()
  const { activeCaptureStateId } = state

  // Force exclusions depending on activeCaptureStateId to align with the plan
  const [excludedIds, setExcludedIds] = React.useState<string[]>([])

  React.useEffect(() => {
    if (activeCaptureStateId === "setup" || activeCaptureStateId === "orientation") {
      setTimeout(() => setExcludedIds([]), 0)
    } else if (activeCaptureStateId === "interaction" || activeCaptureStateId === "result" || activeCaptureStateId === "signature") {
      setTimeout(() => setExcludedIds(["rollback-simulation-evidence"]), 0)
    }
  }, [activeCaptureStateId])

  return (
    <div className="w-full h-full bg-[#0a0a09] text-stone-100 p-4 overflow-y-auto font-sans selection:bg-amber-500/20 selection:text-stone-100">
      <DecisionProvider
        initialMode="observed"
        onDecisionChange={() => {}}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-stone-850 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold">
              Operational readiness command desk
            </span>
            <span className="font-mono text-[9px] text-stone-600">
              Specimen recipe #02
            </span>
          </div>

          {/* Decisive rows */}
          <div className="grid gap-6 md:grid-cols-3 items-start">
            <div className="md:col-span-2">
              <DecisionGate />
            </div>
            
            <div className="rounded-lg border border-stone-850 bg-[#0e0d0c]/70 p-4 space-y-3">
              <span className="font-mono text-[8px] text-stone-500 uppercase tracking-widest block border-b border-stone-900 pb-1">
                Workspace controls
              </span>
              <p className="text-[11px] text-stone-400 leading-normal">
                Excluding critical verification logs in the ledger triggers the gate hold check instantly.
              </p>
              <div className="text-[10px] text-amber-400 font-mono">
                {excludedIds.includes("rollback-simulation-evidence")
                  ? "Rollback log excluded by capture plan."
                  : "All logs active in verification scope."}
              </div>
            </div>
          </div>

          {/* Telemetry signals */}
          <SignalBand />

          {/* Ledger checklist and trace */}
          <div className="grid gap-6 md:grid-cols-2">
            <EvidenceLedger />
            <RuleMatrix />
          </div>

          <DecisionTrace />
        </div>
      </DecisionProvider>
    </div>
  )
}
export default OperationalWorkspaceRecipe
