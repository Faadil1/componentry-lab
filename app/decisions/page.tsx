"use client"

import * as React from "react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { DecisionProvider, useDecisionSystem } from "@/components/decisions/decision-provider"
import { DecisionGate } from "@/components/decisions/decision-gate"
import { SignalBand } from "@/components/decisions/signal-band"
import { EvidenceLedger } from "@/components/decisions/evidence-ledger"
import { RuleMatrix } from "@/components/decisions/rule-matrix"
import { DecisionTrace } from "@/components/decisions/decision-trace"
import { ConfidenceIndicator } from "@/components/decisions/confidence-indicator"
import { ThresholdControl } from "@/components/decisions/threshold-control"
import { ScenarioSwitcher } from "@/components/decisions/scenario-switcher"
import { DecisionInspector } from "@/components/decisions/decision-inspector"
import { DecisionTokenExport } from "@/components/decisions/decision-token-export"
import { decisionPresets } from "@/lib/decisions/presets"
import { cn } from "@/lib/utils"

const usageRules = [
  "Signals, evidence, and rules must be processed deterministically. No network latency simulation inside the gate.",
  "Distinguish observations from assumptions. Never mask contradictions to produce an artificial proceed status.",
  "Completeness matters more than scores. A high test coverage score cannot override a missing security audit seal.",
  "Thresholds configure rule bounds. They must not rewrite active validation rules dynamically.",
]

const limitations = [
  "This tool is a specimen log system and does not claim legal regulatory verification.",
  "The confidence score aggregates coverage and coherence, not mathematical or statistical probability.",
  "Automatic recovery pipelines are simulated for design tracing and are not executed in real environments.",
]

// Custom hero controller component to trigger the "Quick Action"
function HeroController() {
  const { state, actions } = useDecisionSystem()
  const { excludedEvidenceIds } = state

  const isExcluded = excludedEvidenceIds.includes("rollback-simulation-evidence")

  return (
    <div className="rounded-lg border border-amber-900/40 bg-amber-950/10 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-400 font-bold">
          Friction Simulation Gate
        </span>
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">
        Toggle the critical verification log below to witness how the deterministic gate acts.
      </p>

      <button
        type="button"
        onClick={() => actions.toggleEvidence("rollback-simulation-evidence")}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 border",
          isExcluded
            ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400"
            : "border-red-500/30 bg-red-950/20 text-red-400"
        )}
      >
        {isExcluded ? "Re-Include Rollback Log" : "Simulate Missing Rollback Log"}
      </button>

      <div className="text-[10px] text-stone-500 font-mono italic">
        {isExcluded
          ? "Status: Rollback log is excluded. Decision changes from Approved to Hold."
          : "Status: All observed logs present. Decision status is Approved."}
      </div>
    </div>
  )
}

function DecisionsPageContent() {
  return (
    <div className="space-y-16">
      {/* ── 1. HERO — Signature Gate + Simulation ────────── */}
      <section className="space-y-6" data-decisions-section="hero">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Decision Gate Foundation
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-100 max-w-2xl leading-[1.05]">
            A metric is not a decision.
          </h2>
          <p className="text-sm sm:text-base text-stone-400 max-w-xl leading-relaxed">
            Evaluate signals, expose missing evidence, and show exactly why the gate changed.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
          <div className="space-y-6">
            <DecisionGate />
          </div>
          <div className="space-y-4">
            <HeroController />
            <div className="rounded-lg border border-stone-850 bg-[#0e0d0c] p-4 font-mono text-[10px] text-stone-500 leading-normal">
              <p className="font-bold text-stone-400">• Memory Hook</p>
              <p className="mt-1 italic">&ldquo;A metric is not a decision.&rdquo;</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Scenario and Mode controls ───────────────── */}
      <section className="space-y-4" data-decisions-section="scenarios">
        <div className="border-b border-stone-800 pb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
            Scenario and Simulation Controls
          </span>
        </div>
        <ScenarioSwitcher />
      </section>

      {/* ── 3. Signal Band ──────────────────────────────── */}
      <section className="space-y-4" data-decisions-section="signals">
        <SignalBand />
      </section>

      {/* ── 4. Threshold override lab ───────────────────── */}
      <section className="space-y-4" data-decisions-section="thresholds">
        <ThresholdControl />
      </section>

      {/* ── 5. Evidence Ledger & Rule Matrix ────────────── */}
      <section className="grid gap-6 lg:grid-cols-2" data-decisions-section="ledger-matrix">
        <EvidenceLedger />
        <RuleMatrix />
      </section>

      {/* ── 6. Confidence Anatomy ───────────────────────── */}
      <section className="space-y-4" data-decisions-section="confidence">
        <ConfidenceIndicator />
      </section>

      {/* ── 7. Decision Trace ───────────────────────────── */}
      <section className="space-y-4" data-decisions-section="trace">
        <DecisionTrace />
      </section>

      {/* ── 8. Three Presets Showcase ───────────────────── */}
      <section className="space-y-6" data-decisions-section="presets-showcase">
        <div className="border-b border-stone-800 pb-3">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Preset Gallery</p>
          <h2 className="text-2xl font-bold tracking-tight text-stone-100">Three Preset Specimen Scenarios</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {Object.values(decisionPresets).map((preset) => (
            <div key={preset.id} className="rounded-lg border border-stone-800 bg-[#121110] p-4 space-y-3">
              <span className="font-mono text-[10px] text-stone-600 block uppercase font-bold tracking-wider">
                Preset ID: {preset.id}
              </span>
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wide">
                {preset.label}
              </h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                {preset.description}
              </p>
              <div className="text-[10px] text-stone-600 font-mono space-y-1">
                <p>• {preset.rules.length} verification rules</p>
                <p>• {preset.configurableThresholds.length} configurable bounds</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. Decision Inspector ───────────────────────── */}
      <section className="space-y-4" data-decisions-section="inspector">
        <DecisionInspector />
      </section>

      {/* ── 10. TypeScript & JSON Token Export ──────────── */}
      <section className="space-y-4" data-decisions-section="token-export">
        <div className="border-b border-stone-800 pb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
            Audit API &amp; Code Token Export
          </span>
        </div>
        <DecisionTokenExport />
      </section>

      {/* ── 11. Usage Rules ──────────────────────────────── */}
      <section className="rounded-xl border border-stone-800 bg-[#121110] p-6 md:p-8 space-y-6" data-decisions-section="rules">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Usage Rules</p>
          <h2 className="text-2xl font-bold tracking-tight text-stone-100">Deterministic process design requirements</h2>
        </div>
        <div className="space-y-2">
          {usageRules.map((rule) => (
            <div key={rule} className="flex gap-3 rounded-md border border-stone-800 bg-stone-900/30 p-3 text-xs text-stone-300 leading-relaxed">
              <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <p className="text-pretty">{rule}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 12. Limitations ─────────────────────────────── */}
      <section className="rounded-xl border border-stone-800 bg-[#0e0d0c] p-6 md:p-8 space-y-6" data-decisions-section="limitations">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Limitations</p>
          <h2 className="text-2xl font-bold tracking-tight text-stone-100">Operational boundaries</h2>
        </div>
        <div className="space-y-2">
          {limitations.map((item) => (
            <div key={item} className="flex gap-3 rounded-md border border-stone-800/60 bg-stone-900/20 p-3 text-xs text-stone-400 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 shrink-0" />
              <p className="text-pretty">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function DecisionsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a09] text-stone-100 selection:bg-cyan-400/20 selection:text-stone-100 font-sans">
      {/* Shared Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-[#0a0a09]/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stone-500 font-bold">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-stone-100">Decision Systems Workbench</h1>
          </div>
          <LabNavigation
            className="contents"
            linkClassName="px-3.5"
            activeClassName="bg-stone-100 font-semibold text-stone-900 shadow-xs"
            inactiveClassName="border border-stone-700 bg-stone-900/80 text-stone-400 transition hover:border-stone-500 hover:text-stone-200"
          />
        </div>
      </header>

      {/* Main container wrapper */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <DecisionProvider scenario={decisionPresets.releaseReadiness} initialMode="observed">
          <DecisionsPageContent />
        </DecisionProvider>
      </div>
    </main>
  )
}
