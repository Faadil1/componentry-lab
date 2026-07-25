"use client"

import * as React from "react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { LibraryWorkbench } from "@/components/library/library-workbench"

const usageRules = [
  "Verify component dependencies prior to importing them into a target workspace.",
  "Check limitations and viewports guidelines before building production interfaces.",
  "Deterministic capture-ready components have exact state outcomes guaranteed.",
  "Raccourcis /: Focus search, ESC: Clear search or close details, G: Grid view, L: List view, F: Toggle filters.",
]

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-[#0a0a09] text-stone-100 selection:bg-cyan-400/20 selection:text-stone-100 font-sans">
      {/* Shared Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-[#0a0a09]/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stone-500 font-bold">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-stone-100">Component Catalog Index</h1>
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
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12 space-y-16">
        <LibraryWorkbench
          initialQuery=""
          initialViewMode="grid"
          showHero={true}
          showFilters={true}
        />

        {/* ── 2. Usage Rules ──────────────────────────────── */}
        <section className="rounded-xl border border-stone-800 bg-[#121110] p-6 md:p-8 space-y-6" data-library-section="rules">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Library Rules</p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-100">Deterministic catalog usage guidelines</h2>
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
      </div>
    </main>
  )
}
