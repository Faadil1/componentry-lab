"use client"

import * as React from "react"
import { MoonStar, SunMedium, Waves, LayoutGrid, AlertCircle, FileText } from "lucide-react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { ColorTokenGrid } from "@/components/foundations/color-token-grid"
import { SemanticColorPreview } from "@/components/foundations/semantic-color-preview"
import { SurfacePreview } from "@/components/foundations/surface-preview"
import { SpacingScalePreview } from "@/components/foundations/spacing-scale-preview"
import { RadiusPreview } from "@/components/foundations/radius-preview"
import { ElevationPreview } from "@/components/foundations/elevation-preview"
import { MotionTokenPreview } from "@/components/foundations/motion-token-preview"
import { FoundationTokenExport } from "@/components/foundations/foundation-token-export"
import { foundationTokens, foundationTokensCss } from "@/lib/foundations"
import { motionDurationTokens, motionEasingTokens } from "@/lib/foundations/motion"
import { colorTokens } from "@/lib/foundations/colors"
import { surfaceTokens } from "@/lib/foundations/surfaces"
import { spacingTokens } from "@/lib/foundations/spacing"
import { radiusTokens } from "@/lib/foundations/radius"
import { elevationTokens } from "@/lib/foundations/elevation"

const tsExport = `export const foundationTokens = ${JSON.stringify(foundationTokens, null, 2)} as const`

const usageNotes = [
  "Use semantic tokens first; treat raw color values as implementation detail.",
  "Keep spacing, radius, and elevation aligned across sections so the system reads as one language.",
  "Favor clear surfaces and restrained shadow depth before decorative polish.",
  "All previews are deterministic and respect reduced-motion defaults.",
]

const limitations = [
  "The system documents intended combinations, not automated accessibility compliance claims.",
  "Motion tokens describe duration and easing only; route animation behavior stays intentionally minimal.",
  "The preview panels are designed for inspection, not as a full component gallery.",
]

function SegmentButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-mono font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
        active ? "border-neutral-950 bg-neutral-950 text-white shadow-xs" : "border-stone-300 bg-white text-neutral-700 hover:border-stone-500 hover:text-neutral-950"
      }`}
    >
      {children}
    </button>
  )
}

export default function FoundationsPage() {
  const [mode, setMode] = React.useState<"light" | "dark">("light")
  const [motionReduced, setMotionReduced] = React.useState(false)

  return (
    <main className={mode === "light" ? "min-h-screen bg-[#f3efe6] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100 font-sans" : "min-h-screen bg-[#121110] text-stone-100 selection:bg-stone-100 selection:text-neutral-950 font-sans"}>
      {/* Shared Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-inherit/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`font-mono text-xs uppercase tracking-[0.22em] ${mode === "light" ? "text-neutral-500" : "text-stone-400"} font-bold`}>Componentry Foundations</p>
            <h1 className="text-base font-bold tracking-tight">Visual Systems Workbench</h1>
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
              onClick={() => setMotionReduced((value) => !value)}
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
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition ${mode === "light" ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"}`}
            >
              <SunMedium className="h-3.5 w-3.5" /> Light
            </button>
            <button
              type="button"
              aria-pressed={mode === "dark"}
              onClick={() => setMode("dark")}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition ${mode === "dark" ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"}`}
            >
              <MoonStar className="h-3.5 w-3.5" /> Dark
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-8 md:px-8 md:py-12">
        {/* 1. HERO — VISUAL FOUNDATIONS SPECIMEN GRID */}
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" data-foundations-section="hero">
          {/* Specimen Layer mockup */}
          <div className={`flex min-h-[560px] flex-col justify-between rounded-xl border p-6 md:p-10 ${mode === "light" ? "border-stone-900 bg-[#121110] text-stone-100 shadow-2xl" : "border-stone-850 bg-[#0d0d0c] text-stone-100"}`}>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-[#1c1a18] px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  <LayoutGrid className="h-3.5 w-3.5" /> Visual Specimen Panel
                </span>
                <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest bg-stone-900 px-2 py-0.5 rounded">
                  [Canvas: bg-canvas] [Space: 16px] [Radius: control / panel]
                </span>
              </div>
              <h2 className="max-w-3xl text-balance text-4xl font-bold leading-[0.98] tracking-tight text-white md:text-6xl">
                Tokens that keep the system readable, consistent, and exportable.
              </h2>
              <p className="max-w-2xl text-xs md:text-sm leading-relaxed text-stone-300 font-sans">
                A reusable foundation for semantic colors, spacing, surfaces, radius, elevation, and motion. The route is built for inspection, comparison, and export rather than decorative effect.
              </p>
            </div>

            {/* Nested Mockup Composition */}
            <div className="bg-[#1c1b18] border border-stone-800 p-6 rounded-xl space-y-4">
              <span className="font-mono text-[9px] text-stone-400 block">[bg-canvas // space-gutter]</span>

              <div className="bg-[#121110] border border-stone-800 p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-cyan-300 block">[bg-surface // radius-control]</span>
                  <p className="text-xs font-bold text-white">Visual Alignment Matrix</p>
                </div>
                <span className="rounded bg-cyan-950 border border-cyan-800 px-3 py-1 font-mono text-[10px] text-cyan-300 font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Workbench instrumentation controls */}
          <aside className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between space-y-6 ${mode === "light" ? "border-stone-300 bg-[#eae6db] text-neutral-950" : "border-stone-800 bg-[#1a1816] text-stone-100"}`} aria-label="Foundation controls">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-stone-300 pb-3">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Workbench Controls</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">System preview</h2>
                </div>
                <div className="flex gap-1.5">
                  <SegmentButton active={mode === "light"} onClick={() => setMode("light")}>Light</SegmentButton>
                  <SegmentButton active={mode === "dark"} onClick={() => setMode("dark")}>Dark</SegmentButton>
                </div>
              </div>

              {/* Specs parameters */}
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <span>Color mode</span>
                  <span className="font-bold text-neutral-900">{mode.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <span>Motion standard</span>
                  <span className="font-bold text-neutral-900">{motionReduced ? "REDUCED" : "ACTIVE"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <span>Core categories</span>
                  <span className="font-bold text-neutral-900">6 sets</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-stone-300 bg-stone-150 p-4 font-mono text-[11px] text-neutral-600 leading-relaxed">
              Light and dark modes produce direct previews of the semantic color set. Motion transitions respect standard accessibility rules and reduce timing on request.
            </div>
          </aside>
        </section>

        {/* 2. SEMANTIC COLORS */}
        <section className="space-y-6" data-foundations-section="semantic-colors">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Semantic Colors</p>
              <h2 className="text-2xl font-bold text-neutral-950">Clear and dark roles with usage notes.</h2>
            </div>
          </div>
          <SemanticColorPreview tokens={colorTokens} mode={mode} onModeChange={setMode} />
          <ColorTokenGrid tokens={colorTokens} />
        </section>

        {/* 3. SURFACES */}
        <section className="space-y-6" data-foundations-section="surfaces">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Surfaces</p>
              <h2 className="text-2xl font-bold text-neutral-950">Canvas to cinematic hierarchy.</h2>
            </div>
          </div>
          <SurfacePreview tokens={surfaceTokens} />
        </section>

        {/* 4. SPACING */}
        <section className="space-y-6" data-foundations-section="spacing">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Spacing Scale</p>
              <h2 className="text-2xl font-bold text-neutral-950">Inline, stack, layout, gutter metrics.</h2>
            </div>
          </div>
          <SpacingScalePreview tokens={spacingTokens} />
        </section>

        {/* 5. RADIUS */}
        <section className="space-y-6" data-foundations-section="radius">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Radius System</p>
              <h2 className="text-2xl font-bold text-neutral-950">Control through round specs.</h2>
            </div>
          </div>
          <RadiusPreview tokens={radiusTokens} />
        </section>

        {/* 6. ELEVATION */}
        <section className="space-y-6" data-foundations-section="elevation">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Elevation System</p>
              <h2 className="text-2xl font-bold text-neutral-950">Flat to cinematic depth.</h2>
            </div>
          </div>
          <ElevationPreview tokens={elevationTokens} />
        </section>

        {/* 7. MOTION */}
        <section className="space-y-6" data-foundations-section="motion">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Motion System</p>
              <h2 className="text-2xl font-bold text-neutral-950">Deterministic durations and easing paths.</h2>
            </div>
          </div>
          <MotionTokenPreview durations={motionDurationTokens} easings={motionEasingTokens} />
        </section>

        {/* 8. TOKEN EXPORT */}
        <FoundationTokenExport css={foundationTokensCss.trim()} ts={tsExport} />

        {/* 9. NOTES AND LIMITATIONS */}
        <section className="rounded-xl border border-stone-300 bg-[#eae6db] p-6 md:p-8 space-y-6" data-foundations-section="usage">
          <div className="border-b border-stone-300 pb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-700" />
            <h2 className="text-xl font-bold text-neutral-900 font-mono uppercase tracking-wider">System Specifications &amp; Notes</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 text-xs leading-relaxed text-neutral-700">
            {/* Recommended guidelines */}
            <div className="space-y-3">
              <p className="font-bold text-neutral-900 uppercase font-mono tracking-wider">Recommended Usage</p>
              {usageNotes.map((note) => (
                <div key={note} className="flex gap-2">
                  <span className="text-cyan-700 font-bold">•</span>
                  <p>{note}</p>
                </div>
              ))}
            </div>

            {/* Technical limits */}
            <div className="space-y-3">
              <p className="font-bold text-neutral-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" /> System Limitations
              </p>
              {limitations.map((note) => (
                <div key={note} className="flex gap-2 text-neutral-600">
                  <span>•</span>
                  <p>{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
