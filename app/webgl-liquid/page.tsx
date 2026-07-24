"use client"

import * as React from "react"
import { Activity, Clapperboard, Play, RotateCcw, SlidersHorizontal } from "lucide-react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { WebGLLiquid } from "@/components/ui/webgl-liquid"

type PaletteKey = "aurora" | "graphite" | "ember"
type IntensityKey = "calm" | "standard" | "surge"
type DataStateKey = "stable" | "elevated" | "critical"
type CinematicState = "Dormant" | "Emergence" | "Full Field"

const palettes: Record<PaletteKey, { name: string; deep: string; mid: string; highlight: string }> = {
  aurora: { name: "Aurora", deep: "#02040b", mid: "#134d93", highlight: "#8cecff" },
  graphite: { name: "Graphite", deep: "#050505", mid: "#3b3430", highlight: "#e6dcc8" },
  ember: { name: "Ember", deep: "#100707", mid: "#7c2d12", highlight: "#fbbf24" },
}

const intensities: Record<IntensityKey, { name: string; speed: number; flow: number; contrast: number }> = {
  calm: { name: "Calm", speed: 0.35, flow: 0.45, contrast: 0.95 },
  standard: { name: "Standard", speed: 0.85, flow: 0.8, contrast: 1.08 },
  surge: { name: "Surge", speed: 1.35, flow: 1.25, contrast: 1.22 },
}

const dataStates: Record<DataStateKey, { label: string; palette: PaletteKey; intensity: IntensityKey; note: string }> = {
  stable: { label: "Stable", palette: "aurora", intensity: "calm", note: "System load is even and throughput is within the planned operating band." },
  elevated: { label: "Elevated", palette: "graphite", intensity: "standard", note: "Queue depth is rising, but the service window remains protected." },
  critical: { label: "Critical", palette: "ember", intensity: "surge", note: "Escalation mode: operators need a concise visual cue, not scientific simulation." },
}

function Button({ children, onClick, active = false }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? "border-cyan-400 bg-cyan-500/20 text-cyan-200" : "border-stone-300 bg-stone-100/80 text-neutral-800 hover:border-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200 dark:hover:bg-white/[0.08]"}`}>{children}</button>
}

export default function WebGLLiquidLabPage() {
  const [reduceMotion, setReduceMotion] = React.useState(false)
  const [simulateFallback, setSimulateFallback] = React.useState(false)
  const [paletteKey, setPaletteKey] = React.useState<PaletteKey>("aurora")
  const [intensityKey, setIntensityKey] = React.useState<IntensityKey>("standard")
  const [dataStateKey, setDataStateKey] = React.useState<DataStateKey>("stable")
  const [cinematicState, setCinematicState] = React.useState<CinematicState>("Dormant")
  const [cinematicRun, setCinematicRun] = React.useState(0)
  const timersRef = React.useRef<Array<ReturnType<typeof setTimeout>>>([])

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current = []
  }, [])

  React.useEffect(() => clearTimers, [clearTimers])

  const status = simulateFallback ? "Fallback" : reduceMotion ? "Reduced" : "Active"
  const palette = palettes[paletteKey]
  const intensity = intensities[intensityKey]
  const dataState = dataStates[dataStateKey]
  const dataPalette = palettes[dataState.palette]
  const dataIntensity = intensities[dataState.intensity]
  const cinematicReveal = cinematicState === "Dormant" ? 0.08 : cinematicState === "Emergence" ? 0.55 : 1

  const resetCinematic = () => {
    clearTimers()
    setCinematicState("Dormant")
    setCinematicRun((run) => run + 1)
  }

  const replayCinematic = () => {
    clearTimers()
    setCinematicState("Dormant")
    setCinematicRun((run) => run + 1)
    const delays = reduceMotion ? [80, 180, 280] : [300, 2600, 5200]
    timersRef.current = delays.map((delay, index) => setTimeout(() => {
      setCinematicState(index === 0 ? "Dormant" : index === 1 ? "Emergence" : "Full Field")
      setCinematicRun((run) => run + 1)
    }, delay))
  }

  return (
    <main className="min-h-screen bg-[#f3efe6] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f3efe6]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">Componentry Lab</p><h1 className="text-base font-bold tracking-tight text-neutral-900">WebGL Liquid</h1></div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <LabNavigation className="contents" linkClassName="px-3.5" activeClassName="bg-neutral-950 font-semibold text-white shadow-xs" inactiveClassName="border border-stone-300 bg-stone-100/80 text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950" />
            <button type="button" onClick={() => setReduceMotion((value) => !value)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition-all ${reduceMotion ? "border-amber-500/60 bg-amber-50 text-amber-900 ring-1 ring-amber-400/30" : "border-stone-300 bg-stone-100 text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"}`} aria-pressed={reduceMotion}><SlidersHorizontal className="h-3.5 w-3.5" />{reduceMotion ? "Motion reduite" : "Motion standard"}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <section className="rounded-xl border border-stone-300 bg-[#e7e1d4] p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs"><span className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-3 py-2 font-bold text-white"><Activity className="h-3.5 w-3.5" /> WebGL {status}</span>{(Object.keys(palettes) as PaletteKey[]).map((key) => <Button key={key} active={key === paletteKey} onClick={() => setPaletteKey(key)}>{palettes[key].name}</Button>)}{(Object.keys(intensities) as IntensityKey[]).map((key) => <Button key={key} active={key === intensityKey} onClick={() => setIntensityKey(key)}>{intensities[key].name}</Button>)}<Button active={simulateFallback} onClick={() => setSimulateFallback((value) => !value)}>Simulate fallback</Button></div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-neutral-950 bg-neutral-950 shadow-2xl" data-webgl-liquid-variant="cinematic">
          <WebGLLiquid key={`cinematic-${cinematicRun}-${cinematicState}-${reduceMotion}-${simulateFallback}`} title="Liquid signal" subtitle={cinematicState} description="A deterministic three-state reveal for premium product films and browser capture." {...palette} colorDeep={palette.deep} colorMid={palette.mid} colorHighlight={palette.highlight} speed={intensity.speed} flowStrength={intensity.flow} contrast={intensity.contrast} reveal={cinematicReveal > 0.1} revealDuration={cinematicState === "Full Field" ? 0.2 : 1.6} reduceMotion={reduceMotion} forceFallback={simulateFallback} fallbackMessage="Static liquid field fallback for capture and unsupported WebGL contexts.">
            <div className="flex flex-wrap gap-2"><Button onClick={replayCinematic}><Play className="h-3.5 w-3.5" /> Replay</Button><Button onClick={resetCinematic}><RotateCcw className="h-3.5 w-3.5" /> Reset</Button><span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white">Target 6-8s · final frame persists</span></div>
          </WebGLLiquid>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm" data-webgl-liquid-variant="product"><WebGLLiquid title="Auralis Surface" subtitle="calm by design" description="A restrained liquid atmosphere behind a premium spatial-audio product hero. Copy remains readable over the canvas and the fallback preserves the same composition." colorDeep="#050505" colorMid="#2f3437" colorHighlight="#e8dcc2" speed={0.35} flowStrength={0.45} contrast={1} opacity={0.82} reduceMotion={reduceMotion} forceFallback={simulateFallback} className="min-h-[560px]" /></article>
          <article className="rounded-2xl border border-stone-800 bg-[#11130f] p-6 text-stone-50 shadow-md" data-webgl-liquid-variant="data"><div className="mb-5 border-b border-stone-800 pb-4"><p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-lime-300">Data Environment</p><h2 className="mt-1 text-2xl font-bold">Operational intensity field</h2></div><div className="mb-4 flex flex-wrap gap-2">{(Object.keys(dataStates) as DataStateKey[]).map((key) => <Button key={key} active={key === dataStateKey} onClick={() => setDataStateKey(key)}>{dataStates[key].label}</Button>)}</div><div className="overflow-hidden rounded-xl border border-white/10"><WebGLLiquid title={dataState.label} subtitle="system state" description={dataState.note} colorDeep={dataPalette.deep} colorMid={dataPalette.mid} colorHighlight={dataPalette.highlight} speed={dataIntensity.speed} flowStrength={dataIntensity.flow} contrast={dataIntensity.contrast} reveal={false} reduceMotion={reduceMotion} forceFallback={simulateFallback} className="min-h-[440px]" /></div></article>
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#e8e1d4] p-5 text-xs leading-6 text-neutral-700"><div className="flex items-center gap-2 font-bold text-neutral-950"><Clapperboard className="h-4 w-4" /> Capture notes</div><p className="mt-2">Presets are deterministic, but the live shader uses requestAnimationFrame time. For Remotion-grade determinism, capture with Playwright or add a future API that accepts explicit progress and time uniforms.</p></section>
      </div>
    </main>
  )
}
