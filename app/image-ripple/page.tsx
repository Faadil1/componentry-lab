"use client"

import * as React from "react"
import { Clapperboard, ImageIcon, Play, RotateCcw, SlidersHorizontal } from "lucide-react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { ImageRippleEffect, type ImageRippleRenderStatus, type RippleImageItem } from "@/components/ui/image-ripple-effect"

type StrengthKey = "subtle" | "standard" | "strong"
type DensityKey = "low" | "medium" | "high"
type CinematicState = "Still" | "Disturbance" | "Resolve"
type DiagnosticMode = "final" | "source" | "displacement"

const strengths: Record<StrengthKey, { label: string; value: number }> = {
  subtle: { label: "Subtle", value: 0.045 },
  standard: { label: "Standard", value: 0.075 },
  strong: { label: "Strong", value: 0.12 },
}

const densities: Record<DensityKey, { label: string; count: number }> = {
  low: { label: "Low", count: 32 },
  medium: { label: "Medium", count: 72 },
  high: { label: "High", count: 120 },
}

function svgImage(label: string, a: string, b: string, c: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1000" height="700" fill="url(#g)"/><circle cx="750" cy="180" r="150" fill="${c}" opacity="0.24"/><circle cx="210" cy="520" r="210" fill="white" opacity="0.12"/><path d="M90 560h820" stroke="white" stroke-width="10" opacity="0.26"/><text x="70" y="110" fill="white" font-family="Arial" font-size="58" font-weight="700">${label}</text></svg>`)}`
}

const productImages: RippleImageItem[] = [{ src: svgImage("ANODIZED SURFACE", "#111111", "#5b5144", "#e8dcc6"), widthScale: 0.62, heightScale: 0.42 }]
const archiveImages: RippleImageItem[] = [
  { src: svgImage("ARCHIVE 01", "#1c1917", "#78716c", "#f5f5f4"), x: -0.18, widthScale: 0.34, heightScale: 0.42 },
  { src: svgImage("ARCHIVE 02", "#172554", "#0f766e", "#bae6fd"), x: 0.18, widthScale: 0.34, heightScale: 0.42 },
]
const cinematicImages: RippleImageItem[] = [{ src: svgImage("SIGNAL FIELD", "#050505", "#155e75", "#67e8f9"), widthScale: 0.72, heightScale: 0.5 }]

function Button({ children, onClick, active = false }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? "border-cyan-400 bg-cyan-500/20 text-cyan-200" : "border-stone-300 bg-stone-100/80 text-neutral-800 hover:border-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200 dark:hover:bg-white/[0.08]"}`}>{children}</button>
}

export default function ImageRippleLabPage() {
  const [reduceMotion, setReduceMotion] = React.useState(false)
  const [simulateFallback, setSimulateFallback] = React.useState(false)
  const [strengthKey, setStrengthKey] = React.useState<StrengthKey>("standard")
  const [densityKey, setDensityKey] = React.useState<DensityKey>("medium")
  const [cinematicState, setCinematicState] = React.useState<CinematicState>("Still")
  const [renderStatus, setRenderStatus] = React.useState<ImageRippleRenderStatus>("initializing")
  const [diagnosticMode, setDiagnosticMode] = React.useState<DiagnosticMode>("final")
  const [progress, setProgress] = React.useState(0)
  const [run, setRun] = React.useState(0)
  const timersRef = React.useRef<Array<ReturnType<typeof setTimeout>>>([])

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current = []
  }, [])

  React.useEffect(() => clearTimers, [clearTimers])

  const status = simulateFallback || renderStatus === "fallback" ? "Fallback" : reduceMotion ? "Reduced" : renderStatus === "active" ? "Active" : "Initializing"
  const strength = strengths[strengthKey]
  const density = densities[densityKey]

  const resetCinematic = () => {
    clearTimers()
    setCinematicState("Still")
    setProgress(0)
    setRun((value) => value + 1)
  }

  const replayCinematic = () => {
    clearTimers()
    setCinematicState("Still")
    setProgress(0)
    setRun((value) => value + 1)
    const plan: Array<[number, CinematicState, number]> = reduceMotion
      ? [[60, "Still", 0], [140, "Disturbance", 0.5], [220, "Resolve", 1]]
      : [[250, "Still", 0.05], [2500, "Disturbance", 0.52], [5200, "Resolve", 1]]
    timersRef.current = plan.map(([delay, state, nextProgress]) => setTimeout(() => {
      setCinematicState(state)
      setProgress(nextProgress)
      setRun((value) => value + 1)
    }, delay))
  }

  return (
    <main className="min-h-screen bg-[#f3efe6] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f3efe6]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">Componentry Lab</p><h1 className="text-base font-bold tracking-tight text-neutral-900">Image Ripple Effect</h1></div>
          <div className="flex flex-wrap items-center gap-2 text-xs"><LabNavigation className="contents" linkClassName="px-3.5" activeClassName="bg-neutral-950 font-semibold text-white shadow-xs" inactiveClassName="border border-stone-300 bg-stone-100/80 text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950" /><button type="button" onClick={() => setReduceMotion((v) => !v)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition-all ${reduceMotion ? "border-amber-500/60 bg-amber-50 text-amber-900 ring-1 ring-amber-400/30" : "border-stone-300 bg-stone-100 text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"}`} aria-pressed={reduceMotion}><SlidersHorizontal className="h-3.5 w-3.5" />{reduceMotion ? "Motion reduite" : "Motion standard"}</button></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <section className="rounded-xl border border-stone-300 bg-[#e7e1d4] p-4"><div className="flex flex-wrap items-center gap-2 text-xs"><span className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-3 py-2 font-bold text-white"><ImageIcon className="h-3.5 w-3.5" /> Ripple {status}</span>{(Object.keys(strengths) as StrengthKey[]).map((key) => <Button key={key} active={key === strengthKey} onClick={() => setStrengthKey(key)}>{strengths[key].label}</Button>)}{(Object.keys(densities) as DensityKey[]).map((key) => <Button key={key} active={key === densityKey} onClick={() => setDensityKey(key)}>{densities[key].label}</Button>)}<Button active={simulateFallback} onClick={() => setSimulateFallback((value) => !value)}>Simulate fallback</Button>{(["final", "source", "displacement"] as DiagnosticMode[]).map((mode) => <Button key={mode} active={diagnosticMode === mode} onClick={() => setDiagnosticMode(mode)}>{mode}</Button>)}</div></section>

        <section className="overflow-hidden rounded-2xl border border-neutral-950 bg-neutral-950 shadow-2xl" data-image-ripple-variant="cinematic"><ImageRippleEffect key={`cinematic-${run}-${progress}-${reduceMotion}-${simulateFallback}`} images={cinematicImages} seed={42} captureMode pointerX={520} pointerY={280} progress={progress} distortionStrength={strength.value} waveCount={density.count} reduceMotion={reduceMotion} forceFallback={simulateFallback} fallbackMessage="Static cinematic signal field fallback." className="h-[680px]" maxWaveCount={100} mobileWaveCount={36} diagnosticMode={diagnosticMode} onRenderStatusChange={setRenderStatus}><div className="flex h-full flex-col justify-between bg-gradient-to-r from-black/70 via-black/20 to-transparent p-6 md:p-10"><div><span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-200">Hero Demo Moment</span><h2 className="mt-5 max-w-2xl text-5xl font-black tracking-tight md:text-7xl">Cinematic Distortion</h2><p className="mt-4 max-w-md text-sm text-stone-200">{cinematicState} · deterministic trajectory · target 6-8s</p></div><div className="flex flex-wrap gap-2"><Button onClick={replayCinematic}><Play className="h-3.5 w-3.5" /> Replay</Button><Button onClick={resetCinematic}><RotateCcw className="h-3.5 w-3.5" /> Reset</Button><span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white">Final frame persists</span></div></div></ImageRippleEffect></section>

        <section className="grid gap-8 lg:grid-cols-2"><article className="overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm" data-image-ripple-variant="product"><ImageRippleEffect images={productImages} seed={7} distortionStrength={strength.value * 0.75} waveCount={density.count} reduceMotion={reduceMotion} forceFallback={simulateFallback} fallbackMessage="Static product material fallback." className="h-[560px]" maxWaveCount={96} mobileWaveCount={32} diagnosticMode={diagnosticMode} onRenderStatusChange={setRenderStatus}><div className="flex h-full items-end bg-gradient-to-t from-black/70 to-transparent p-6"><div><p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-stone-300">Product Material</p><h2 className="mt-2 text-4xl font-black">Anodized depth, revealed gently.</h2><p className="mt-3 max-w-md text-sm text-stone-200">A restrained ripple exposes surface finish without compromising product copy.</p></div></div></ImageRippleEffect></article><article className="overflow-hidden rounded-2xl border border-stone-800 bg-[#141310] p-5 text-stone-50 shadow-md" data-image-ripple-variant="editorial"><div className="mb-4"><p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-stone-400">Editorial Archive</p><h2 className="mt-1 text-3xl font-bold">Two-image archive study</h2></div><ImageRippleEffect images={archiveImages} seed={21} distortionStrength={strength.value * 0.55} waveCount={density.count} reduceMotion={reduceMotion} forceFallback={simulateFallback} fallbackMessage="Static archive fallback." className="h-[460px] rounded-xl" maxWaveCount={80} mobileWaveCount={28} diagnosticMode={diagnosticMode} onRenderStatusChange={setRenderStatus} /></article></section>

        <section className="rounded-xl border border-stone-300 bg-[#e8e1d4] p-5 text-xs leading-6 text-neutral-700"><div className="flex items-center gap-2 font-bold text-neutral-950"><Clapperboard className="h-4 w-4" /> Capture notes</div><p className="mt-2">Seeded rotations and captureMode make the cinematic trajectory reproducible. WebGL output still depends on browser/GPU; Remotion should use Playwright capture today or a future explicit time/progress API.</p></section>
      </div>
    </main>
  )
}
