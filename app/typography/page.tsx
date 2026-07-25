"use client"

import * as React from "react"
import { BookOpenText, Check, Copy, Eye, Grid3X3, RotateCcw, SlidersHorizontal, Type, FileText } from "lucide-react"
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
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-mono font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70 ${
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
    <main className="min-h-screen bg-[#f3efe6] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100 font-sans">
      {/* Shared Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f3efe6]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-500 font-bold">Componentry Foundations</p>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">Typography Systems Workbench</h1>
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
              {reduceMotion ? "Motion réduite" : "Motion standard"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-8 md:px-8 md:py-12">
        {/* 1. HERO — TYPOGRAPHY FOUNDATION (SCÈNE DOMINANTE SYSTEM PREVIEW) */}
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" data-typography-section="hero">
          {/* Specimen Stage */}
          <div
            className={`relative flex min-h-[580px] flex-col justify-between rounded-xl border border-stone-900 bg-[#121110] p-6 text-stone-100 shadow-2xl md:p-10 ${
              densitySetting.sectionGap
            } ${showGrid ? "bg-[linear-gradient(to_bottom,rgba(103,232,249,0.06)_1px,transparent_1px)] bg-[length:100%_28px]" : ""}`}
          >
            {/* Header Specs Overlay */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-[#1b1c1e] px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  <Type className="h-3.5 w-3.5" /> Foundation Specimen
                </span>
                <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest bg-stone-900 px-2 py-0.5 rounded">
                  [Role: Display] [Scale: 7xl] [Measure: 66ch] [Tracking: normal] [Line-Height: 0.98]
                </span>
              </div>

              {/* Giant display headline */}
              <h2 className="max-w-3xl text-balance text-5xl font-bold leading-[0.98] tracking-tight text-white md:text-7xl">
                Typography before animation.
              </h2>

              {/* Specimen blocks (FR & EN) */}
              <div className="space-y-4 pt-4 border-t border-stone-850">
                <div>
                  <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Français (Specimen)</span>
                  <p className="text-sm md:text-base text-stone-200 leading-relaxed max-w-[66ch]">
                    Les interfaces deviennent crédibles lorsque la typographie porte l’intention avant même que le mouvement ne commence.
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest block mb-1">English (Specimen)</span>
                  <p className="text-sm md:text-base text-stone-200 leading-relaxed max-w-[66ch]">
                    Interfaces become credible when typography carries intent before motion begins.
                  </p>
                </div>
              </div>
            </div>

            {/* Tabular numeric block in Hero */}
            <div className="grid gap-4 sm:grid-cols-3 pt-6 border-t border-stone-850">
              <NumericSpecimen label="Primary family" value="Inter / Geist" />
              <NumericSpecimen label="Numeric stack" value="Tabular-Nums" />
              <NumericSpecimen label="Metric Target" value="1,284,590.00 / 08.43s" />
            </div>
          </div>

          {/* Workbench Instrumentation Panel */}
          <aside className="rounded-xl border border-stone-300 bg-[#eae6db] p-6 shadow-sm flex flex-col justify-between space-y-6" aria-label="Typography controls">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-stone-300 pb-3">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Workbench Controls</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">Deterministic Preview</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSpecimenMode("editorial")
                    setDensity("standard")
                    setShowGrid(true)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-mono font-bold text-neutral-700 hover:border-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>

              {/* Instrumentation settings */}
              <div className="space-y-5">
                <div>
                  <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Preview Mode</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(specimens) as SpecimenMode[]).map((mode) => (
                      <ToggleButton key={mode} active={specimenMode === mode} onClick={() => setSpecimenMode(mode)}>
                        {specimens[mode].label}
                      </ToggleButton>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Density spacing</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(densitySettings) as DensityMode[]).map((mode) => (
                      <ToggleButton key={mode} active={density === mode} onClick={() => setDensity(mode)}>
                        {densitySettings[mode].label}
                      </ToggleButton>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-300/80 space-y-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Grid Overlay</p>
                  <ToggleButton active={showGrid} onClick={() => setShowGrid((value) => !value)}>
                    <Grid3X3 className="h-3.5 w-3.5" /> Baseline Overlay Grid
                  </ToggleButton>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-stone-300 bg-stone-100/60 p-4 font-mono text-[11px] text-neutral-600 leading-relaxed space-y-1">
              <p className="font-bold text-neutral-900">• Capture target viewports :</p>
              <p>Desktop: 1440 × 1200 // Mobile: 390 × 844</p>
            </div>
          </aside>
        </section>

        {/* 2. LIVE SPECIMEN PREVIEW SCREEN */}
        <section className="overflow-hidden rounded-xl border border-stone-300 bg-[#fbfaf6] shadow-xs" data-typography-section="specimen">
          <div className="border-b border-stone-300 bg-[#eae6db] px-5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-700">
                <Eye className="h-4 w-4 text-cyan-600" /> Live Specimen Panel
              </div>
              <span className="font-mono text-[11px] text-neutral-500">{specimen.meta}</span>
            </div>
          </div>
          <div className={`relative p-6 md:p-10 ${showGrid ? "bg-[linear-gradient(to_bottom,rgba(120,113,108,0.08)_1px,transparent_1px)] bg-[length:100%_28px]" : ""}`}>
            <div className={`max-w-4xl ${densitySetting.sectionGap} flex flex-col`}>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">{specimen.eyebrow}</p>
              <h2 className="text-balance text-4xl font-bold leading-[1.04] tracking-tight text-neutral-950 md:text-6xl">{specimen.headline}</h2>
              <p className={`max-w-2xl text-pretty text-sm leading-relaxed text-neutral-700 ${densitySetting.bodyLeading}`}>{specimen.body}</p>
            </div>
          </div>
        </section>

        {/* 3. FONT ROLE BROWSER (DISPLAY, EDITORIAL, INTERFACE, NUMERIC, MONO) */}
        <section className="space-y-6" data-typography-section="profiles">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Font Role Browser</p>
              <h2 className="text-2xl font-bold text-neutral-950">Visual Hierarchy by design.</h2>
            </div>
            <span className="font-mono text-xs text-neutral-500">Display // Editorial // Interface // Numeric // Mono</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fontProfiles.map((profile) => (
              <FontSpecimen key={profile.family} profile={profile} />
            ))}
          </div>
        </section>

        {/* 4. TYPE SCALE */}
        <section className="space-y-6" data-typography-section="tokens">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Type Scale Tokens</p>
              <h2 className="text-2xl font-bold text-neutral-950">Proportions &amp; Metrics</h2>
            </div>
          </div>

          <TypeScalePreview scale={typographyTokens.scale} />
        </section>

        {/* 5. NUMERIC SPECIMEN (TABULAR VS PROPORTIONAL COMPARISON) */}
        <section className="grid gap-8 lg:grid-cols-[1fr_1fr] rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 md:p-8" data-typography-section="numeric-specimen">
          <div className="space-y-4">
            <span className="inline-flex rounded bg-neutral-900/10 px-2 py-0.5 text-[10px] font-mono font-bold text-neutral-800">
              Numeric benchmark
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-950">Tabular alignment benchmark.</h2>
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
              Les chiffres tabulaires garantissent un alignement vertical parfait pour les valeurs financières, compteurs, chronomètres et variations de KPI.
            </p>

            {/* Specimen items list */}
            <div className="grid gap-3 pt-4 font-mono text-xs">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span>Variations KPI</span>
                <span className="font-bold text-emerald-600 tabular-nums">+14.83%</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span>Solde financier</span>
                <span className="font-bold text-neutral-900 tabular-nums">€1,284,590.00</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span>Chronomètre</span>
                <span className="font-bold text-neutral-900 tabular-nums">08:43.02s</span>
              </div>
            </div>
          </div>

          {/* Direct comparison panel */}
          <div className="rounded-xl border border-stone-300 bg-[#eae6db] p-6 space-y-6">
            <div>
              <p className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
                Proportional (Variable widths - shifts alignment)
              </p>
              <div className="font-sans text-2xl font-semibold space-y-1 text-neutral-800 tracking-normal">
                <p>111,111.11 €</p>
                <p>999,999.99 €</p>
              </div>
            </div>

            <div className="pt-5 border-t border-stone-300">
              <p className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
                Tabular (Monospace widths - perfect vertical layout)
              </p>
              <div className="font-mono text-2xl font-bold space-y-1 text-cyan-700 tabular-nums">
                <p>111,111.11 €</p>
                <p>999,999.99 €</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TYPOGRAPHY RECIPES */}
        <section className="space-y-6" data-typography-section="recipes">
          <div className="flex items-end justify-between gap-4 border-b border-stone-300 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Typography Recipes</p>
              <h2 className="text-2xl font-bold text-neutral-950">Semantic combinations for prototypes</h2>
            </div>
          </div>

          <div className="grid gap-6">
            {typographyRecipes.map((recipe) => (
              <PairingPreview key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>

        {/* 7. COMPOSITION RULES */}
        <section className="grid gap-6 rounded-xl border border-stone-900 bg-[#121110] p-6 text-stone-100 md:grid-cols-[0.8fr_1.2fr] md:p-8" data-typography-section="rules">
          <div className="space-y-2">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Composition Rules</p>
            <h2 className="text-3xl font-bold tracking-tight text-[#f5f3ee]">Useful constraints for 40+ future demos.</h2>
          </div>
          <div className="grid gap-3">
            {compositionRules.map((rule) => (
              <div key={rule} className="flex gap-3 rounded-lg border border-stone-800 bg-[#0e0d0c] p-4 text-xs md:text-sm leading-relaxed text-stone-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                <p className="text-pretty">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. TOKEN EXPORT DEVELOPER INTERFACE */}
        <TypographyTokenExport />

        {/* 9. LICENSE AND PROVENANCE SECTION (SERIOUS & VERIFIABLE) */}
        <section className="rounded-xl border border-stone-300 bg-[#eae6db] p-6 md:p-8 space-y-6" data-typography-section="license">
          <div className="border-b border-stone-300 pb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-700" />
            <h2 className="text-xl font-bold text-neutral-900 font-mono uppercase tracking-wider">License &amp; System Provenance</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 text-xs leading-relaxed text-neutral-700 font-sans">
            <div className="space-y-3">
              <p className="font-bold text-neutral-900 uppercase font-mono tracking-wider">Provenance Verification Status</p>
              <p>
                • Ce laboratoire typographique utilise exclusivement les polices systèmes système et les fontes chargées de manière locale/Google via l&apos;architecture de l&apos;application. Aucune dépendance externe ni requêtes CDN tierces ne sont exécutées pour charger les spécimens.
              </p>
              <p>
                • Les stacks de repli (fallback stacks) sont explicitement déclarées et vérifiables pour préserver l&apos;accessibilité textuelle et la lisibilité en cas de défaut.
              </p>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-neutral-900 uppercase font-mono tracking-wider">Redistribution &amp; Status</p>
              <p>
                • Statut de licence : **Confirmé (Open Font License)** pour Inter, Geist Sans et Geist Mono.
              </p>
              <p>
                • Limitations d&apos;usage : Limitées aux scripts latins dans le périmètre actuel du projet Componentry. Les polices personnalisées de marque ne doivent pas être chargées sans audit de droits préalable.
              </p>
            </div>
          </div>
        </section>

        {/* 10. CAPTURE NOTES & INSTRUCTIONAL DOCUMENTATION */}
        <section className="grid gap-6 md:grid-cols-3" data-typography-section="capture">
          <div className="rounded-lg border border-stone-300 bg-[#e8e1d4] p-5 space-y-2">
            <BookOpenText className="h-5 w-5 text-neutral-700" />
            <h2 className="text-lg font-bold text-neutral-900">Semantic first</h2>
            <p className="text-xs leading-relaxed text-neutral-600">Headings remain ordered, controls are buttons, and specimens use real content rather than placeholder prose.</p>
          </div>
          <div className="rounded-lg border border-stone-300 bg-[#e8e1d4] p-5 space-y-2">
            <Copy className="h-5 w-5 text-neutral-700" />
            <h2 className="text-lg font-bold text-neutral-900">Capture stable</h2>
            <p className="text-xs leading-relaxed text-neutral-600">No random values, no time-based copy, and the default specimen is deterministic for Playwright and Remotion framing.</p>
          </div>
          <div className="rounded-lg border border-stone-300 bg-[#e8e1d4] p-5 space-y-2">
            <SlidersHorizontal className="h-5 w-5 text-neutral-700" />
            <h2 className="text-lg font-bold text-neutral-900">Motion aware</h2>
            <p className="text-xs leading-relaxed text-neutral-600">The foundation exposes the same motion control language as the labs, even though the page itself stays intentionally still.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
