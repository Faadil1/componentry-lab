"use client"

import * as React from "react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { RecipeProvider, useRecipeStudio } from "@/components/recipes/recipe-provider"
import { RecipeStage } from "@/components/recipes/recipe-stage"
import { RecipeSelector } from "@/components/recipes/recipe-selector"
import { RecipeSystemMap } from "@/components/recipes/recipe-system-map"
import { RecipeInspector } from "@/components/recipes/recipe-inspector"
import { RecipeCapturePlan } from "@/components/recipes/recipe-capture-plan"
import { RecipeExport } from "@/components/recipes/recipe-export"
import { recipePresets } from "@/lib/recipes/presets"

const usageRules = [
  "Composed scenes must utilize existing primitives (typography, layouts, decisions, player) without modifying their original core APIs.",
  "Every recipe must contain a structured CapturePlan detailing expected visual frame checkpoints.",
  "Transitions and status alerts changes must announce cleanly to assistive technologies via aria-live regions.",
  "Simulated viewports and safety overlay guides help frame capture boundaries but do not replace browser testing.",
]

const limitations = [
  "This workbench coordinates static layouts framing. Video or image file exports require external browser automation tools.",
  "Mock telemetry feeds and clocks are simulated locally and do not interact with live backend systems.",
  "Split flap animations are rendered using CSS transitions and might scale down on narrow mobile viewports.",
]

function RecipesPageContent() {
  const { state } = useRecipeStudio()
  const { cleanView } = state

  return (
    <div className="space-y-16">
      {/* ── 1. HERO — Core Workbench presentation ────────── */}
      <section className="space-y-6" data-recipes-section="hero">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Recipe Composition Studio
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-100 max-w-2xl leading-[1.05] Outfit">
            Primitives become products when they compose.
          </h2>
          <p className="text-sm sm:text-base text-stone-400 max-w-xl leading-relaxed Inter">
            Combine structure, interaction, evidence, playback, and capture into complete interface recipes.
          </p>
        </div>

        {/* Live Active Recipe stage */}
        <div className="space-y-6">
          <RecipeSelector />
          <RecipeStage className="w-full" />
        </div>
      </section>

      {/* ── 2. Recipe Capture Plan Controls ────────────── */}
      <section className="space-y-4" data-recipes-section="capture-plan">
        <RecipeCapturePlan />
      </section>

      {/* ── 3. Systems Integration Map ──────────────────── */}
      <section className="grid gap-6 lg:grid-cols-3 items-start" data-recipes-section="composition-info">
        <div className="lg:col-span-2 space-y-6">
          <RecipeSystemMap />
          <RecipeExport />
        </div>
        <RecipeInspector />
      </section>

      {/* ── 4. Recipes Comparison details gallery ───────── */}
      <section className="space-y-6 border-t border-stone-850 pt-10" data-recipes-section="comparison">
        <div className="space-y-1">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block font-bold">Studio Recipes</span>
          <h3 className="text-xl font-bold text-stone-200 uppercase">Gallery of 4 Composition Presets</h3>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(recipePresets).map((preset) => (
            <div key={preset.id} className="rounded-lg border border-stone-850 bg-[#0e0d0c] p-4 space-y-3.5">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[8px] text-stone-600 uppercase font-bold tracking-wider">{preset.category}</span>
                <span className="font-mono text-[8px] text-cyan-400 uppercase font-bold">{preset.status.replace("-", " ")}</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-stone-200 uppercase">{preset.label}</h4>
                <p className="text-[11px] text-stone-500 leading-normal">{preset.description}</p>
              </div>
              <div className="border-t border-stone-900 pt-3 text-[10px] text-stone-400 font-mono italic">
                &ldquo;{preset.memoryHook}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Usage Rules ──────────────────────────────── */}
      {!cleanView && (
        <section className="rounded-xl border border-stone-800 bg-[#121110] p-6 md:p-8 space-y-6" data-recipes-section="rules">
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
      )}

      {/* ── 6. Limitations ─────────────────────────────── */}
      {!cleanView && (
        <section className="rounded-xl border border-stone-800 bg-[#0e0d0c] p-6 md:p-8 space-y-6" data-recipes-section="limitations">
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
      )}
    </div>
  )
}

export default function RecipesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a09] text-stone-100 selection:bg-cyan-400/20 selection:text-stone-100 font-sans">
      {/* Shared Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-[#0a0a09]/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stone-500 font-bold">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-stone-100">Recipe Composition Studio</h1>
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
        <RecipeProvider initialRecipeId="product-launch" initialViewport="desktop">
          <RecipesPageContent />
        </RecipeProvider>
      </div>
    </main>
  )
}
