"use client"

import * as React from "react"
import { BookOpenText, Check, Copy, Eye, Grid3X3, RotateCcw, SlidersHorizontal, Type } from "lucide-react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { FontSpecimen } from "@/components/typography/font-specimen"
import { NumericSpecimen } from "@/components/typography/numeric-specimen"
import { PairingPreview } from "@/components/typography/pairing-preview"
import { TypeScalePreview } from "@/components/typography/type-scale-preview"
import { TypographyTokenExport } from "@/components/typography/typography-token-export"
import { fontProfiles } from "@/lib/typography/fonts"
import { typographyRecipes } from "@/lib/typography/recipes"
import { typographyTokens } from "@/lib/typography/tokens"

type SpecimenMode = "editorial" | "product" | "broadcast"
type DensityMode = "roomy" | "standard" | "compact"

type Specimen = {
  label: string
  eyebrow: string
  headline: string
  body: string
  meta: string
}

const specimens: Record<SpecimenMode, Specimen> = {
  editorial: {
    label: "Editorial",
    eyebrow: "Case study / material notes",
    headline: "Interfaces become credible when typography carries intent before motion begins.",
    body: "A foundation for long-form prototypes, essays, decks and launch studies where hierarchy must hold still on the first captured frame.",
    meta: "Portfolio article - 09 min read",
  },
  product: {
    label: "Product",
    eyebrow: "Launch page / product system",
    headline: "Make consequence visible across every component demo.",
    body: "A disciplined type stack helps capture-ready interactions explain state, value and timing without leaning on decorative layout.",
    meta: "Componentry Lab - Product language",
  },
  broadcast: {
    label: "Broadcast",
    eyebrow: "Live moment / video capture",
    headline: "One typographic frame must survive compression, motion and silence.",
    body: "Broadcast captions, hero statements and reveal moments need short line lengths, stable metrics and deterministic final states.",
    meta: "Remotion target - 8 second hold",
  },
}

const densitySettings: Record<DensityMode, { label: string; sectionGap: string; bodyLeading: string; tracking: string }> = {
  roomy: { label: "Roomy", sectionGap: "gap-8", bodyLeading: "leading-8", tracking: "tracking-normal" },
  standard: { label: "Standard", sectionGap: "gap-6", bodyLeading: "leading-7", tracking: "tracking-normal" },
  compact: { label: "Compact", sectionGap: "gap-4", bodyLeading: "leading-6", tracking: "tracking-tight" },
}

const compositionRules = [
  "Use letter spacing only for small operational labels, never for paragraphs or large headlines.",
  "Keep hero copy under three lines at 390px wide before approving a capture moment.",
  "Prefer one strong typographic gesture per viewport; let components provide the motion.",
  "Use tabular numerals for counters, percentages, budgets and duration labels.",
]

function ToggleButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70 ${
        active
          ? "border-neutral-950 bg-neutral-950 text-white shadow-xs"
          : "border-stone-300 bg-stone-100/80 text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
      }`}
    >
      {children}
    </button>
  )
}

export default function TypographyFoundationPage() {
  const [specimenMode, setSpecimenMode] = React.useState<SpecimenMode>("editorial")
  const [density, setDensity] = React.useState<DensityMode>("standard")
  const [showGrid, setShowGrid] = React.useState(true)
  const [reduceMotion, setReduceMotion] = React.useState(false)
  const specimen = specimens[specimenMode]
  const densitySetting = densitySettings[density]

  return (
    <main className="min-h-screen bg-[#f2eee5] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f2eee5]/90 px-4 py-3 shadow-xs backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-500">Componentry Foundations</p>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">Typography Foundation</h1>
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
              onClick={() => setReduceMotion((value) => !value)}
              aria-pressed={reduceMotion}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition-all ${
                reduceMotion
                  ? "border-amber-500/60 bg-amber-50 text-amber-900 ring-1 ring-amber-400/30"
                  : "border-stone-300 bg-stone-100 text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {reduceMotion ? "Motion reduite" : "Motion standard"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]" data-typography-section="hero">
          <div className={`flex min-h-[560px] flex-col justify-between rounded-2xl border border-neutral-950 bg-[#11100f] p-6 text-stone-100 shadow-2xl md:p-10 ${densitySetting.sectionGap}`}>
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-500/60 bg-white/[0.04] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">
                <Type className="h-3.5 w-3.5" /> Capture-ready type system
              </span>
              <h2 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-normal text-[#fbfaf6] md:text-7xl">
                Typography before animation.
              </h2>
              <p className={`max-w-xl text-pretty text-base text-stone-300 ${densitySetting.bodyLeading} ${densitySetting.tracking}`}>
                A practical foundation for Componentry demos: stable hierarchy, deterministic specimens, readable final frames and compositional rules that survive mobile capture.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <NumericSpecimen label="Primary family" value="Inter / Geist fallback" />
              <NumericSpecimen label="Numeric style" value="Tabular where measured" />
              <NumericSpecimen label="Capture target" value="390x844 + 1440x1200" />
            </div>
          </div>

          <aside className="rounded-2xl border border-stone-300 bg-[#e6dfd1] p-5 shadow-sm" aria-label="Typography controls">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Specimen Controls</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Deterministic preview</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSpecimenMode("editorial")
                  setDensity("standard")
                  setShowGrid(true)
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Mode</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(specimens) as SpecimenMode[]).map((mode) => (
                    <ToggleButton key={mode} active={specimenMode === mode} onClick={() => setSpecimenMode(mode)}>
                      {specimens[mode].label}
                    </ToggleButton>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Density</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(densitySettings) as DensityMode[]).map((mode) => (
                    <ToggleButton key={mode} active={density === mode} onClick={() => setDensity(mode)}>
                      {densitySettings[mode].label}
                    </ToggleButton>
                  ))}
                </div>
              </div>

              <ToggleButton active={showGrid} onClick={() => setShowGrid((value) => !value)}>
                <Grid3X3 className="h-3.5 w-3.5" /> Baseline overlay
              </ToggleButton>
            </div>
          </aside>
        </section>

        <section className="overflow-hidden rounded-2xl border border-stone-300 bg-[#fbfaf6] shadow-sm" data-typography-section="specimen">
          <div className="border-b border-stone-300 bg-stone-100/70 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                <Eye className="h-4 w-4" /> Live specimen
              </div>
              <span className="font-mono text-xs text-neutral-500">{specimen.meta}</span>
            </div>
          </div>
          <div className={`relative p-6 md:p-10 ${showGrid ? "bg-[linear-gradient(to_bottom,rgba(120,113,108,0.14)_1px,transparent_1px)] bg-[length:100%_28px]" : ""}`}>
            <div className={`max-w-4xl ${densitySetting.sectionGap} flex flex-col`}>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{specimen.eyebrow}</p>
              <h2 className="text-balance text-4xl font-semibold leading-[1.04] tracking-normal text-neutral-950 md:text-6xl">{specimen.headline}</h2>
              <p className={`max-w-2xl text-pretty text-base text-neutral-700 ${densitySetting.bodyLeading}`}>{specimen.body}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5" data-typography-section="tokens">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Scale Tokens</p>
              <h2 className="mt-2 max-w-xl text-balance text-3xl font-semibold tracking-tight">Roles, not decoration.</h2>
            </div>
            <span className="hidden rounded-full border border-stone-300 bg-stone-100 px-3 py-1 font-mono text-xs text-neutral-500 md:inline-flex">5 core roles</span>
          </div>

          <TypeScalePreview scale={typographyTokens.scale} />
        </section>

        <section className="grid gap-6 rounded-2xl border border-neutral-950 bg-neutral-950 p-6 text-stone-100 md:grid-cols-[0.7fr_1.3fr] md:p-8" data-typography-section="rules">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Composition Rules</p>
            <h2 className="mt-2 max-w-xl text-balance text-3xl font-semibold tracking-tight">Useful constraints for 40+ future demos.</h2>
          </div>
          <div className="grid gap-3">
            {compositionRules.map((rule) => (
              <div key={rule} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-stone-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p className="text-pretty">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3" data-typography-section="capture">
          <div className="rounded-xl border border-stone-300 bg-[#e8e1d4] p-5">
            <BookOpenText className="h-5 w-5 text-neutral-700" />
            <h2 className="mt-4 text-xl font-semibold">Semantic first</h2>
            <p className="mt-2 text-pretty text-sm leading-6 text-neutral-600">Headings remain ordered, controls are buttons, and specimens use real content rather than placeholder prose.</p>
          </div>
          <div className="rounded-xl border border-stone-300 bg-[#e8e1d4] p-5">
            <Copy className="h-5 w-5 text-neutral-700" />
            <h2 className="mt-4 text-xl font-semibold">Capture stable</h2>
            <p className="mt-2 text-pretty text-sm leading-6 text-neutral-600">No random values, no time-based copy, and the default specimen is deterministic for Playwright and Remotion framing.</p>
          </div>
          <div className="rounded-xl border border-stone-300 bg-[#e8e1d4] p-5">
            <SlidersHorizontal className="h-5 w-5 text-neutral-700" />
            <h2 className="mt-4 text-xl font-semibold">Motion aware</h2>
            <p className="mt-2 text-pretty text-sm leading-6 text-neutral-600">The foundation exposes the same motion control language as the labs, even though the page itself stays intentionally still.</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" data-typography-section="profiles">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {fontProfiles.map((profile) => (
              <FontSpecimen key={profile.family} profile={profile} />
            ))}
          </div>
          <div className="grid gap-4">
            {typographyRecipes.map((recipe) => (
              <PairingPreview key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>

        <TypographyTokenExport />
      </div>
    </main>
  )
}
