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
  const [showDevDetails, setShowDevDetails] = useState<boolean>(false)
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
    <main className={cn("min-h-screen bg-stone-50 font-sans text-neutral-900 text-left min-w-0", reduceMotion && "motion-reduce")}>
      {/* Top Compact Navigation */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-6">
          <LabNavigation compact={true} />
        </div>
      </header>

      {/* Hero Header & Workspace Controls */}
      <section className={cn("border-b border-stone-200 bg-gradient-to-b py-5 px-4 sm:px-6 lg:px-8", modeTheme.gradientHeader)} aria-label="Director Header">
        <div className="mx-auto max-w-screen-xl space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center rounded-full border border-neutral-950/20 bg-neutral-950 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                  Creative Director v1.0
                </span>
                <span className="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-2.5 py-0.5 text-[10px] font-mono font-medium text-stone-700">
                  Read-Only Workspace
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl lg:text-3xl">
                Creative Director Workspace
              </h1>
              <p id="director-tagline" className="mt-0.5 text-xs sm:text-sm font-medium text-stone-700 max-w-2xl">
                One project. One clear next move. Backed by evidence.
              </p>
            </div>

            {/* Utility Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setReduceMotion(!reduceMotion)}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950",
                  reduceMotion
                    ? "border-purple-300 bg-purple-50 text-purple-900"
                    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                )}
                aria-label="Toggle motion preference"
              >
                {reduceMotion ? "Motion: Reduced" : "Motion: Normal"}
              </button>
              <button
                type="button"
                onClick={copySummaryToClipboard}
                className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
                aria-label="Copy project summary"
              >
                {copiedStatus ? "Copied!" : "Copy Summary"}
              </button>
            </div>
          </div>

          {/* Section 1: Project & Mode Selector */}
          <div aria-label="Project Fixture Selection">
            {/* Mobile Selector (< md): Compact Accessible Dropdown */}
            <div className="md:hidden space-y-1" id="mobile-selector-container">
              <label htmlFor="mobile-scenario-select" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600">
                Active Scenario:
              </label>
              <select
                id="mobile-scenario-select"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs font-semibold text-stone-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
              >
                {fixtureKeys.map((key) => {
                  const p = getDirectorProjection(key)
                  return (
                    <option key={key} value={key}>
                      [{p.result.mode}] {p.input.project.title} ({p.result.resolvedPhase})
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Desktop Selector (>= md): Compact Grid */}
            <div className="hidden md:grid gap-2 grid-cols-4" id="desktop-selector-container">
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
                      "flex flex-col text-left rounded-xl p-3 border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950",
                      isSelected
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                        : "border-stone-200 bg-white text-stone-800 hover:border-stone-400 hover:bg-stone-50"
                    )}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">
                      {projTheme.label}
                    </span>
                    <span className="mt-0.5 text-xs font-semibold truncate">
                      {getDirectorProjection(key).input.project.title}
                    </span>
                    <span className="mt-1 inline-flex self-start rounded-md px-1.5 py-0.5 text-[10px] font-mono border bg-stone-100 dark:bg-white/10">
                      Phase: {getDirectorProjection(key).result.resolvedPhase}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Selected Scenario Context Summary Bar */}
            <div className="mt-3 pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-stone-900">{input.project.title}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase", modeTheme.badgeBg, modeTheme.badgeText)}>
                  {modeTheme.label}
                </span>
                <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700">
                  {result.resolvedPhase}
                </span>
                <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700">
                  {input.project.status}
                </span>
              </div>
              <div className="text-[11px] text-stone-600">
                Target Evaluator: <strong className="uppercase text-stone-900">{result.evaluatorPath.evaluatorType}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Body */}
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 min-w-0">

        {/* Combined First-Viewport Decision Block: HERO DEMO & NEXT AUTHORIZED ACTION */}
        <section className={cn("relative overflow-hidden rounded-3xl border-2 bg-white p-4 sm:p-6 md:p-8 shadow-xl min-w-0 space-y-6", modeTheme.borderAccent)} aria-label="Hero Decision Center">
          
          {/* Top Info Header: Mode and Readiness */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-neutral-950 px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-white">
                HERO DEMO MOMENT
              </span>
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase",
                result.heroDemoMoment.readinessStatus === "ready" ? "bg-emerald-100 text-emerald-900 border border-emerald-300" :
                result.heroDemoMoment.readinessStatus === "blocked" ? "bg-red-100 text-red-900 border border-red-300" :
                "bg-amber-100 text-amber-900 border border-amber-300"
              )}>
                Status: {result.heroDemoMoment.readinessStatus}
              </span>
            </div>
            <div className="text-[11px] text-stone-500 font-mono">
              Mode: {modeTheme.label} | Phase: {result.resolvedPhase}
            </div>
          </div>

          {/* 2. Hero Title & 3. Concise Transformation */}
          <div className="space-y-3">
            <h2 className="text-xl font-black tracking-tight text-neutral-950 sm:text-2xl lg:text-3xl">
              {result.heroDemoMoment.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-4xl">
              {result.heroDemoMoment.description}
            </p>
            
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs font-medium text-stone-900 leading-normal max-w-4xl">
              <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-stone-500 block mb-1">
                Visible Proof & Transformation
              </span>
              {result.heroDemoMoment.visibleTransformationOrProof}
            </div>
          </div>

          {/* 4. NEXT AUTHORIZED ACTION (Immediate focal point!) */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950 text-white p-4 sm:p-5 shadow-lg space-y-3 min-w-0" id="next-authorized-action-container" aria-label="Authorized Next Action">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-2.5">
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                NEXT AUTHORIZED ACTION
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-md px-2 py-0.5 font-mono text-[10px] font-bold border", actionAuthorityConfig.badgeClass)}>
                  Authority: {actionAuthorityConfig.label}
                </span>
                <span className="rounded-md bg-neutral-800 border border-neutral-700 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                  Approval: {result.nextAction.approvalStatus}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white sm:text-lg">
                {result.nextAction.title}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {result.nextAction.rationale}
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 pt-2 border-t border-neutral-900 text-xs">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-neutral-400 block">Expected Result</span>
                <p className="text-emerald-300 font-medium">{result.nextAction.expectedResult}</p>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-neutral-400 block">Action Boundaries</span>
                <p className="text-neutral-300">Reversibility: <strong className="text-white uppercase">{result.nextAction.reversibility}</strong></p>
              </div>
            </div>
          </div>

          {/* 5. Supporting Evidence & 6. Technical Context */}
          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600">
                Evidence needed
              </h3>
              {input.project.evidence.length > 0 ? (
                <ul className="space-y-1.5">
                  {input.project.evidence.map((ev) => (
                    <li key={ev.id} className="flex items-start gap-2 rounded-lg bg-white border border-stone-200 p-2 text-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 truncate">{ev.label}</div>
                        <div className="text-[10px] font-mono text-stone-500">{ev.type}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-stone-500 italic">No evidence item linked.</p>
              )}
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-2.5 shadow-2xs">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500">
                Evaluator Context
              </h3>
              <blockquote className="text-xs italic font-serif text-stone-800 leading-snug border-l-2 border-stone-400 pl-3">
                &ldquo;{result.heroDemoMoment.evaluatorInterpretation}&rdquo;
              </blockquote>
              <div className="text-[10px] font-mono text-stone-500 pt-1">
                Target: <span className="font-bold text-stone-900 uppercase">{result.evaluatorPath.evaluatorType}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Central Objective & Evaluator Path */}
        <section className="grid gap-6 md:grid-cols-2 min-w-0" aria-label="Objective and Evaluator Path">
          {/* Objective Statement Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm space-y-3 min-w-0">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                Central Creative Objective
              </h2>
              <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 font-mono text-[10px] text-stone-700">
                {result.mode}
              </span>
            </div>

            <div>
              <h3 className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">Statement</h3>
              <p className="mt-0.5 text-sm font-semibold text-stone-900 leading-snug">
                {result.objective.statement}
              </p>
            </div>

            <div>
              <h3 className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">Intended Outcome</h3>
              <p className="mt-0.5 text-xs text-stone-700">
                {result.objective.intendedOutcome}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div className="space-y-1 min-w-0">
                <h4 className="text-[10px] font-mono font-bold uppercase text-stone-500">Active Constraints</h4>
                <ul className="space-y-1 text-xs text-stone-700">
                  {result.objective.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-[10px] font-mono font-bold uppercase text-stone-500">Non-Goals</h4>
                <ul className="space-y-1 text-xs text-stone-500 italic">
                  {result.objective.nonGoals.map((ng, i) => (
                    <li key={i}>🚫 {ng}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Evaluator Path Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm space-y-3 min-w-0">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                Evaluator Mental Model
              </h2>
              <span className="rounded-full bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase">
                {result.evaluatorPath.evaluatorType}
              </span>
            </div>

            <div>
              <h3 className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">Decision They Must Make</h3>
              <p className="mt-0.5 text-xs font-medium text-stone-900">
                {result.evaluatorPath.decisionTheyMustMake}
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">What They Need To Believe</h3>
              <ul className="space-y-1 text-xs text-stone-700">
                {result.evaluatorPath.whatTheyNeedToBelieve.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-stone-50 border border-stone-200 p-2.5 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-stone-500">Required Proof Elements</span>
              <div className="flex flex-wrap gap-1">
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
        <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm space-y-4 min-w-0" aria-label="Quality Gates">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Quality & Evidence Gates ({result.gateEvaluations.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Universal and mode-specific verification gates. Controlling evidence required for pass state.
              </p>
            </div>

            {/* Gate Filter Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {["all", "pass", "conditional", "blocked", "fail", "review"].map((status) => {
                const isActive = gateFilter === status
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setGateFilter(status)}
                    className={cn(
                      "rounded-lg px-2 py-0.5 text-[11px] font-mono font-medium capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950",
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

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredGates.map((gate) => {
              const gateCfg = getGateStatusConfig(gate.status)
              const isExpanded = !!expandedGates[gate.gateId]
              return (
                <div key={gate.gateId} className="flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 space-y-2.5 transition hover:border-stone-300">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                      <span className="font-mono text-xs font-bold text-stone-900 truncate min-w-0 max-w-full">
                        {gate.name}
                      </span>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold border shrink-0", gateCfg.badgeClass)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", gateCfg.dotClass)}></span>
                        {gateCfg.label}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 space-y-0.5 font-mono min-w-0 break-words">
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
                    className="self-start text-[10px] font-mono text-stone-500 hover:text-stone-900 underline focus-visible:outline-none"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>

                  {isExpanded && (
                    <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-700 space-y-1 font-mono">
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
                      <div className="text-[10px] text-stone-400 pt-0.5">
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
        <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm space-y-3 min-w-0" aria-label="Canonical Blockers">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Canonical Blockers ({result.blockers.length})
              </h2>
              <p className="text-xs text-stone-500">
                Active blocking conditions derived directly from Project Brain contracts.
              </p>
            </div>
            <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 font-mono text-xs font-bold text-stone-700">
              {result.blockers.length === 0 ? "No Active Blockers" : `${result.blockers.length} Blockers`}
            </span>
          </div>

          {result.blockers.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {result.blockers.map((blocker) => {
                const isExpanded = !!expandedBlockers[blocker.blockerId]
                return (
                  <div key={blocker.blockerId} className="rounded-xl border border-red-200 bg-red-50/40 p-3.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="inline-block rounded-md bg-red-100 border border-red-300 px-2 py-0.5 text-[10px] font-mono font-bold text-red-900 uppercase">
                          {blocker.severity} · {blocker.category}
                        </span>
                        <h3 className="text-xs font-semibold text-stone-900">
                          {blocker.description}
                        </h3>
                      </div>
                      {blocker.humanActionRequired && (
                        <span className="shrink-0 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-mono font-semibold">
                          Human Action Req
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-stone-600">
                      <span className="text-stone-400">Resolution Condition:</span> {blocker.resolutionCondition}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBlockerExpand(blocker.blockerId)}
                      className="text-[10px] font-mono text-stone-500 hover:text-stone-900 underline focus-visible:outline-none"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Hide Trace" : "View Trace"}
                    </button>

                    {isExpanded && (
                      <div className="pt-1.5 border-t border-red-200/60 text-[10px] font-mono text-stone-600 space-y-0.5">
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
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center text-xs text-stone-500 italic">
              All clear — no blocking conditions active for this scenario.
            </div>
          )}
        </section>

        {/* Section 7 & 8: Authority State & Governed Learning (Compressed Empty States) */}
        <section className="grid gap-6 md:grid-cols-2 min-w-0" aria-label="Authority and Learning Governance">
          {/* Authority State Panel */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm space-y-3 min-w-0">
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2.5">
              Authority State & Scope Boundaries
            </h2>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                <span className="text-stone-500">Current Authority Level:</span>
                <span className="font-bold text-stone-900 uppercase">{input.authorityContext.authorityLevel}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                <span className="text-stone-500">Requested Action:</span>
                <span className="font-bold text-stone-900">{input.authorityContext.requestedAction}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                <span className="text-stone-500">Risk Assessment:</span>
                <span className="font-bold text-stone-900 uppercase">{input.authorityContext.risk}</span>
              </div>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-2.5 text-xs text-purple-950 space-y-0.5">
              <span className="font-bold font-mono text-[11px]">Prohibited Actions:</span>
              <p className="text-[11px] leading-snug">
                Publishing, submitting, spending budget, deleting records, or mutating canonical Project Brain files without explicit human sign-off is strictly prohibited.
              </p>
            </div>
          </div>

          {/* Governed Learning Panel (Compressed Empty State) */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm space-y-3 min-w-0">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h2 className="text-base font-bold text-stone-900">
                Learning proposals
              </h2>
              <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 font-mono text-[10px] text-stone-700">
                Read-Only Rules
              </span>
            </div>

            {result.learningProposals.length > 0 ? (
              <div className="space-y-2.5">
                {result.learningProposals.map((proposal) => (
                  <div key={proposal.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-stone-900">{proposal.proposedRule}</span>
                      <span className="rounded-full bg-white border border-stone-300 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-700">
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">{proposal.observation}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-stone-500 pt-0.5">
                      <span>Confidence: {Math.round(proposal.confidence * 100)}%</span>
                      <span>Human Approval: {proposal.humanApprovalState}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-800">No learning proposal generated.</div>
                <p className="text-[11px] text-stone-500">Existing governance rules remain unchanged for this projection.</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 9: Source & Capabilities (Expandable Developer Details) */}
        <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm space-y-3 min-w-0" aria-label="Source and Capabilities">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <h2 className="text-base font-bold text-stone-900">
              Source & capabilities
            </h2>
            <button
              type="button"
              onClick={() => setShowDevDetails(!showDevDetails)}
              className="rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1 font-mono text-[11px] text-stone-700 hover:bg-stone-100 focus-visible:outline-none"
              aria-expanded={showDevDetails}
            >
              {showDevDetails ? "Hide Developer Details" : "View Developer Details"}
            </button>
          </div>

          {/* Active Creative Capabilities (Compressed) */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-stone-600">
              Active creative capabilities ({result.selectedSkills.length})
            </h3>
            {result.selectedSkills.length > 0 ? (
              result.selectedSkills.map((skill) => (
                <div key={skill.skillId} className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono font-semibold text-stone-900">
                    <span>{skill.title} v{skill.version}</span>
                    <span className="text-[10px] uppercase text-stone-500">Policy: {skill.loadingPolicy}</span>
                  </div>
                  <p className="text-stone-600 text-xs">{skill.description}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-500 italic">
                Standard core capabilities active. No optional plugins loaded.
              </div>
            )}
          </div>

          {/* Developer Details Accordion */}
          {showDevDetails && (
            <div className="pt-3 border-t border-stone-200 font-mono text-xs text-stone-700 space-y-2">
              <h4 className="text-[10px] font-mono font-bold uppercase text-stone-500">
                Source trace
              </h4>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1.5 text-[11px]">
                <div><span className="text-stone-400">Project Brain Source:</span> {input.project.id}</div>
                <div><span className="text-stone-400">Evaluation Timestamp:</span> {input.evaluationTimestamp ?? "N/A"}</div>
                <div><span className="text-stone-400">Provenance Layers:</span> {result.provenance.join(" -> ")}</div>
                <div><span className="text-stone-400">Linked Evidence Items:</span> {input.evidence.length}</div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 px-4 text-center text-xs font-mono text-stone-500">
        <p>FAADIL Creative Director Workspace · Read-Only Slice 2 Baseline</p>
      </footer>
    </main>
  )
}
