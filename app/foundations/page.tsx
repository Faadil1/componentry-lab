"use client"

import * as React from "react"
import { Check, Copy, MoonStar, SunMedium, Waves, LayoutGrid } from "lucide-react"
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
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70 ${
        active ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
      }`}
    >
      {children}
    </button>
  )
}

export default function FoundationsPage() {
  const [mode, setMode] = React.useState<"light" | "dark">("light")
  const [copied, setCopied] = React.useState<"none" | "ts" | "css">("none")
  const [motionReduced, setMotionReduced] = React.useState(false)

  const handleCopy = async (value: string, kind: "ts" | "css") => {
    await navigator.clipboard.writeText(value)
    setCopied(kind)
    window.setTimeout(() => setCopied("none"), 1800)
  }

  return (
    <main className={mode === "light" ? "min-h-screen bg-[#f3efe6] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100" : "min-h-screen bg-[#121110] text-stone-100 selection:bg-stone-100 selection:text-neutral-950"}>
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-inherit/90 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`font-mono text-xs uppercase tracking-[0.22em] ${mode === "light" ? "text-neutral-500" : "text-stone-400"}`}>Componentry Foundations</p>
            <h1 className="text-base font-semibold tracking-tight">Visual Systems Workbench</h1>
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

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" data-foundations-section="hero">
          <div className={`flex min-h-[540px] flex-col justify-between rounded-2xl border p-6 md:p-8 ${mode === "light" ? "border-stone-900 bg-[#121110] text-stone-100" : "border-stone-700 bg-[#0d0d0c] text-stone-100"}`}>
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-white/5 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  <LayoutGrid className="h-3.5 w-3.5" /> Foundation Workbench
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Typography + Color + Space + Motion</span>
              </div>
              <h2 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-tight text-white md:text-7xl">Tokens that keep the system readable, consistent, and exportable.</h2>
              <p className="max-w-2xl text-pretty text-sm leading-7 text-stone-300 md:text-base">A reusable foundation for semantic colors, spacing, surfaces, radius, elevation, and motion. The route is built for inspection, comparison, and export rather than decorative effect.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-800 bg-white/[0.04] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Canvas</p>
                <p className="mt-2 text-lg font-semibold text-white">Structured surfaces</p>
              </div>
              <div className="rounded-xl border border-stone-800 bg-white/[0.04] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Spacing</p>
                <p className="mt-2 text-lg font-semibold text-white">Page to inline scale</p>
              </div>
              <div className="rounded-xl border border-stone-800 bg-white/[0.04] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Motion</p>
                <p className="mt-2 text-lg font-semibold text-white">Deterministic tokens</p>
              </div>
            </div>
          </div>

          <aside className={`rounded-2xl border p-5 md:p-6 ${mode === "light" ? "border-stone-300 bg-[#eae6db] text-neutral-950" : "border-stone-700 bg-[#1a1816] text-stone-100"}`} aria-label="Foundation controls">
            <div className="flex items-start justify-between gap-4 border-b border-stone-300/80 pb-4">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Workbench controls</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">System preview</h2>
              </div>
              <div className="flex gap-2">
                <SegmentButton active={mode === "light"} onClick={() => setMode("light")}>Light</SegmentButton>
                <SegmentButton active={mode === "dark"} onClick={() => setMode("dark")}>Dark</SegmentButton>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Current state</p>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between border-b border-stone-300/70 pb-2">
                  <span>Color mode</span><span className="font-mono text-xs">{mode}</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-300/70 pb-2">
                  <span>Motion</span><span className="font-mono text-xs">{motionReduced ? "reduced" : "standard"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-300/70 pb-2">
                  <span>Tokens</span><span className="font-mono text-xs">colors, surfaces, spacing, radius, elevation, motion</span>
                </div>
              </div>
              <div className="rounded-xl border border-stone-300 bg-white/40 p-4 text-xs leading-6 text-neutral-700">
                Light and dark are direct previews of the semantic color set. Motion remains deterministic and does not require ongoing animation.
              </div>
            </div>
          </aside>
        </section>

        <section className="space-y-5" data-foundations-section="semantic-colors">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Semantic Colors</p>
              <h2 className="text-2xl font-semibold text-neutral-950">Clear and dark roles with usage notes.</h2>
            </div>
          </div>
          <SemanticColorPreview tokens={colorTokens} mode={mode} onModeChange={setMode} />
          <ColorTokenGrid tokens={colorTokens} />
        </section>

        <section className="space-y-5" data-foundations-section="surfaces">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Surfaces</p>
              <h2 className="text-2xl font-semibold text-neutral-950">Canvas to cinematic hierarchy.</h2>
            </div>
          </div>
          <SurfacePreview tokens={surfaceTokens} />
        </section>

        <section className="space-y-5" data-foundations-section="spacing">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Spacing</p>
              <h2 className="text-2xl font-semibold text-neutral-950">Inline, stack, layout, gutter.</h2>
            </div>
          </div>
          <SpacingScalePreview tokens={spacingTokens} />
        </section>

        <section className="space-y-5" data-foundations-section="radius">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Radius</p>
              <h2 className="text-2xl font-semibold text-neutral-950">Control through round.</h2>
            </div>
          </div>
          <RadiusPreview tokens={radiusTokens} />
        </section>

        <section className="space-y-5" data-foundations-section="elevation">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Elevation</p>
              <h2 className="text-2xl font-semibold text-neutral-950">Flat to cinematic, with restraint.</h2>
            </div>
          </div>
          <ElevationPreview tokens={elevationTokens} />
        </section>

        <section className="space-y-5" data-foundations-section="motion">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Motion</p>
              <h2 className="text-2xl font-semibold text-neutral-950">Durations and easings that stay deterministic.</h2>
            </div>
          </div>
          <MotionTokenPreview durations={motionDurationTokens} easings={motionEasingTokens} />
        </section>

        <section className="space-y-5" data-foundations-section="export">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Export</p>
              <h2 className="text-2xl font-semibold text-neutral-950">CSS custom properties and TypeScript.</h2>
            </div>
            <div className="flex gap-2">
              <button type="button" aria-pressed={copied === "ts"} onClick={() => handleCopy(tsExport, "ts")} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono font-semibold text-neutral-700 hover:border-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70">
                {copied === "ts" ? <><Check className="h-3.5 w-3.5" /> Copied TS</> : <><Copy className="h-3.5 w-3.5" /> Copy TS</>}
              </button>
              <button type="button" aria-pressed={copied === "css"} onClick={() => handleCopy(foundationTokensCss.trim(), "css")} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono font-semibold text-neutral-700 hover:border-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70">
                {copied === "css" ? <><Check className="h-3.5 w-3.5" /> Copied CSS</> : <><Copy className="h-3.5 w-3.5" /> Copy CSS</>}
              </button>
            </div>
          </div>
          <FoundationTokenExport css={foundationTokensCss.trim()} ts={tsExport} />
          <p className="text-xs leading-6 text-neutral-600">Copy feedback is announced via button labels and the export contents stay inside their own scroll container.</p>
        </section>

        <section className={`grid gap-6 rounded-2xl border p-6 md:grid-cols-[0.8fr_1.2fr] md:p-8 ${mode === "light" ? "border-stone-900 bg-[#121110] text-stone-100" : "border-stone-700 bg-[#0d0d0c] text-stone-100"}`} data-foundations-section="usage">
          <div className="space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Notes</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#f5f3ee]">Usage and limitations stay explicit.</h2>
          </div>
          <div className="grid gap-4">
            {usageNotes.map((note) => (
              <div key={note} className="rounded-xl border border-stone-800 bg-white/[0.04] p-4 text-sm leading-6 text-stone-200">{note}</div>
            ))}
            <div className="rounded-xl border border-stone-800 bg-white/[0.04] p-4 text-xs leading-6 text-stone-300">
              {limitations.map((note) => (
                <p key={note}>• {note}</p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
