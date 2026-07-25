"use client"

// ─────────────────────────────────────────────────────────────
// Data & Decision Components — Workbench Orchestration
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import { DecisionProvider } from "./decision-provider"
import { SignalBand } from "./signal-band"
import { EvidenceLedger } from "./evidence-ledger"
import { RuleMatrix } from "./rule-matrix"
import { DecisionGate } from "./decision-gate"
import { DecisionTrace } from "./decision-trace"
import { ConfidenceIndicator } from "./confidence-indicator"
import { ThresholdControl } from "./threshold-control"
import { ScenarioSwitcher } from "./scenario-switcher"
import { DecisionInspector } from "./decision-inspector"
import { DecisionTokenExport } from "./decision-token-export"
import type { DecisionScenario, DecisionMode, DecisionEvaluation } from "@/lib/decisions/types"
import { cn } from "@/lib/utils"

export interface DecisionWorkbenchProps {
  scenario?: DecisionScenario
  initialMode?: DecisionMode
  showInspector?: boolean
  showTrace?: boolean
  showControls?: boolean
  showExport?: boolean
  className?: string
  onDecisionChange?: (evaluation: DecisionEvaluation) => void
}

function WorkbenchContent({
  showInspector,
  showTrace,
  showControls,
  showExport,
}: {
  showInspector: boolean
  showTrace: boolean
  showControls: boolean
  showExport: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Scenario select controls */}
      {showControls && <ScenarioSwitcher />}

      {/* Main specimen row: Decision Gate + Indicators */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DecisionGate />
        </div>
        <div>
          <ConfidenceIndicator className="h-full" />
        </div>
      </div>

      {/* Threshold controls */}
      {showControls && <ThresholdControl />}

      {/* Signal Observation Band */}
      <SignalBand />

      {/* Evidence Ledger & Rules Validation */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EvidenceLedger />
        <RuleMatrix />
      </div>

      {/* Trace Log execution */}
      {showTrace && <DecisionTrace />}

      {/* Inspector Details */}
      {showInspector && <DecisionInspector />}

      {/* Config exports */}
      {showExport && <DecisionTokenExport />}
    </div>
  )
}

export function DecisionWorkbench({
  scenario,
  initialMode = "observed",
  showInspector = false,
  showTrace = true,
  showControls = true,
  showExport = false,
  className,
  onDecisionChange,
}: DecisionWorkbenchProps) {
  return (
    <DecisionProvider
      scenario={scenario}
      initialMode={initialMode}
      onDecisionChange={onDecisionChange}
    >
      <div className={cn("space-y-6", className)}>
        <WorkbenchContent
          showInspector={showInspector}
          showTrace={showTrace}
          showControls={showControls}
          showExport={showExport}
        />
      </div>
    </DecisionProvider>
  )
}
export default DecisionWorkbench
