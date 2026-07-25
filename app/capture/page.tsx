"use client"

import * as React from "react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { CaptureProvider, useCaptureBridge } from "@/components/capture/capture-provider"
import { CaptureStage } from "@/components/capture/capture-stage"
import { CaptureToolbar } from "@/components/capture/capture-toolbar"
import { CaptureTimeline } from "@/components/capture/capture-timeline"
import { CaptureStateList } from "@/components/capture/capture-state-list"
import { CaptureStepList } from "@/components/capture/capture-step-list"
import { CaptureInspector } from "@/components/capture/capture-inspector"
import { CaptureManifestExport } from "@/components/capture/capture-manifest-export"
import { CaptureUrlPanel } from "@/components/capture/capture-url-panel"
import { CaptureCleanView } from "@/components/capture/capture-clean-view"
import { capturePresets } from "@/lib/capture/presets"
import { cn } from "@/lib/utils"

const usageRules = [
  "Manifest states must map directly to timeline seconds. No dynamic timestamps allowed.",
  "Viewports simulate layout constraints only. Always perform native mobile browser validations.",
  "Raccourcis clavier (Arrows, ESC) are active only when focus is outside inputs and editable text blocks.",
  "Restore URLs contain all required state query parameters. Never embed sensitive authentication tokens in the URL.",
]

const limitations = [
  "Does not export video MP4 or images directly. Serves as a deterministic frame bridge for grabbers.",
  "Remotion integration configuration parameters are outputted in the manifest but not rendered in this phase.",
  "Simulated chrome borders are design references and might not align perfectly with specific vendor layouts.",
]

function CapturePageContent() {
  const { state, actions } = useCaptureBridge()
  const { activeScene, activeState } = state

  return (
    <div className="space-y-16">
      {/* ── 1. HERO — Core Workbench Presentation ────────── */}
      <section className="space-y-6" data-capture-section="hero">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Capture Bridge Systems
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-100 max-w-2xl leading-[1.05]">
            Build once. Reproduce every frame.
          </h2>
          <p className="text-sm sm:text-base text-stone-400 max-w-xl leading-relaxed">
            Name the state, control the viewport, remove the chrome, and return to the exact same frame.
          </p>
        </div>

        {/* Full Interactive Workbench */}
        <div className="space-y-6">
          <CaptureCleanView />
          <CaptureToolbar />
          
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
            <div className="space-y-6">
              <CaptureStage className="w-full" />
              <CaptureTimeline />
            </div>
            
            {/* Quick Simulation instructions in Hero */}
            <div className="rounded-lg border border-amber-900/40 bg-amber-955/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-400 font-bold">
                  Interactive Quick Walk
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Step 1: Baseline shows Proceed.<br />
                Step 2: Progress to &ldquo;Evidence Excluded&rdquo; below.<br />
                Step 3: Outcome updates to HOLD.<br />
                Step 4: Click &ldquo;Clean View&rdquo; in the toolbar to enter zero-chrome capture mode.
              </p>
              <div className="pt-2 border-t border-stone-850">
                <span className="font-mono text-[9px] text-stone-500 block uppercase">Current State</span>
                <span className="text-xs font-bold text-stone-200 block truncate">{activeState.label}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Preset Scenes selector list ──────────────── */}
      <section className="space-y-4" data-capture-section="scenes">
        <div className="border-b border-stone-800 pb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
            Select Capture Scenario Preset
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.values(capturePresets).map((preset) => {
            const isSelected = activeScene.id === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => actions.setScene(preset)}
                className={cn(
                  "flex flex-col text-left p-3.5 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
                  isSelected
                    ? "border-cyan-500/40 bg-stone-900 text-stone-100"
                    : "border-stone-850 bg-stone-950/40 text-stone-400 hover:border-stone-800 hover:text-stone-300"
                )}
                aria-pressed={isSelected}
              >
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  {preset.label}
                </span>
                <span className="text-[10px] text-stone-500 mt-1 block leading-normal line-clamp-2">
                  {preset.description}
                </span>
                <div className="flex items-center gap-2 mt-3 font-mono text-[9px] text-stone-600">
                  <span>{preset.states.length} states</span>
                  <span>·</span>
                  <span>{preset.viewport}</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── 3. Step lists and Checkpoints list ──────────── */}
      <section className="grid gap-6 lg:grid-cols-2" data-capture-section="checkpoints">
        <CaptureStateList />
        <CaptureStepList />
      </section>

      {/* ── 4. Restore URL Share panel ──────────────────── */}
      <section className="space-y-4" data-capture-section="restore-url">
        <CaptureUrlPanel />
      </section>

      {/* ── 5. Manifest export parameters ───────────────── */}
      <section className="grid gap-6 lg:grid-cols-3 items-start" data-capture-section="exports">
        <div className="lg:col-span-2">
          <CaptureManifestExport />
        </div>
        <CaptureInspector />
      </section>

      {/* ── 6. Keyboard Shortcuts documented ─────────────── */}
      <section className="rounded-xl border border-stone-800 bg-[#121110] p-6 md:p-8 space-y-6" data-capture-section="shortcuts">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Workspace</span>
          <h2 className="text-2xl font-bold tracking-tight text-stone-100 mt-1">Keyboard Shortcuts</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-lg flex items-center justify-between">
            <span className="text-stone-400">Next State</span>
            <kbd className="font-mono bg-stone-800 px-2 py-0.5 rounded text-stone-200 font-bold border border-stone-700">Right Arrow</kbd>
          </div>
          <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-lg flex items-center justify-between">
            <span className="text-stone-400">Previous State</span>
            <kbd className="font-mono bg-stone-800 px-2 py-0.5 rounded text-stone-200 font-bold border border-stone-700">Left Arrow</kbd>
          </div>
          <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-lg flex items-center justify-between">
            <span className="text-stone-400">Step Next Frame</span>
            <kbd className="font-mono bg-stone-800 px-2 py-0.5 rounded text-stone-200 font-bold border border-stone-700">Shift + Right</kbd>
          </div>
          <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-lg flex items-center justify-between">
            <span className="text-stone-400">Step Prev Frame</span>
            <kbd className="font-mono bg-stone-800 px-2 py-0.5 rounded text-stone-200 font-bold border border-stone-700">Shift + Left</kbd>
          </div>
          <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-lg flex items-center justify-between">
            <span className="text-stone-400">Toggle Clean View</span>
            <kbd className="font-mono bg-stone-800 px-2.5 py-0.5 rounded text-stone-200 font-bold border border-stone-700">C</kbd>
          </div>
          <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-lg flex items-center justify-between">
            <span className="text-stone-400">Reset Scenarios</span>
            <kbd className="font-mono bg-stone-800 px-2.5 py-0.5 rounded text-stone-200 font-bold border border-stone-700">R</kbd>
          </div>
          <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-lg flex items-center justify-between">
            <span className="text-stone-400">Toggle Inspector</span>
            <kbd className="font-mono bg-stone-800 px-2.5 py-0.5 rounded text-stone-200 font-bold border border-stone-700">I</kbd>
          </div>
          <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-lg flex items-center justify-between">
            <span className="text-stone-400">Toggle Notes</span>
            <kbd className="font-mono bg-stone-800 px-2.5 py-0.5 rounded text-stone-200 font-bold border border-stone-700">N</kbd>
          </div>
        </div>
      </section>

      {/* ── 7. Usage Rules ──────────────────────────────── */}
      <section className="rounded-xl border border-stone-800 bg-[#121110] p-6 md:p-8 space-y-6" data-capture-section="rules">
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

      {/* ── 8. Limitations ─────────────────────────────── */}
      <section className="rounded-xl border border-stone-800 bg-[#0e0d0c] p-6 md:p-8 space-y-6" data-capture-section="limitations">
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

export default function CapturePage() {
  return (
    <main className="min-h-screen bg-[#0a0a09] text-stone-100 selection:bg-cyan-400/20 selection:text-stone-100 font-sans">
      {/* Shared Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-[#0a0a09]/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stone-500 font-bold">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-stone-100">Capture Systems Workbench</h1>
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
        <CaptureProvider scene={capturePresets.evidenceDecision} initialStateId="baseline">
          <CapturePageContent />
        </CaptureProvider>
      </div>
    </main>
  )
}
