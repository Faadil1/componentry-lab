"use client"

import * as React from "react"
import { MoonStar, SunMedium, Waves, LayoutGrid, FileText, Settings, Columns, ShieldAlert } from "lucide-react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { LayoutShell } from "@/components/layouts/layout-shell"
import { LayoutContainer } from "@/components/layouts/layout-container"
import { LayoutStack } from "@/components/layouts/layout-stack"
import { LayoutCluster } from "@/components/layouts/layout-cluster"
import { LayoutGrid as PrimitiveGrid } from "@/components/layouts/layout-grid"
import { LayoutSplit } from "@/components/layouts/layout-split"
import { LayoutSidebar } from "@/components/layouts/layout-sidebar"
import { LayoutRail } from "@/components/layouts/layout-rail"
import { LayoutStage } from "@/components/layouts/layout-stage"
import { LayoutInspector } from "@/components/layouts/layout-inspector"
import { LayoutTokenExport } from "@/components/layouts/layout-token-export"
import { layoutTokens, layoutTokensCss } from "@/lib/layouts/tokens"
import { layoutPresets } from "@/lib/layouts/presets"
import type { LayoutDensity } from "@/lib/layouts/types"

const tsExport = `export const layoutTokens = ${JSON.stringify(layoutTokens, null, 2)} as const`

const usageNotes = [
  "Prioritize LayoutContainer reading for text columns to preserve reading attention.",
  "Leverage LayoutSidebar for operational SaaS headers without heavy script boundaries.",
  "Never hardcode static margins inside components; leverage LayoutStack vertical rhythm instead.",
]

const limitations = [
  "Layout systems do not claim automated compliance calculations for contrast boundaries.",
  "Safe area overlays are guidelines for broadcast and slides; real viewports remain dominant.",
]

export default function LayoutsPage() {
  const [mode, setMode] = React.useState<"light" | "dark">("light")
  const [density, setDensity] = React.useState<LayoutDensity>("standard")
  const [guides, setGuides] = React.useState<"off" | "columns" | "full">("off")
  const [viewport, setViewport] = React.useState<"desktop" | "tablet" | "mobile">("desktop")
  const [safeAreaControl, setSafeAreaControl] = React.useState<"off" | "interface" | "broadcast">("off")
  const [motionReduced, setMotionReduced] = React.useState(false)

  // Map viewport states to simulated wrapper widths
  const viewportWidths = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[390px]",
  }

  return (
    <main
      className={
        mode === "light"
          ? "min-h-screen bg-[#f3efe6] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100 transition-colors duration-300"
          : "min-h-screen bg-[#121110] text-stone-100 selection:bg-stone-100 selection:text-neutral-950 transition-colors duration-300"
      }
    >
      <LayoutShell
        header={
          <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-inherit/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className={`font-mono text-xs uppercase tracking-[0.22em] ${mode === "light" ? "text-neutral-500" : "text-stone-400"} font-bold`}>
                  Layout Foundation
                </p>
                <h1 className="text-base font-bold tracking-tight">Spatial Systems Workbench</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <LabNavigation
                  className="contents"
                  linkClassName="px-3.5"
                  activeClassName="bg-neutral-950 font-semibold text-white shadow-xs"
                  inactiveClassName="border border-stone-300 bg-stone-100/80 text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950"
                />
                <button
                  type="button"
                  aria-pressed={motionReduced}
                  onClick={() => setMotionReduced((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition ${
                    motionReduced ? "border-amber-500/60 bg-amber-50 text-amber-900" : "border-stone-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
                  }`}
                >
                  <Waves className="h-3.5 w-3.5" />
                  {motionReduced ? "Reduced motion" : "Motion standard"}
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "light"}
                  onClick={() => setMode("light")}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition ${
                    mode === "light" ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
                  }`}
                >
                  <SunMedium className="h-3.5 w-3.5" /> Light
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "dark"}
                  onClick={() => setMode("dark")}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition ${
                    mode === "dark" ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
                  }`}
                >
                  <MoonStar className="h-3.5 w-3.5" /> Dark
                </button>
              </div>
            </div>
          </header>
        }
      >
        <LayoutContainer size="wide" className="py-8 md:py-12">
          {/* Simulated Viewport Specimen Boundary */}
          <div className={`mx-auto border border-dashed border-stone-400/50 rounded-2xl overflow-hidden transition-all duration-300 ${viewportWidths[viewport]}`}>
            <LayoutInspector
              active={guides !== "off"}
              columns={guides === "columns" || guides === "full"}
              gutters={guides === "full"}
              safeAreas={guides === "full"}
              density={density}
            >
              <LayoutStack gap="section">
                {/* 1. HERO — VISUAL GRIDS */}
                <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]" data-layouts-section="hero">
                  <div className={`flex min-h-[500px] flex-col justify-between rounded-xl border p-6 md:p-8 ${mode === "light" ? "border-stone-900 bg-[#121110] text-stone-100 shadow-2xl" : "border-stone-850 bg-[#0d0d0c] text-stone-100"}`}>
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-[#1c1a18] px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                          <LayoutGrid className="h-3.5 w-3.5" /> Layout System
                        </span>
                        <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest bg-stone-900 px-2 py-0.5 rounded">
                          Structure before decoration.
                        </span>
                      </div>
                      <h2 className="max-w-3xl text-balance text-4xl font-bold leading-[0.98] tracking-tight text-white md:text-6xl">
                        Clean layouts, dynamic spacing, and strict page grids.
                      </h2>
                      <p className="max-w-2xl text-xs md:text-sm leading-relaxed text-stone-305">
                        A framework of 10 layout primitives built to unify page geometry, margins, safe zone overlays, and sidebars across modern devices.
                      </p>
                    </div>

                    <div className="bg-[#1c1b18] border border-stone-800 p-6 rounded-xl space-y-4">
                      <span className="font-mono text-[9px] text-stone-400 block">[Nested Container // Gutter Standard]</span>
                      <div className="bg-[#121110] border border-stone-800 p-4 rounded-lg flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] text-cyan-300 block">[Grid Column // 12-cols Preset]</span>
                          <p className="text-xs font-bold text-white">Spatial Grid System</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. INSTRUMENTATION CONTROLS */}
                  <aside className={`rounded-xl border p-6 flex flex-col justify-between space-y-6 ${mode === "light" ? "border-stone-300 bg-[#eae6db] text-neutral-950" : "border-stone-800 bg-[#1a1816] text-stone-100"}`} aria-label="Workbench controls">
                    <div className="space-y-5">
                      <div className="border-b border-stone-300 pb-3">
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Workbench Controls</p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">Spatial options</h2>
                      </div>

                      {/* Density selectors */}
                      <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase text-neutral-500 font-bold flex items-center gap-1.5">
                          <Settings className="h-3.5 w-3.5" /> Layout Density
                        </span>
                        <div className="flex flex-wrap gap-1.5 bg-[#161513]/10 p-1 rounded-lg">
                          {(["compact", "standard", "spacious"] as LayoutDensity[]).map((d) => (
                            <button
                              key={d}
                              type="button"
                              aria-pressed={density === d}
                              onClick={() => setDensity(d)}
                              className={`flex-1 px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition ${
                                density === d ? "bg-neutral-950 text-white shadow-xs" : "text-neutral-600 hover:text-neutral-950"
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Grid Guides */}
                      <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase text-neutral-500 font-bold flex items-center gap-1.5">
                          <Columns className="h-3.5 w-3.5" /> Visual Guides
                        </span>
                        <div className="flex flex-wrap gap-1.5 bg-[#161513]/10 p-1 rounded-lg">
                          {(["off", "columns", "full"] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              aria-pressed={guides === g}
                              onClick={() => setGuides(g)}
                              className={`flex-1 px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition ${
                                guides === g ? "bg-neutral-950 text-white shadow-xs" : "text-neutral-600 hover:text-neutral-950"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Viewport simulation */}
                      <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase text-neutral-500 font-bold flex items-center gap-1.5">
                          <LayoutGrid className="h-3.5 w-3.5" /> Viewport Specimen
                        </span>
                        <div className="flex flex-wrap gap-1.5 bg-[#161513]/10 p-1 rounded-lg">
                          {(["desktop", "tablet", "mobile"] as const).map((v) => (
                            <button
                              key={v}
                              type="button"
                              aria-pressed={viewport === v}
                              onClick={() => setViewport(v)}
                              className={`flex-1 px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition ${
                                viewport === v ? "bg-neutral-950 text-white shadow-xs" : "text-neutral-600 hover:text-neutral-950"
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Safe Areas */}
                      <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase text-neutral-500 font-bold flex items-center gap-1.5">
                          <ShieldAlert className="h-3.5 w-3.5" /> Safe areas overlay
                        </span>
                        <div className="flex flex-wrap gap-1.5 bg-[#161513]/10 p-1 rounded-lg">
                          {(["off", "interface", "broadcast"] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              aria-pressed={safeAreaControl === s}
                              onClick={() => setSafeAreaControl(s)}
                              className={`flex-1 px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition ${
                                safeAreaControl === s ? "bg-neutral-950 text-white shadow-xs" : "text-neutral-600 hover:text-neutral-950"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-stone-300 bg-stone-150 p-4 font-mono text-[11px] text-neutral-600 leading-relaxed">
                      Select options above to inspect real-time boundaries, padding limits, and safe-area overlaps inside the simulator.
                    </div>
                  </aside>
                </section>

                {/* 3. PRIMITIVES INSPECTION BROWSER */}
                <section className="space-y-6">
                  <div className="border-b border-stone-300 pb-3">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Primitives Specifications</p>
                    <h2 className="text-2xl font-bold text-neutral-950">Structural Primitives components.</h2>
                  </div>

                  <PrimitiveGrid columns={2} gap="grid">
                    {/* Shell */}
                    <div className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 space-y-4">
                      <span className="font-mono text-[10px] font-bold text-cyan-700 uppercase tracking-widest block">LayoutShell</span>
                      <p className="text-xs text-neutral-700 leading-relaxed">
                        Structures header, sidebar, footer, and main content regions in a flexible, viewport-fitting container.
                      </p>
                    </div>

                    {/* Container */}
                    <div className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 space-y-4">
                      <span className="font-mono text-[10px] font-bold text-cyan-700 uppercase tracking-widest block">LayoutContainer</span>
                      <p className="text-xs text-neutral-700 leading-relaxed">
                        Standardizes content reading widths (compact, reading, standard, wide, full) with responsive padding gutters.
                      </p>
                    </div>

                    {/* Stack */}
                    <div className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 space-y-4">
                      <span className="font-mono text-[10px] font-bold text-cyan-700 uppercase tracking-widest block">LayoutStack</span>
                      <p className="text-xs text-neutral-700 leading-relaxed">
                        Generates vertical alignment stacks with structured rhythm margins and separating borders.
                      </p>
                    </div>

                    {/* Cluster */}
                    <div className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 space-y-4">
                      <span className="font-mono text-[10px] font-bold text-cyan-700 uppercase tracking-widest block">LayoutCluster</span>
                      <p className="text-xs text-neutral-700 leading-relaxed">
                        Groups horizontal tag badges, setting inputs, metadata labels, and actions with wrap capabilities.
                      </p>
                    </div>
                  </PrimitiveGrid>
                </section>

                {/* 4. SIDEBAR & SPLIT LAYOUT PREVIEW */}
                <section className="space-y-6">
                  <div className="border-b border-stone-300 pb-3">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Applied Sidebar &amp; Split Assemblies</p>
                    <h2 className="text-2xl font-bold text-neutral-950">Fluid Sidebars and Split Compositions.</h2>
                  </div>

                  <LayoutSidebar
                    sidebarWidth="280px"
                    sidebar={
                      <div className="rounded-xl border border-stone-300 bg-[#eae6db] p-5 space-y-3">
                        <span className="font-mono text-[9px] uppercase text-neutral-500 font-bold block">SIDEBAR BLOCK</span>
                        <p className="text-xs text-neutral-800">
                          Sidebar collapses natively on small mobile widths without JavaScript window listening.
                        </p>
                      </div>
                    }
                  >
                    <LayoutSplit ratio="1:1" gap="grid">
                      <div className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 space-y-3">
                        <span className="font-mono text-[9px] text-cyan-700 font-bold uppercase block">Split Left (1:1)</span>
                        <p className="text-xs text-neutral-700 leading-relaxed">
                          Ideal for displaying high-contrast descriptions alongside media elements or verification logs.
                        </p>
                      </div>
                      <div className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 space-y-3">
                        <span className="font-mono text-[9px] text-cyan-700 font-bold uppercase block">Split Right (1:1)</span>
                        <p className="text-xs text-neutral-700 leading-relaxed">
                          Natively reverses layout ordering and collapses stack alignment under standard breakpoints.
                        </p>
                      </div>
                    </LayoutSplit>
                  </LayoutSidebar>
                </section>

                {/* 5. RAIL SYSTEM GALLERY */}
                <section className="space-y-6">
                  <div className="border-b border-stone-300 pb-3">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Horizontal Rails</p>
                    <h2 className="text-2xl font-bold text-neutral-950">Horizontal scroll galleries with snapping.</h2>
                  </div>

                  <LayoutRail snap={true}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-[280px] bg-[#fbfaf6] border border-stone-300 p-6 rounded-xl space-y-3 mr-4">
                        <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase block">SPECIMEN 0{i + 1}</span>
                        <p className="text-xs text-neutral-700 leading-relaxed">
                          Scroll lists support horizontal snaps and margins without overflow.
                        </p>
                      </div>
                    ))}
                  </LayoutRail>
                </section>

                {/* 6. PRESENTATION STAGE */}
                <section className="space-y-6">
                  <div className="border-b border-stone-300 pb-3">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Interactive Product Stage</p>
                    <h2 className="text-2xl font-bold text-neutral-950">Aspect Ratio Showcase with Safe Areas.</h2>
                  </div>

                  <LayoutStage
                    ratio="16:9"
                    safeArea={safeAreaControl}
                    titleLabel="Product Showcase 16:9 Aspect"
                    lowerThird="Stage Lower Third annotation description."
                  >
                    <div className="text-center space-y-2">
                      <p className="font-mono text-xs text-cyan-300 uppercase tracking-widest">Interactive Video Area</p>
                      <p className="text-stone-400 text-xs">Safe overlays are set to: {safeAreaControl.toUpperCase()}</p>
                    </div>
                  </LayoutStage>
                </section>

                {/* 7. PRESETS PREVIEW SECTOR */}
                <section className="space-y-6">
                  <div className="border-b border-stone-300 pb-3">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Composition Presets</p>
                    <h2 className="text-2xl font-bold text-neutral-950">Four integrated layout templates.</h2>
                  </div>

                  <PrimitiveGrid columns={2} gap="grid">
                    {layoutPresets.map((preset) => (
                      <div key={preset.name} className="bg-[#fbfaf6] border border-stone-300 p-6 rounded-xl space-y-4">
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] text-cyan-700 font-bold uppercase tracking-widest block">
                            {preset.category.toUpperCase()} PRESET
                          </span>
                          <h4 className="text-lg font-bold text-neutral-900">{preset.name}</h4>
                        </div>
                        <p className="text-xs text-neutral-700 leading-relaxed">{preset.description}</p>
                        <LayoutCluster gap="inline" className="pt-3 border-t border-stone-205 text-[10px] font-mono">
                          {preset.structure.primitives.map((p) => (
                            <span key={p} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                              {p}
                            </span>
                          ))}
                        </LayoutCluster>
                      </div>
                    ))}
                  </PrimitiveGrid>
                </section>

                {/* 8. TOKENS EXPORTER */}
                <LayoutTokenExport css={layoutTokensCss} ts={tsExport} />

                {/* 9. TECHNICAL NOTES */}
                <section className="rounded-xl border border-stone-300 bg-[#eae6db] p-6 md:p-8 space-y-6" data-layouts-section="usage">
                  <div className="border-b border-stone-300 pb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-700" />
                    <h2 className="text-xl font-bold text-neutral-900 font-mono uppercase tracking-wider">
                      Layout Guidelines &amp; Specs
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 text-xs leading-relaxed text-neutral-700">
                    <div className="space-y-3">
                      <p className="font-bold text-neutral-900 uppercase font-mono tracking-wider">Recommended Usage</p>
                      {usageNotes.map((note) => (
                        <div key={note} className="flex gap-2">
                          <span className="text-cyan-700 font-bold">•</span>
                          <p>{note}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <p className="font-bold text-neutral-900 uppercase font-mono tracking-wider">System Limitations</p>
                      {limitations.map((note) => (
                        <div key={note} className="flex gap-2 text-neutral-600">
                          <span>•</span>
                          <p>{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </LayoutStack>
            </LayoutInspector>
          </div>
        </LayoutContainer>
      </LayoutShell>
    </main>
  )
}
