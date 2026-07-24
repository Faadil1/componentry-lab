"use client"

import * as React from "react"
import { Activity, ChevronDown, Clapperboard, Play, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react"
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

const dataStates: Record<DataStateKey, { label: string; palette: PaletteKey; intensity: IntensityKey; note: string; tag: string }> = {
  stable: {
    label: "Stable",
    palette: "aurora",
    intensity: "calm",
    note: "System load is even and throughput is within the planned operating band.",
    tag: "NORMAL OPERATING BAND",
  },
  elevated: {
    label: "Elevated",
    palette: "graphite",
    intensity: "standard",
    note: "Queue depth is rising, but the service window remains protected.",
    tag: "QUEUE ELEVATION",
  },
  critical: {
    label: "Critical",
    palette: "ember",
    intensity: "surge",
    note: "Escalation mode: operators need a concise visual cue, not scientific simulation.",
    tag: "HIGH ATTENTION REQUIRED",
  },
}

function ControlButton({
  children,
  onClick,
  active = false,
  variant = "default",
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  variant?: "default" | "secondary"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-mono font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
        active
          ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-xs ring-1 ring-cyan-400/30"
          : variant === "secondary"
          ? "border-stone-300/80 bg-stone-200/60 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950"
          : "border-stone-700 bg-stone-900/80 text-stone-300 hover:border-stone-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  )
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
    timersRef.current = delays.map((delay, index) =>
      setTimeout(() => {
        setCinematicState(index === 0 ? "Dormant" : index === 1 ? "Emergence" : "Full Field")
        setCinematicRun((run) => run + 1)
      }, delay)
    )
  }

  return (
    <main className="min-h-screen bg-[#f3efe6] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100 font-sans">
      {/* Shared Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f3efe6]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">WebGL Liquid Field</h1>
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
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        {/* Status & Control Panel Bar */}
        <section className="rounded-xl border border-stone-300 bg-[#e7e1d4] p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-white ${
                  status === "Active"
                    ? "bg-neutral-950 ring-1 ring-emerald-400/40"
                    : status === "Reduced"
                    ? "bg-amber-900 text-amber-100"
                    : "bg-neutral-800 text-stone-300"
                }`}
              >
                <Activity className={`h-3.5 w-3.5 ${status === "Active" ? "text-emerald-400 animate-pulse" : ""}`} />
                WebGL Status: {status}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-600">
                Shader WebGL highp // Max DPR 2
              </span>
            </div>

            {/* Global Presets & Utilities */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-500 uppercase font-bold">Palette:</span>
              {(Object.keys(palettes) as PaletteKey[]).map((key) => (
                <ControlButton key={key} variant="secondary" active={key === paletteKey} onClick={() => setPaletteKey(key)}>
                  {palettes[key].name}
                </ControlButton>
              ))}

              <span className="text-[11px] font-mono text-neutral-500 uppercase font-bold ml-2">Intensité:</span>
              {(Object.keys(intensities) as IntensityKey[]).map((key) => (
                <ControlButton key={key} variant="secondary" active={key === intensityKey} onClick={() => setIntensityKey(key)}>
                  {intensities[key].name}
                </ControlButton>
              ))}

              <ControlButton
                variant="secondary"
                active={simulateFallback}
                onClick={() => setSimulateFallback((val) => !val)}
              >
                Simulate Fallback
              </ControlButton>
            </div>
          </div>
        </section>

        {/* HERO DEMO MOMENT: CINEMATIC REVEAL (SCÈNE DOMINANTE 6–8 SECONDES) */}
        <section
          className="relative overflow-hidden rounded-2xl border border-stone-900 bg-neutral-950 shadow-2xl"
          data-webgl-liquid-variant="cinematic"
        >
          {/* Header Tag Overlay */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-neutral-950/80 px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Hero Demo Moment — 6–8s Cinematic Reveal
            </span>
            <span className="rounded-full border border-white/20 bg-neutral-950/80 px-3 py-1 text-[11px] font-mono text-stone-300 backdrop-blur-md">
              État: <strong className="text-cyan-300">{cinematicState}</strong>
            </span>
          </div>

          <WebGLLiquid
            key={`cinematic-${cinematicRun}-${cinematicState}-${reduceMotion}-${simulateFallback}`}
            title="Atmosphère Liquide Temps Réel"
            subtitle={cinematicState}
            description="Une révélation typographique et visuelle en trois étapes (Dormant → Emergence → Full Field), conçue pour les ouvertures de films produits et tournages Remotion."
            {...palette}
            colorDeep={palette.deep}
            colorMid={palette.mid}
            colorHighlight={palette.highlight}
            speed={intensity.speed}
            flowStrength={intensity.flow}
            contrast={intensity.contrast}
            reveal={cinematicReveal > 0.1}
            revealDuration={cinematicState === "Full Field" ? 0.2 : 1.6}
            reduceMotion={reduceMotion}
            forceFallback={simulateFallback}
            fallbackMessage="Arrière-plan statique haute définition configuré pour les contextes d'arrière-plan sans WebGL."
            className="min-h-[520px] md:min-h-[580px]"
          >
            {/* Control Bar Overlay */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <ControlButton onClick={replayCinematic}>
                <Play className="h-3.5 w-3.5 text-cyan-400" /> Replay Séquence (6–8s)
              </ControlButton>
              <ControlButton onClick={resetCinematic}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset (Dormant)
              </ControlButton>
              <span className="rounded-lg border border-white/20 bg-black/40 px-3.5 py-2 text-xs font-mono text-stone-300 backdrop-blur-md">
                Frame finale persistante pour capture
              </span>
            </div>
          </WebGLLiquid>
        </section>

        {/* SECONDARY SHOWCASE DUPLEX */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* PRODUCT ATMOSPHERE */}
          <article
            className="overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm"
            data-webgl-liquid-variant="product"
          >
            <WebGLLiquid
              title="Auralis Surface"
              subtitle="Calm by design."
              description="Une atmosphère liquide retenue pour les en-têtes de produits audio et d'interfaces haut de gamme. La lisibilité du texte reste irréprochable sur l'ensemble du canevas."
              colorDeep="#050505"
              colorMid="#2f3437"
              colorHighlight="#e8dcc2"
              speed={0.35}
              flowStrength={0.45}
              contrast={1}
              opacity={0.82}
              reduceMotion={reduceMotion}
              forceFallback={simulateFallback}
              fallbackMessage="Fallback statique minéral pour présentation produit."
              className="min-h-[560px]"
            >
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-neutral-950 shadow-md transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  Explore Acoustic Canvas
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/25 bg-black/40 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  Specs Technical Audit
                </button>
              </div>
            </WebGLLiquid>
          </article>

          {/* DATA ENVIRONMENT */}
          <article
            className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-[#11130f] p-6 md:p-8 text-stone-50 shadow-md space-y-6"
            data-webgl-liquid-variant="data"
          >
            <div className="border-b border-stone-800 pb-4 space-y-1">
              <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-300">
                Data Environment
              </p>
              <h2 className="text-2xl font-bold text-white">Operational Intensity Field</h2>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                Déclinez la structure visuelle et la dynamique du fluide selon l’état opérationnel du système.
              </p>
            </div>

            {/* State selector buttons */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(dataStates) as DataStateKey[]).map((key) => (
                <ControlButton
                  key={key}
                  active={key === dataStateKey}
                  onClick={() => setDataStateKey(key)}
                >
                  {dataStates[key].label}
                </ControlButton>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-stone-800">
              <WebGLLiquid
                title={dataState.label}
                subtitle="System State"
                description={dataState.note}
                colorDeep={dataPalette.deep}
                colorMid={dataPalette.mid}
                colorHighlight={dataPalette.highlight}
                speed={dataIntensity.speed}
                flowStrength={dataIntensity.flow}
                contrast={dataIntensity.contrast}
                reveal={false}
                reduceMotion={reduceMotion}
                forceFallback={simulateFallback}
                fallbackMessage="Fallback d'état système."
                className="min-h-[380px]"
              >
                <span className="inline-block rounded-md border border-white/20 bg-black/50 px-3 py-1 font-mono text-xs text-cyan-300 font-bold backdrop-blur-md">
                  {dataState.tag}
                </span>
              </WebGLLiquid>
            </div>
          </article>
        </section>

        {/* COLLAPSIBLE CAPTURE NOTES SECTION (CLOSED BY DEFAULT) */}
        <section className="pt-2">
          <details className="group rounded-xl border border-stone-300/80 bg-[#eae8e3] p-4 text-xs text-neutral-700 transition-all">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-900 select-none">
              <div className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4 text-cyan-700" />
                <span>Consignes de Capture &amp; Spécifications WebGL Shader</span>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180" />
            </summary>

            <div className="mt-4 space-y-3 border-t border-stone-300/80 pt-4 leading-relaxed font-mono text-[11px] text-neutral-600">
              <p>
                • Chaque démo expose un sélecteur stable :{" "}
                <code className="rounded bg-stone-300/70 px-1.5 py-0.5 text-neutral-900 font-bold">
                  data-webgl-liquid-variant=&quot;cinematic | product | data&quot;
                </code>.
              </p>
              <p>
                • Le shader s’exécute avec une précision <code className="text-neutral-900 font-bold">highp float</code> et gère la mise en pause automatique lors des changements d’onglet via <code className="text-neutral-900 font-bold">visibilitychange</code>.
              </p>
              <p>
                • Les erreurs de contexte WebGL sont interceptées par le composant <code className="text-neutral-900 font-bold">WebGLErrorBoundary</code> avec bascule déterministe vers le rendu fallback.
              </p>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
