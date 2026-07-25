"use client"

import * as React from "react"
import { useDecisionSystem } from "./decision-provider"
import { cn } from "@/lib/utils"

type ExportTab = "preset" | "snapshot" | "trace" | "usage"

export interface DecisionTokenExportProps {
  className?: string
}

export function DecisionTokenExport({ className }: DecisionTokenExportProps) {
  const { state } = useDecisionSystem()
  const { activeScenario, decisionSnapshot, evaluation } = state
  const [activeTab, setActiveTab] = React.useState<ExportTab>("usage")
  const [copied, setCopied] = React.useState(false)

  const presetExport = React.useMemo(() => {
    const config = {
      id: activeScenario.id,
      label: activeScenario.label,
      description: activeScenario.description,
      question: activeScenario.question,
      rules: activeScenario.rules.map(r => ({
        id: r.id,
        label: r.label,
        condition: r.condition,
        weight: r.weight,
        consequence: r.consequence,
      })),
      configurableThresholds: activeScenario.configurableThresholds,
    }
    return `export const decisionPreset = ${JSON.stringify(config, null, 2)} as const`
  }, [activeScenario])

  const snapshotExport = React.useMemo(() => {
    return JSON.stringify(decisionSnapshot, null, 2)
  }, [decisionSnapshot])

  const traceExport = React.useMemo(() => {
    return JSON.stringify(evaluation.trace, null, 2)
  }, [evaluation.trace])

  const usageExport = `import { DecisionWorkbench } from "@/components/decisions/decision-workbench"
import { decisionPresets } from "@/lib/decisions/presets"

export function MyDemo() {
  return (
    <DecisionWorkbench
      scenario={decisionPresets.releaseReadiness}
      initialMode="observed"
      showInspector={true}
      showTrace={true}
    />
  )
}`

  const contents: Record<ExportTab, string> = React.useMemo(() => ({
    preset: presetExport,
    snapshot: snapshotExport,
    trace: traceExport,
    usage: usageExport,
  }), [presetExport, snapshotExport, traceExport, usageExport])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contents[activeTab])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent fallback
    }
  }, [activeTab, contents])

  const tabs: Array<{ key: ExportTab; label: string }> = [
    { key: "usage", label: "Usage" },
    { key: "preset", label: "Preset Config" },
    { key: "snapshot", label: "Snapshot" },
    { key: "trace", label: "Trace Log" },
  ]

  return (
    <div className={cn("rounded-xl border border-stone-850 bg-[#0e0d0c] overflow-hidden", className)}>
      {/* Header tab selectors */}
      <div className="flex items-center justify-between border-b border-stone-850 px-3 py-2">
        <div className="flex items-center gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key)
                setCopied(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[9px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                activeTab === tab.key
                  ? "bg-stone-800 text-stone-200"
                  : "text-stone-500 hover:text-stone-300"
              )}
              aria-pressed={activeTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[9.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
            copied ? "text-emerald-300" : "text-stone-500 hover:text-stone-300"
          )}
          aria-label={`Copy ${activeTab} data`}
        >
          {copied ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code window */}
      <div className="overflow-x-auto p-4 max-h-[300px]">
        <pre className="font-mono text-[10.5px] leading-relaxed text-stone-300 whitespace-pre select-all">
          {contents[activeTab]}
        </pre>
      </div>
    </div>
  )
}
