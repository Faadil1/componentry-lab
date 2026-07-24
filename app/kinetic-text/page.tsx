"use client"

import * as React from "react"
import { BookOpen, ChevronDown, Clapperboard, Play, RotateCcw, SlidersHorizontal } from "lucide-react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { KineticTextReveal, type KineticTextRevealRef } from "@/components/ui/kinetic-text-reveal"

type SpeedPreset = "slow" | "standard" | "fast"

const speedSettings: Record<SpeedPreset, { label: string; stagger: number; duration: number }> = {
  slow: { label: "Slow", stagger: 0.11, duration: 0.9 },
  standard: { label: "Standard", stagger: 0.075, duration: 0.72 },
  fast: { label: "Fast", stagger: 0.045, duration: 0.52 },
}

const manifestoSteps = [
  "Interfaces begin in silence.",
  "Then motion gives structure to intent.",
  "The best systems reveal consequence.",
]

function ControlButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-stone-100/80 px-3.5 py-2 text-xs font-bold text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
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
  const productRef = React.useRef<KineticTextRevealRef>(null)
  const cinematicRef = React.useRef<KineticTextRevealRef>(null)
  const cinematicTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const settings = speedSettings[speed]

  const clearCinematicTimer = React.useCallback(() => {
    if (cinematicTimerRef.current) {
      clearTimeout(cinematicTimerRef.current)
      cinematicTimerRef.current = null
    }
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
    setCinematicStep(0)
    cinematicRef.current?.reset()
  }
  const replayCinematic = () => {
    clearCinematicTimer()
    setCinematicStep(0)
    cinematicRef.current?.reset()

    const delays = reduceMotion ? [80, 160, 240] : [450, 2450, 4750]
    delays.forEach((delay, index) => {
      cinematicTimerRef.current = setTimeout(() => {
        setCinematicStep(index)
        cinematicRef.current?.play()
      }, delay)
    })
  }

  const productLines = [
    "Teams lose time interpreting fragmented operational signals.",
    "One interaction layer turns signal into visible sequence.",
    "Componentry helps prototypes explain value before the first click.",
  ]

  return (
    <main className="min-h-screen bg-[#f2eee5] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
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
              {reduceMotion ? "Motion reduite" : "Motion standard"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 md:px-8 md:py-12">
        <section className="grid gap-8 rounded-2xl border border-neutral-900 bg-neutral-950 p-6 text-white shadow-2xl md:grid-cols-[0.8fr_1.2fr] md:p-10" data-kinetic-text-variant="cinematic">
          <div className="flex min-h-[440px] flex-col justify-between gap-8">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-stone-400/30 bg-white/5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.2em] text-stone-200">Hero Demo Moment</span>
              <h2 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">A manifesto that arrives with consequence.</h2>
              <p className="max-w-md text-sm leading-relaxed text-stone-300">A deterministic typographic sequence for product films, keynote openings and Remotion capture.</p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ControlButton onClick={replayCinematic}><Play className="h-3.5 w-3.5" /> Replay</ControlButton>
                <ControlButton onClick={resetCinematic}><RotateCcw className="h-3.5 w-3.5" /> Reset</ControlButton>
              </div>
              <p className="font-mono text-xs text-stone-400">Sequence {cinematicStep + 1} / {manifestoSteps.length} · target 6-8s · {settings.label}</p>
            </div>
          </div>

          <div className="flex min-h-[440px] items-center rounded-xl border border-white/10 bg-[#090909] p-5 md:p-8">
            <div className="w-full space-y-6">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-stone-500">Initial frame is intentionally quiet</p>
              <KineticTextReveal
                ref={cinematicRef}
                key={`cinematic-${cinematicStep}-${speed}-${reduceMotion}`}
                text={manifestoSteps[cinematicStep]}
                splitBy="words"
                direction="up"
                stagger={settings.stagger}
                transition={{ duration: settings.duration, ease: [0.22, 1, 0.36, 1] }}
                autoPlay={false}
                reduceMotion={reduceMotion}
                className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-stone-50 md:text-7xl"
                segmentClassName={cinematicStep === 2 ? "text-cyan-100" : undefined}
              />
              <div className="h-px w-full bg-gradient-to-r from-transparent via-stone-500 to-transparent" />
              <p className="text-sm text-stone-400">Final frame: {manifestoSteps[2]}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-stone-300 bg-[#fbfaf6] p-6 md:p-8 shadow-sm" data-kinetic-text-variant="editorial">
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-stone-300 pb-4">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-neutral-500">Editorial Headline</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">Portfolio publication study</h2>
              </div>
              <BookOpen className="h-5 w-5 text-neutral-700" />
            </div>
            <div className="space-y-5">
              <KineticTextReveal
                key={`editorial-${editorialRun}-${speed}-${reduceMotion}`}
                text="A quiet archive of rooms built to hold difficult light."
                splitBy="words"
                direction="up"
                stagger={settings.stagger * 1.25}
                transition={{ duration: settings.duration + 0.12, ease: [0.22, 1, 0.36, 1] }}
                reduceMotion={reduceMotion}
                className="font-serif text-4xl leading-[1.08] tracking-tight text-neutral-950 md:text-6xl"
              />
              <p className="max-w-xl text-sm leading-6 text-neutral-600">For an architectural case study where the headline needs presence without spectacle.</p>
              <div className="flex flex-wrap gap-2"><ControlButton onClick={replayEditorial}><Play className="h-3.5 w-3.5" /> Replay</ControlButton></div>
            </div>
          </article>

          <article className="rounded-2xl border border-stone-800 bg-[#151511] p-6 text-stone-50 md:p-8 shadow-md" data-kinetic-text-variant="product">
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-lime-300">Product Launch Statement</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">Problem → pivot → promise</h2>
              </div>
              <span className="font-mono text-xs text-stone-400">{productStep + 1}/3</span>
            </div>
            <div className="space-y-5">
              <KineticTextReveal
                ref={productRef}
                key={`product-${productStep}-${speed}-${reduceMotion}`}
                text={productLines[productStep]}
                splitBy="words"
                direction="up"
                stagger={settings.stagger}
                transition={{ duration: settings.duration, ease: [0.22, 1, 0.36, 1] }}
                autoPlay
                reduceMotion={reduceMotion}
                className="min-h-[150px] text-3xl font-semibold leading-[1.12] tracking-tight text-stone-50 md:text-5xl"
                segmentClassName={productStep === 2 ? "text-lime-200" : undefined}
              />
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400">
                {['Problem', 'Pivot', 'Promise'].map((label, index) => <span key={label} className={index === productStep ? 'text-lime-300' : undefined}>{label}</span>)}
              </div>
              <div className="flex flex-wrap gap-2">
                <ControlButton onClick={replayProduct}><Play className="h-3.5 w-3.5" /> Replay</ControlButton>
                <ControlButton onClick={resetProduct}><RotateCcw className="h-3.5 w-3.5" /> Reset</ControlButton>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#e7e1d4] p-5 text-sm leading-6 text-neutral-700">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-950 select-none">
              <span className="flex items-center gap-2"><Clapperboard className="h-4 w-4" /> Motion and capture controls</span>
              <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-4 border-t border-stone-300 pt-4">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(speedSettings) as SpeedPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSpeed(preset)}
                    className={`rounded-lg border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 ${speed === preset ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-stone-300 bg-stone-100 text-neutral-700'}`}
                  >
                    {speedSettings[preset].label}
                  </button>
                ))}
              </div>
              <p>Replay cancels pending sequence timers before starting again. Reset cancels timers and returns each sequence to its deterministic first frame.</p>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
