"use client"

// ─────────────────────────────────────────────────────────────
// Data & Decision Components — Provider & Context
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import type {
  DecisionContext,
  DecisionScenario,
  DecisionMode,
  DecisionEvaluation,
  DecisionSnapshot,
} from "@/lib/decisions/types"
import { evaluateScenario } from "@/lib/decisions/evaluator"
import { decisionPresets } from "@/lib/decisions/presets"

const DecisionContextObj = React.createContext<DecisionContext | null>(null)

export function useDecisionSystem(): DecisionContext {
  const ctx = React.useContext(DecisionContextObj)
  if (!ctx) {
    throw new Error(
      "useDecisionSystem must be used within a <DecisionProvider>. " +
      "Wrap your component tree with <DecisionProvider> or <DecisionWorkbench>."
    )
  }
  return ctx
}

export interface DecisionProviderProps {
  scenario?: DecisionScenario
  initialMode?: DecisionMode
  children: React.ReactNode
  onDecisionChange?: (evaluation: DecisionEvaluation) => void
}

export function DecisionProvider({
  scenario = decisionPresets.releaseReadiness,
  initialMode = "observed",
  children,
  onDecisionChange,
}: DecisionProviderProps) {
  const [activeScenario, setActiveScenario] = React.useState<DecisionScenario>(scenario)
  const [mode, setMode] = React.useState<DecisionMode>(initialMode)
  const [selectedSignalId, setSelectedSignalId] = React.useState<string | null>(null)
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null)
  const [selectedRuleId, setSelectedRuleId] = React.useState<string | null>(null)
  const [thresholdOverrides, setThresholdOverrides] = React.useState<Record<string, number>>({})
  const [excludedEvidenceIds, setExcludedEvidenceIds] = React.useState<string[]>([])

  // Get base signals and evidence for current mode
  const modeData = React.useMemo(() => {
    return activeScenario.modes[mode] || activeScenario.modes.observed
  }, [activeScenario, mode])

  const signals = React.useMemo(() => {
    return modeData.signals.map(s => {
      if (s.id in thresholdOverrides) {
        return { ...s, value: thresholdOverrides[s.id] }
      }
      return s
    })
  }, [modeData.signals, thresholdOverrides])

  const baseEvidence = modeData.evidence

  const evidence = React.useMemo(() => {
    return baseEvidence.map(e => {
      if (excludedEvidenceIds.includes(e.id)) {
        return { ...e, status: "excluded" as const }
      }
      return e
    })
  }, [baseEvidence, excludedEvidenceIds])

  const rules = activeScenario.rules

  // Dynamically evaluate scenario whenever data changes
  const evaluation = React.useMemo(() => {
    return evaluateScenario(activeScenario, mode, thresholdOverrides, excludedEvidenceIds)
  }, [activeScenario, mode, thresholdOverrides, excludedEvidenceIds])

  // Trigger callback if decision state changes
  const decisionChangeRef = React.useRef(onDecisionChange)
  React.useEffect(() => {
    decisionChangeRef.current = onDecisionChange
  }, [onDecisionChange])

  React.useEffect(() => {
    decisionChangeRef.current?.(evaluation)
  }, [evaluation])

  // Actions
  const actions = React.useMemo(() => ({
    setScenario: (sc: DecisionScenario) => {
      setActiveScenario(sc)
      setThresholdOverrides({})
      setExcludedEvidenceIds([])
      setSelectedSignalId(null)
      setSelectedEvidenceId(null)
      setSelectedRuleId(null)
    },
    setMode: (m: DecisionMode) => {
      setMode(m)
    },
    selectSignal: (id: string | null) => {
      setSelectedSignalId(id)
    },
    selectEvidence: (id: string | null) => {
      setSelectedEvidenceId(id)
    },
    selectRule: (id: string | null) => {
      setSelectedRuleId(id)
    },
    setThreshold: (id: string, value: number) => {
      setThresholdOverrides(prev => ({ ...prev, [id]: value }))
    },
    resetThresholds: () => {
      setThresholdOverrides({})
    },
    toggleEvidence: (id: string) => {
      setExcludedEvidenceIds(prev => {
        if (prev.includes(id)) {
          return prev.filter(x => x !== id)
        } else {
          return [...prev, id]
        }
      })
    },
    includeAllEvidence: () => {
      setExcludedEvidenceIds([])
    },
    resetScenario: () => {
      setThresholdOverrides({})
      setExcludedEvidenceIds([])
      setSelectedSignalId(null)
      setSelectedEvidenceId(null)
      setSelectedRuleId(null)
      setMode("observed")
    },
  }), [])

  const snapshot: DecisionSnapshot = React.useMemo(() => ({
    scenarioId: activeScenario.id,
    mode,
    outcome: evaluation.outcome,
    status: evaluation.status,
    confidence: evaluation.confidence,
    includedEvidenceIds: baseEvidence.filter(e => !excludedEvidenceIds.includes(e.id)).map(e => e.id),
    excludedEvidenceIds,
    ruleResults: evaluation.ruleResults,
    missingEvidenceIds: evaluation.missingEvidenceIds,
    contradictions: evaluation.contradictions,
    thresholdOverrides,
  }), [activeScenario.id, mode, evaluation, baseEvidence, excludedEvidenceIds, thresholdOverrides])

  const contextValue: DecisionContext = React.useMemo(() => ({
    state: {
      activeScenario,
      mode,
      signals,
      evidence,
      rules,
      evaluation,
      selectedSignalId,
      selectedEvidenceId,
      selectedRuleId,
      thresholdOverrides,
      excludedEvidenceIds,
      decisionSnapshot: snapshot,
    },
    actions,
  }), [
    activeScenario,
    mode,
    signals,
    evidence,
    rules,
    evaluation,
    selectedSignalId,
    selectedEvidenceId,
    selectedRuleId,
    thresholdOverrides,
    excludedEvidenceIds,
    snapshot,
    actions,
  ])

  return (
    <DecisionContextObj.Provider value={contextValue}>
      {children}
    </DecisionContextObj.Provider>
  )
}
export type { DecisionContext }
