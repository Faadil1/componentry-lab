"use client"

import * as React from "react"
import { BookOpen, ChevronDown, Clapperboard, Play, RotateCcw, SlidersHorizontal } from "lucide-react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { KineticTextReveal, type KineticTextRevealRef } from "@/components/ui/kinetic-text-reveal"

type SpeedPreset = "slow" | "standard" | "fast"

const speedSettings: Record<SpeedPreset, { label: string; stagger: number; duration: number }> = {
  slow: { label: "Lent (0.11s)", stagger: 0.11, duration: 0.9 },
  standard: { label: "Standard (0.075s)", stagger: 0.075, duration: 0.72 },
  fast: { label: "Rapide (0.045s)", stagger: 0.045, duration: 0.52 },
}

const manifestoSteps = [
  {
    step: "01 // SILENCE",
    tag: "Initial Frame",
    text: "Interfaces begin in silence.",
    subtext: "Scène initiale neutre et minimale avant l’amorce du mouvement.",
  },
  {
    step: "02 // PIVOT",
    tag: "Structural Pivot",
    text: "Then motion gives structure to intent.",
    subtext: "Le mouvement rythme l’intention et guide le regard de l’utilisateur.",
  },
  {
    step: "03 // REVELATION",
    tag: "Final Consequence",
    text: `INTERFACES SHOULD NOT MERELY RESPOND.
THEY SHOULD REVEAL CONSEQUENCE.`,
    subtext: "Dénouement typographique net et lisible, stabilisé pour la capture.",
  },
]

const productLines = [
  "Teams lose time interpreting fragmented operational signals.",
  "One interaction layer turns signal into visible sequence.",
  "Componentry helps prototypes explain value before the first click.",
]

function ControlButton({
  children,
  onClick,
  active = false,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-mono font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
        active
          ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-xs ring-1 ring-cyan-400/30"
          : "border-stone-300 bg-stone-100/80 text-neutral-800 hover:border-neutral-500 hover:text-neutral-950 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  )
}

export default function KineticTextLabPage() {
  const [reduceMotion, setReduceMotion] = React.useState(false)
  const [speed, setSpeed] = React.useState<SpeedPreset>("standard")
  const [editorialRun, setEditorialRun] = React.useState(0)
  const [productStep, setProductStep] = React.useState(0)
  const [cinematicStep, setCinematicStep] = React.useState(0)
  const [cinematicRun, setCinematicRun] = React.useState(0)
  const [cinematicActive, setCinematicActive] = React.useState(false)
  const productRef = React.useRef<KineticTextRevealRef>(null)
  const cinematicRef = React.useRef<KineticTextRevealRef>(null)
  const cinematicTimerRefs = React.useRef<Array<ReturnType<typeof setTimeout>>>([])
  const settings = speedSettings[speed]

  const clearCinematicTimer = React.useCallback(() => {
    cinematicTimerRefs.current.forEach((timer) => clearTimeout(timer))
    cinematicTimerRefs.current = []
  }, [])

  React.useEffect(() => clearCinematicTimer, [clearCinematicTimer])

  const replayEditorial = () => setEditorialRun((run) => run + 1)
  
  const resetProduct = () => {
    setProductStep(0)
    productRef.current?.reset()
  }

  const replayProduct = () => {
    setProductStep((step) => (step + 1) % 3)
    productRef.current?.play()
  }

  const resetCinematic = () => {
    clearCinematicTimer()
    setCinematicActive(false)
    setCinematicStep(0)
    setCinematicRun((run) => run + 1)
    cinematicRef.current?.reset()
  }

  const replayCinematic = () => {
    clearCinematicTimer()
    setCinematicActive(false)
    setCinematicStep(0)
    setCinematicRun((run) => run + 1)
    cinematicRef.current?.reset()

    const delays = reduceMotion ? [80, 180, 280] : [350, 2400, 4700]
    cinematicTimerRefs.current = delays.map((delay, index) =>
      setTimeout(() => {
        setCinematicStep(index)
        setCinematicActive(true)
        setCinematicRun((run) => run + 1)
      }, delay)
    )
  }

  const currentManifesto = manifestoSteps[cinematicStep] ?? manifestoSteps[0]

  return (
    <main className="min-h-screen bg-[#f2eee5] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100 font-sans">
      {/* Shared Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f2eee5]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">Kinetic Text Reveal</h1>
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
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition-all ${
                reduceMotion
                  ? "border-amber-500/60 bg-amber-50 text-amber-900 ring-1 ring-amber-400/30"
                  : "border-stone-300 bg-stone-100 text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
              }`}
              aria-pressed={reduceMotion}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {reduceMotion ? "Motion réduite" : "Motion standard"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 md:px-8 md:py-12">
        {/* HERO DEMO MOMENT: CINEMATIC MANIFESTO (SCÈNE DOMINANTE 6–8 SECONDES) */}
        <section
          className="grid gap-8 rounded-2xl border border-stone-900 bg-[#121110] p-6 text-white shadow-2xl md:grid-cols-[0.85fr_1.15fr] md:p-10"
          data-kinetic-text-variant="cinematic"
        >
          {/* Context Column */}
          <div className="flex min-h-[460px] flex-col justify-between gap-8 py-2">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-cyan-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 animate-ping" />
                </span>
                <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-200">
                  Hero Demo Moment — 6–8s Capture Sequence
                </span>
              </div>

              <h2 className="text-4xl font-bold leading-[1.08] tracking-tight text-[#f5f3ee] md:text-6xl">
                A manifesto that arrives with consequence.
              </h2>

              <p className="max-w-md text-sm leading-relaxed text-stone-300 font-sans">
                Une étude typographique cinématique déterministe pour ouvertures de keynotes, présentations produit et tournages Remotion.
              </p>
            </div>

            {/* Sequence Timeline & Controls */}
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                  <span className="text-cyan-300 font-bold">{currentManifesto.step}</span>
                  <span>Étape {cinematicStep + 1} / 3</span>
                </div>
                <div className="flex gap-1.5 h-1.5">
                  {manifestoSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        idx === cinematicStep
                          ? "bg-cyan-400 shadow-[0_0_10px_rgba(103,232,249,0.5)]"
                          : idx < cinematicStep
                          ? "bg-stone-600"
                          : "bg-stone-800"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <ControlButton onClick={replayCinematic}>
                  <Play className="h-3.5 w-3.5 text-cyan-400" /> Séquence Replay
                </ControlButton>
                <ControlButton onClick={resetCinematic}>
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </ControlButton>
              </div>
            </div>
          </div>

          {/* Right Stage Display */}
          <div className="relative flex min-h-[460px] flex-col justify-between rounded-xl border border-stone-800 bg-[#0a0a09] p-6 md:p-10 shadow-inner">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-stone-400">
                {currentManifesto.tag}
              </span>
              <span className="rounded bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300 font-bold">
                Target 6–8s
              </span>
            </div>

            {/* Kinetic Text Revelation Area */}
            <div className="my-auto py-8">
              <KineticTextReveal
                ref={cinematicRef}
                key={`cinematic-${cinematicStep}-${cinematicRun}-${speed}-${reduceMotion}`}
                text={currentManifesto.text}
                splitBy={cinematicStep === 2 ? "lines" : "words"}
                direction="up"
                stagger={settings.stagger}
                transition={{ duration: settings.duration, ease: [0.22, 1, 0.36, 1] }}
                autoPlay={cinematicActive}
                reduceMotion={reduceMotion}
                className="max-w-3xl text-3xl font-black uppercase leading-[1.06] tracking-tight text-[#f5f3ee] sm:text-4xl md:text-6xl"
                segmentClassName={cinematicStep === 2 ? "text-cyan-300 font-extrabold" : undefined}
              />
            </div>

            <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs font-mono text-stone-400">
              <span>{currentManifesto.subtext}</span>
              <span className="text-cyan-300 font-semibold">{settings.label}</span>
            </div>
          </div>
        </section>

        {/* SECONDARY SHOWCASE DUPLEX */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* EDITORIAL HEADLINE */}
          <article
            className="flex flex-col justify-between rounded-2xl border border-stone-300 bg-[#faf8f3] p-6 md:p-8 shadow-sm space-y-6"
            data-kinetic-text-variant="editorial"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-300/80 pb-4">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Editorial Headline
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                  Portfolio Publication Study
                </h2>
              </div>
              <BookOpen className="h-6 w-6 text-neutral-700 shrink-0" />
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-stone-200 bg-[#f4f1ea] p-6 md:p-8">
                <KineticTextReveal
                  key={`editorial-${editorialRun}-${speed}-${reduceMotion}`}
                  text="A quiet archive of rooms built to hold difficult light."
                  splitBy="words"
                  direction="up"
                  stagger={settings.stagger * 1.3}
                  transition={{ duration: settings.duration + 0.15, ease: [0.22, 1, 0.36, 1] }}
                  reduceMotion={reduceMotion}
                  className="font-serif text-3xl leading-[1.12] tracking-tight text-neutral-950 sm:text-4xl md:text-5xl"
                />
              </div>

              <p className="text-xs md:text-sm leading-relaxed text-neutral-600 font-sans">
                Pour une étude de cas d’architecture ou de design où le titre impose sa présence avec retenue et élégance typographique.
              </p>
            </div>

            <div className="pt-3 border-t border-stone-300/80 flex items-center justify-between">
              <ControlButton onClick={replayEditorial}>
                <Play className="h-3.5 w-3.5" /> Replay Editorial
              </ControlButton>
              <span className="text-xs font-serif italic text-neutral-500">N° 08 / Archive Study</span>
            </div>
          </article>

          {/* PRODUCT LAUNCH STATEMENT */}
          <article
            className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-[#171614] p-6 md:p-8 text-stone-50 shadow-md space-y-6"
            data-kinetic-text-variant="product"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Product Launch Statement
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
                  Problem ? Pivot ? Promise
                </h2>
                <span className="mt-2 inline-flex rounded border border-cyan-800 bg-cyan-950 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                  Under 5s
                </span>
              </div>
              <span className="font-mono text-xs text-cyan-300 font-bold bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                Étape {productStep + 1} / 3
              </span>
            </div>

            <div className="space-y-6">
              <div className="min-h-[160px] rounded-xl border border-stone-800 bg-[#0e0d0c] p-6 md:p-8 flex items-center">
                <KineticTextReveal
                  ref={productRef}
                  key={`product-${productStep}-${speed}-${reduceMotion}`}
                  text={productLines[productStep] ?? productLines[0]}
                  splitBy="words"
                  direction="up"
                  stagger={settings.stagger}
                  transition={{ duration: settings.duration, ease: [0.22, 1, 0.36, 1] }}
                  autoPlay
                  reduceMotion={reduceMotion}
                  className="text-2xl font-bold leading-[1.15] tracking-tight text-stone-100 sm:text-3xl md:text-4xl"
                  segmentClassName={productStep === 2 ? "text-cyan-300 font-extrabold" : undefined}
                />
              </div>

              {/* Step indicator pills */}
              <div className="grid grid-cols-3 gap-2">
                {["01. Problem", "02. Pivot", "03. Promise"].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setProductStep(index)
                      productRef.current?.play()
                    }}
                    className={`rounded-lg border px-3 py-2 text-center font-mono text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                      index === productStep
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-xs"
                        : "border-stone-800 bg-stone-900/60 text-stone-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
              <div className="flex gap-2">
                <ControlButton onClick={replayProduct}>
                  <Play className="h-3.5 w-3.5 text-cyan-400" /> Suivant
                </ControlButton>
                <ControlButton onClick={resetProduct}>
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </ControlButton>
              </div>
              <span className="text-xs font-mono text-stone-400">Total &lt; 5s</span>
            </div>
          </article>
        </section>

        {/* COLLAPSIBLE CAPTURE NOTES SECTION (CLOSED BY DEFAULT) */}
        <section className="pt-2">
          <details className="group rounded-xl border border-stone-300/80 bg-[#eae8e3] p-4 text-xs text-neutral-700 transition-all">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-900 select-none">
              <div className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4 text-cyan-700" />
                <span>Consignes de Capture &amp; Réglages de Vitesse (Remotion / Playwright)</span>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180" />
            </summary>

            <div className="mt-4 space-y-4 border-t border-stone-300/80 pt-4 leading-relaxed font-mono text-[11px] text-neutral-600">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-bold text-neutral-900">Vitesse de révélation :</span>
                {(Object.keys(speedSettings) as SpeedPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSpeed(preset)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 ${
                      speed === preset
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-stone-300 bg-stone-100 text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {speedSettings[preset].label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-1">
                <p>
                  • Chaque démo expose un sélecteur stable :{" "}
                  <code className="rounded bg-stone-300/70 px-1.5 py-0.5 text-neutral-900 font-bold">
                    data-kinetic-text-variant=&quot;cinematic | editorial | product&quot;
                  </code>.
                </p>
                <p>
                  • Le bouton <strong className="text-neutral-900">Replay</strong> annule proprement les timers en cours avant de relancer l’animation.
                </p>
                <p>
                  • Le bouton <strong className="text-neutral-900">Reset</strong> nettoie les timers et réinitialise chaque séquence à son premier état déterministe.
                </p>
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
