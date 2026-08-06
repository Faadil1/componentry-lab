"use client"

import React, { useState, useMemo } from "react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import {
  getDirectorFixtureKeys,
  getDirectorProjection,
  getModeVisualTheme,
  getGateStatusConfig,
  getAuthorityLevelConfig,
} from "@/lib/director"
import { cn } from "@/lib/utils"

export default function DirectorPage() {
  const fixtureKeys = useMemo(() => getDirectorFixtureKeys(), [])
  const [selectedKey, setSelectedKey] = useState<string>("the-second-absence")
  const [gateFilter, setGateFilter] = useState<string>("all")
  const [reduceMotion, setReduceMotion] = useState<boolean>(false)
  const [expandedGates, setExpandedGates] = useState<Record<string, boolean>>({})
  const [expandedBlockers, setExpandedBlockers] = useState<Record<string, boolean>>({})
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false)

  // Compute Director projection deterministically
  const projection = useMemo(() => {
    return getDirectorProjection(selectedKey)
  }, [selectedKey])

  const { input, result } = projection
  const modeTheme = useMemo(() => getModeVisualTheme(result.mode), [result.mode])
  const actionAuthorityConfig = useMemo(
    () => getAuthorityLevelConfig(result.nextAction.authorityRequirement),
    [result.nextAction.authorityRequirement]
  )

  const toggleGateExpand = (gateId: string) => {
    setExpandedGates((prev) => ({ ...prev, [gateId]: !prev[gateId] }))
  }

  const toggleBlockerExpand = (blockerId: string) => {
    setExpandedBlockers((prev) => ({ ...prev, [blockerId]: !prev[blockerId] }))
  }

  const filteredGates = useMemo(() => {
    if (gateFilter === "all") return result.gateEvaluations
    return result.gateEvaluations.filter((g) => g.status === gateFilter)
  }, [result.gateEvaluations, gateFilter])

  const copySummaryToClipboard = () => {
    const summary = `[Creative Director Projection]
Project: ${input.project.title} (${input.project.id})
Mode: ${result.mode} | Phase: ${result.resolvedPhase}
Evaluator: ${result.evaluatorPath.evaluatorType}
Hero Demo: ${result.heroDemoMoment.title} [Status: ${result.heroDemoMoment.readinessStatus}]
Authorized Next Action: ${result.nextAction.title} [Authority: ${result.nextAction.authorityRequirement}]
Blockers: ${result.blockers.length} active`
    navigator.clipboard.writeText(summary)
    setCopiedStatus(true)
    setTimeout(() => setCopiedStatus(false), 2000)
  }

  return (
    <main className={cn("min-h-screen bg-stone-50 font-sans text-neutral-900 text-left", reduceMotion && "motion-reduce")}>
      {/* Top System Navigation */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-6">
          <LabNavigation />
        </div>
      </header>

      {/* Hero Header & Workspace Controls */}
      <section className={cn("border-b border-stone-200 bg-gradient-to-b py-8 px-4 sm:px-6 lg:px-8", modeTheme.gradientHeader)} aria-label="Director Header">
        <div className="mx-auto max-w-screen-xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-full border border-neutral-950/20 bg-neutral-950 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-white">
                  Director Core v1.0
                </span>
                <span className="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-[11px] font-mono font-medium text-stone-700">
                  Read-Only Surface
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl lg:text-4xl">
                Creative Director Workspace
              </h1>
              <p className="mt-1 text-sm text-stone-600 sm:text-base max-w-3xl">
                Deterministic mode-specific routing, evidence-bound quality gates, and authority-governed single next-action selection.
              </p>
            </div>

            {/* Utility Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setReduceMotion(!reduceMotion)}
                className={cn(
                  "inline-flex items-center justify-center rounded-xl border px-3.5 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950",
                  reduceMotion
                    ? "border-purple-300 bg-purple-50 text-purple-900"
                    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                )}
                aria-label="Toggle motion preference"
              >
                {reduceMotion ? "Reduced Motion: ON" : "Reduced Motion: OFF"}
              </button>
              <button
                type="button"
                onClick={copySummaryToClipboard}
                className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
                aria-label="Copy project summary"
              >
                {copiedStatus ? "Copied!" : "Copy Summary"}
              </button>
            </div>
          </div>

          {/* Section 1: Project & Mode Selector */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6" aria-label="Project Fixture Selection">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Select Deterministic Project Scenario
            </h2>
            <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {fixtureKeys.map((key) => {
                const isSelected = key === selectedKey
                const projTheme = getModeVisualTheme(getDirectorProjection(key).result.mode)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    aria-current={isSelected ? "true" : undefined}
                    className={cn(
                      "flex flex-col text-left rounded-xl p-3.5 border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950",
                      isSelected
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-md"
                        : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400 hover:bg-white"
                    )}
                  >
                    <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">
                      {projTheme.label}
                    </span>
                    <span className="mt-1 text-sm font-semibold truncate">
                      {getDirectorProjection(key).input.project.title}
                    </span>
                    <span className="mt-2 inline-flex self-start rounded-md px-2 py-0.5 text-[10px] font-mono font-medium border bg-white/10 border-white/20">
                      Phase: {getDirectorProjection(key).result.resolvedPhase}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Current Selected Projection Metadata Summary Bar */}
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-stone-900">{input.project.title}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase", modeTheme.badgeBg, modeTheme.badgeText)}>
                  Mode: {modeTheme.label}
                </span>
                <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 font-mono text-[11px] text-stone-700">
                  Resolved Phase: {result.resolvedPhase}
                </span>
                <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 font-mono text-[11px] text-stone-700">
                  Status: {input.project.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-500">
                <span>Evaluator Target:</span>
                <span className="font-bold text-stone-800 uppercase">{result.evaluatorPath.evaluatorType}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Body */}
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">

        {/* Section 3: HERO DEMO MOMENT (The Dominant Centerpiece) */}
        <section className={cn("relative overflow-hidden rounded-3xl border-2 bg-white p-6 shadow-xl sm:p-8 md:p-10", modeTheme.borderAccent)} aria-label="Hero Demo Moment">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-neutral-950 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-white">
                  HERO DEMO MOMENT
                </span>
                <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-mono font-semibold uppercase",
                  result.heroDemoMoment.readinessStatus === "ready" ? "bg-emerald-100 text-emerald-900 border border-emerald-300" :
                  result.heroDemoMoment.readinessStatus === "blocked" ? "bg-red-100 text-red-900 border border-red-300" :
                  "bg-amber-100 text-amber-900 border border-amber-300"
                )}>
                  Status: {result.heroDemoMoment.readinessStatus}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl lg:text-4xl">
                  {result.heroDemoMoment.title}
                </h2>
                <p className="mt-2 text-base text-stone-700 leading-relaxed">
                  {result.heroDemoMoment.description}
                </p>
              </div>

              {/* Transformation Proof Card */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Visible Proof & Transformation</span>
                </div>
                <p className="text-sm font-medium text-stone-900 leading-normal">
                  {result.heroDemoMoment.visibleTransformationOrProof}
                </p>
              </div>

              {/* Evaluator Interpretation */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 space-y-2 shadow-xs">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                  Evaluator Interpretation ({result.evaluatorPath.evaluatorType})
                </div>
                <blockquote className="text-sm italic font-serif text-stone-800 leading-snug border-l-2 border-stone-400 pl-3">
                  &ldquo;{result.heroDemoMoment.evaluatorInterpretation}&rdquo;
                </blockquote>
              </div>
            </div>

            {/* Right Column: Required Evidence & Active Blockers */}
            <div className="w-full lg:w-80 space-y-4 shrink-0">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                  Required Hero Evidence
                </h3>
                {result.heroDemoMoment.requiredEvidence.length > 0 ? (
                  <ul className="space-y-1.5">
                    {result.heroDemoMoment.requiredEvidence.map((ev) => (
                      <li key={ev} className="flex items-center gap-2 rounded-lg bg-white border border-stone-200 px-3 py-1.5 text-xs font-mono text-stone-800">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span className="truncate">{ev}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-500 italic">No specific evidence bound yet.</p>
                )}
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                  Hero Trigger & Phase Context
                </h3>
                <div className="text-xs font-mono text-stone-800 space-y-1">
                  <div><span className="text-stone-500">Trigger:</span> {result.heroDemoMoment.trigger}</div>
                  <div><span className="text-stone-500">Mode:</span> {result.mode}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: EXACTLY ONE AUTHORIZED NEXT ACTION (Primary Decision Surface) */}
        <section className="rounded-3xl border border-neutral-900 bg-neutral-950 text-white p-6 shadow-2xl sm:p-8 md:p-10 space-y-6" aria-label="Authorized Next Action">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-5">
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest">
                DECISION SURFACE — EXACTLY ONE AUTHORIZED ACTION
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {result.nextAction.title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-lg px-3 py-1.5 font-mono text-xs font-bold border", actionAuthorityConfig.badgeClass)}>
                Authority: {actionAuthorityConfig.label}
              </span>
              <span className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-1.5 font-mono text-xs font-medium text-neutral-300">
                Approval: {result.nextAction.approvalStatus}
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Action Specification */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Action Rationale & Purpose
                </h3>
                <p className="mt-1 text-base text-neutral-200 leading-relaxed">
                  {result.nextAction.rationale}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Expected Result
                </h3>
                <p className="mt-1 text-sm font-medium text-emerald-300">
                  {result.nextAction.expectedResult}
                </p>
              </div>

              {/* Preconditions & Required Completion Evidence */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Preconditions ({result.nextAction.preconditions.length})
                  </h4>
                  {result.nextAction.preconditions.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-neutral-300">
                      {result.nextAction.preconditions.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-neutral-500 font-mono">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-neutral-500 italic">No outstanding preconditions.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Post-Completion Evidence
                  </h4>
                  {result.nextAction.evidenceNeededAfterCompletion.length > 0 ? (
                    <ul className="space-y-1 text-xs font-mono text-neutral-300">
                      {result.nextAction.evidenceNeededAfterCompletion.map((e) => (
                        <li key={e} className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-neutral-500 italic">No additional evidence required.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Authority Constraints Box */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Authority Audit & Safety Window
                </h3>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                    <span className="text-neutral-500">Action ID:</span>
                    <span className="font-mono">{result.nextAction.actionId}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                    <span className="text-neutral-500">Reversibility:</span>
                    <span className="font-mono uppercase text-emerald-400">{result.nextAction.reversibility}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                    <span className="text-neutral-500">Source Gate/Decision:</span>
                    <span className="font-mono text-neutral-400">{result.nextAction.sourceDecisionOrGate}</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-snug">
                  {actionAuthorityConfig.description}
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-200">
                <strong>Read-Only Notice:</strong> This action is projected for review. External execution tools remain strictly disconnected.
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Central Objective & Evaluator Path */}
        <section className="grid gap-6 md:grid-cols-2" aria-label="Objective and Evaluator Path">
          {/* Objective Statement Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-600">
                Central Creative Objective
              </h2>
              <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 font-mono text-[11px] text-stone-700">
                {result.mode}
              </span>
            </div>

            <div>
              <h3 className="text-xs text-stone-500 uppercase tracking-wider font-mono">Statement</h3>
              <p className="mt-1 text-base font-semibold text-stone-900 leading-snug">
                {result.objective.statement}
              </p>
            </div>

            <div>
              <h3 className="text-xs text-stone-500 uppercase tracking-wider font-mono">Intended Outcome</h3>
              <p className="mt-1 text-sm text-stone-700">
                {result.objective.intendedOutcome}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-mono font-bold uppercase text-stone-500">Active Constraints</h4>
                <ul className="space-y-1 text-xs text-stone-700">
                  {result.objective.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-mono font-bold uppercase text-stone-500">Non-Goals</h4>
                <ul className="space-y-1 text-xs text-stone-500 italic">
                  {result.objective.nonGoals.map((ng, i) => (
                    <li key={i}>🚫 {ng}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Evaluator Path Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-600">
                Evaluator Mental Model
              </h2>
              <span className="rounded-full bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase">
                {result.evaluatorPath.evaluatorType}
              </span>
            </div>

            <div>
              <h3 className="text-xs text-stone-500 uppercase tracking-wider font-mono">Decision They Must Make</h3>
              <p className="mt-1 text-sm font-medium text-stone-900">
                {result.evaluatorPath.decisionTheyMustMake}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs text-stone-500 uppercase tracking-wider font-mono">What They Need To Believe</h3>
              <ul className="space-y-1 text-xs text-stone-700">
                {result.evaluatorPath.whatTheyNeedToBelieve.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-stone-500">Required Proof Elements</span>
              <div className="flex flex-wrap gap-1.5">
                {result.evaluatorPath.requiredProof.map((proof, i) => (
                  <span key={i} className="rounded-md bg-white border border-stone-200 px-2 py-0.5 text-[11px] font-mono text-stone-800">
                    {proof}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Quality Gates */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-6" aria-label="Quality Gates">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Quality & Evidence Gates ({result.gateEvaluations.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Universal and mode-specific verification gates. Evidence controlling is required for pass state.
              </p>
            </div>

            {/* Gate Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["all", "pass", "conditional", "blocked", "fail", "review"].map((status) => {
                const isActive = gateFilter === status
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setGateFilter(status)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-mono font-medium capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950",
                      isActive
                        ? "bg-neutral-950 text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    )}
                  >
                    {status}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGates.map((gate) => {
              const gateCfg = getGateStatusConfig(gate.status)
              const isExpanded = !!expandedGates[gate.gateId]
              return (
                <div key={gate.gateId} className="flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-4 space-y-3 transition hover:border-stone-300">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900 truncate">
                        {gate.name}
                      </span>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border shrink-0", gateCfg.badgeClass)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", gateCfg.dotClass)}></span>
                        {gateCfg.label}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1 font-mono">
                      <div><span className="text-stone-400">ID:</span> {gate.gateId}</div>
                      <div><span className="text-stone-400">Evaluator:</span> {gate.evaluator}</div>
                      {gate.controllingEvidence && (
                        <div className="text-emerald-700 font-semibold truncate">
                          <span className="text-stone-400">Controlling Evidence:</span> {gate.controllingEvidence}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleGateExpand(gate.gateId)}
                    className="self-start text-[11px] font-mono text-stone-500 hover:text-stone-900 underline focus-visible:outline-none"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? "Hide Gate Details" : "Expand Gate Details"}
                  </button>

                  {isExpanded && (
                    <div className="pt-2 border-t border-stone-200 text-xs text-stone-700 space-y-2 font-mono">
                      <div><span className="font-bold text-stone-900">Decision:</span> {gate.decision}</div>
                      <div>
                        <span className="font-bold text-stone-900">Required Evidence:</span>{" "}
                        {gate.requiredEvidence.length > 0 ? gate.requiredEvidence.join(", ") : "None"}
                      </div>
                      {gate.conditions.length > 0 && (
                        <div>
                          <span className="font-bold text-stone-900">Conditions:</span>
                          <ul className="list-disc list-inside text-amber-800">
                            {gate.conditions.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}
                      <div className="text-[10px] text-stone-400 pt-1">
                        Provenance: {gate.provenance} @ {gate.evaluatedAt}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 5: Canonical Blockers */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4" aria-label="Canonical Blockers">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Canonical Blockers ({result.blockers.length})
              </h2>
              <p className="text-xs text-stone-500">
                Active blocking conditions derived directly from Project Brain contracts.
              </p>
            </div>
            <span className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1 font-mono text-xs font-bold text-stone-700">
              {result.blockers.length === 0 ? "No Active Blockers" : `${result.blockers.length} Blockers`}
            </span>
          </div>

          {result.blockers.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {result.blockers.map((blocker) => {
                const isExpanded = !!expandedBlockers[blocker.blockerId]
                return (
                  <div key={blocker.blockerId} className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="inline-block rounded-md bg-red-100 border border-red-300 px-2 py-0.5 text-[10px] font-mono font-bold text-red-900 uppercase">
                          {blocker.severity} · {blocker.category}
                        </span>
                        <h3 className="text-sm font-semibold text-stone-900">
                          {blocker.description}
                        </h3>
                      </div>
                      {blocker.humanActionRequired && (
                        <span className="shrink-0 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-mono font-semibold">
                          Human Action Req
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono text-stone-600">
                      <span className="text-stone-400">Resolution Condition:</span> {blocker.resolutionCondition}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBlockerExpand(blocker.blockerId)}
                      className="text-[11px] font-mono text-stone-500 hover:text-stone-900 underline focus-visible:outline-none"
                    >
                      {isExpanded ? "Hide Provenance" : "View Provenance"}
                    </button>

                    {isExpanded && (
                      <div className="pt-2 border-t border-red-200/60 text-[11px] font-mono text-stone-600 space-y-1">
                        <div>Scope: {blocker.blockingScope}</div>
                        <div>Source: {blocker.source}</div>
                        <div>ID: {blocker.blockerId}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center text-xs text-stone-500 italic">
              All clear — no blocking conditions active for this scenario.
            </div>
          )}
        </section>

        {/* Section 7 & 8: Authority State & Governed Learning */}
        <section className="grid gap-6 md:grid-cols-2" aria-label="Authority and Learning Governance">
          {/* Authority State Panel */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Authority State & Scope Boundaries
            </h2>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center rounded-xl bg-stone-50 p-3 border border-stone-200">
                <span className="text-stone-500">Current Authority Level:</span>
                <span className="font-bold text-stone-900 uppercase">{input.authorityContext.authorityLevel}</span>
              </div>
              <div className="flex justify-between items-center rounded-xl bg-stone-50 p-3 border border-stone-200">
                <span className="text-stone-500">Requested Action:</span>
                <span className="font-bold text-stone-900">{input.authorityContext.requestedAction}</span>
              </div>
              <div className="flex justify-between items-center rounded-xl bg-stone-50 p-3 border border-stone-200">
                <span className="text-stone-500">Risk Assessment:</span>
                <span className="font-bold text-stone-900 uppercase">{input.authorityContext.risk}</span>
              </div>
              <div className="flex justify-between items-center rounded-xl bg-stone-50 p-3 border border-stone-200">
                <span className="text-stone-500">Approval Requirement:</span>
                <span className="font-bold text-stone-900 uppercase">{input.authorityContext.approvalRequirement}</span>
              </div>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3.5 text-xs text-purple-950 space-y-1">
              <span className="font-bold font-mono">Prohibited Actions:</span>
              <p className="text-[11px] leading-snug">
                Publishing, submitting, spending budget, deleting records, or mutating canonical Project Brain files without explicit human sign-off is strictly prohibited.
              </p>
            </div>
          </div>

          {/* Governed Learning Panel */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-base font-bold text-stone-900">
                Governed Learning Proposals ({result.learningProposals.length})
              </h2>
              <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 font-mono text-[10px] text-stone-700">
                Read-Only Rules
              </span>
            </div>

            {result.learningProposals.length > 0 ? (
              <div className="space-y-3">
                {result.learningProposals.map((proposal) => (
                  <div key={proposal.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-stone-900">{proposal.proposedRule}</span>
                      <span className="rounded-full bg-white border border-stone-300 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-700">
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">{proposal.observation}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-stone-500 pt-1">
                      <span>Confidence: {Math.round(proposal.confidence * 100)}%</span>
                      <span>Human Approval: {proposal.humanApprovalState}</span>
                      <span>Version: {proposal.ruleVersion}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center text-xs text-stone-500 italic">
                No active learning proposals for this scenario.
              </div>
            )}
          </div>
        </section>

        {/* Section 9: Provenance & Metadata */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4" aria-label="Provenance and Selected Skills">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-600 border-b border-stone-100 pb-3">
            Director Provenance & Selected Skills
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Selected Skills Metadata */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase text-stone-500">
                Loaded Skills Metadata ({result.selectedSkills.length})
              </h3>
              {result.selectedSkills.map((skill) => (
                <div key={skill.skillId} className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono font-semibold text-stone-900">
                    <span>{skill.title} v{skill.version}</span>
                    <span className="text-[10px] uppercase text-stone-500">Policy: {skill.loadingPolicy}</span>
                  </div>
                  <p className="text-stone-600">{skill.description}</p>
                  <div className="text-[10px] font-mono text-stone-400">
                    Source: {skill.sourcePaths.join(", ")} | Authority: {skill.authorityRequirement}
                  </div>
                </div>
              ))}
            </div>

            {/* Traceability Metadata */}
            <div className="space-y-2 font-mono text-xs text-stone-700">
              <h3 className="text-xs font-mono font-bold uppercase text-stone-500">
                Traceability & Audit Chain
              </h3>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2">
                <div><span className="text-stone-400">Project Brain Source:</span> {input.project.id}</div>
                <div><span className="text-stone-400">Evaluation Timestamp:</span> {input.evaluationTimestamp ?? "N/A"}</div>
                <div><span className="text-stone-400">Provenance Layers:</span> {result.provenance.join(" -> ")}</div>
                <div>
                  <span className="text-stone-400">Evidence Count:</span> {input.evidence.length} linked items
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 px-4 text-center text-xs font-mono text-stone-500">
        <p>FAADIL Creative Director Core · Componentry Lab isolated worktree</p>
      </footer>
    </main>
  )
}
