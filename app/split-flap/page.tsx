"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, BarChart3, CheckCircle2, ChevronDown, Clapperboard, RotateCcw, SlidersHorizontal } from "lucide-react"
import { SplitFlapDisplay } from "@/components/ui/split-flap-display"

const statusStates = [
  { value: "PROCESSING", label: "Processing", accent: "#38bdf8", copy: "Quality checks are running across the Paris edge cluster." },
  { value: "VERIFIED", label: "Verified", accent: "#22c55e", copy: "All records passed identity, address and policy validation." },
  { value: "FAILED", label: "Failed", accent: "#ef4444", copy: "Two records need manual review before release." },
  { value: "READY", label: "Ready", accent: "#a3e635", copy: "The package is approved and queued for deployment." },
]

const financialStates = [
  { amount: "$48,920", change: "+2.4%", label: "North America recurring revenue" },
  { amount: "$51,340", change: "+4.9%", label: "Enterprise renewals closed this week" },
  { amount: "$49,780", change: "-1.1%", label: "Pipeline adjusted after procurement delay" },
  { amount: "$53,105", change: "+6.7%", label: "Forecast after signed expansion order" },
]

const countdownStates = ["05", "04", "03", "02", "01", "LIVE"]

export default function SplitFlapLabPage() {
  const [statusIndex, setStatusIndex] = React.useState(0)
  const [financialIndex, setFinancialIndex] = React.useState(0)
  const [countdownIndex, setCountdownIndex] = React.useState(0)
  const [reduceMotion, setReduceMotion] = React.useState(false)

  const status = statusStates[statusIndex]
  const financial = financialStates[financialIndex]
  const countdown = countdownStates[countdownIndex]
  const isLive = countdown === "LIVE"

  const advanceStatus = () => setStatusIndex((index) => (index + 1) % statusStates.length)
  const advanceFinancial = () => setFinancialIndex((index) => (index + 1) % financialStates.length)
  const advanceCountdown = () => setCountdownIndex((index) => (index + 1) % countdownStates.length)
  const resetCountdown = () => setCountdownIndex(0)

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f4f1ea]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">Split Flap Display</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              className="rounded-lg border border-stone-300 bg-stone-100/80 px-3 py-1.5 font-medium text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950"
              href="/"
            >
              Spotlight Lab
            </Link>
            <Link
              className="rounded-lg bg-neutral-950 px-3.5 py-1.5 font-semibold text-white shadow-xs"
              href="/split-flap"
              aria-current="page"
            >
              Split Flap Lab
            </Link>
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
        {/* HERO CINEMATIC COUNTDOWN SECTION */}
        <section
          className={`grid gap-8 rounded-2xl border p-6 md:grid-cols-[1fr_1.3fr] md:items-center md:p-10 transition-all duration-700 ${
            isLive
              ? "border-emerald-500/50 bg-gradient-to-b from-neutral-950 via-emerald-950/20 to-neutral-950 text-white shadow-[0_0_90px_rgba(34,197,94,0.3)] ring-1 ring-emerald-500/40"
              : "border-neutral-900 bg-neutral-950 text-white shadow-2xl"
          }`}
          data-split-flap-variant="cinematic"
        >
          {/* Left Hero Context */}
          <div className="flex flex-col justify-between gap-8 py-2">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-cyan-400">
                  <span className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-400 animate-ping" : "bg-cyan-300 animate-pulse"}`} />
                </span>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all ${
                    isLive
                      ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                      : "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                  }`}
                >
                  {isLive ? "LIVE TRANSMISSION ACTIVE" : "Hero Demo Sequence"}
                </span>
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl leading-[1.1]">
                {isLive ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-white">
                    Keynote System is Live.
                  </span>
                ) : (
                  "Launch sequence for a product reveal."
                )}
              </h2>

              <p className="max-w-xl text-sm leading-relaxed text-neutral-300 font-sans">
                Un décompte split-flap cinématique conçu pour les introductions produit, les captures vidéo Remotion et les transitions de démonstration sur scène.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={advanceCountdown}
                className={`inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 ${
                  isLive
                    ? "bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-emerald-400/20 focus-visible:ring-emerald-300"
                    : "bg-cyan-300 text-neutral-950 hover:bg-cyan-200 shadow-cyan-300/20 focus-visible:ring-cyan-200"
                }`}
              >
                Next cue <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={resetCountdown}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* Right Prominent Split-Flap Stage (Occupies ~60-75% of right panel area) */}
          <div
            className={`flex items-center justify-center rounded-2xl border p-6 md:p-10 transition-all duration-700 ${
              isLive
                ? "border-emerald-500/40 bg-emerald-950/30 shadow-[inset_0_0_40px_rgba(34,197,94,0.2)]"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <SplitFlapDisplay
              text={countdown}
              columns={countdown === "LIVE" ? 4 : 2}
              size="xl"
              accentColor={isLive ? "#22c55e" : "#67e8f9"}
              staggerDelay={55}
              flipSpeed={40}
              reduceMotion={reduceMotion}
              data-split-flap-variant="cinematic-countdown"
              className="mx-auto shadow-2xl"
            />
          </div>
        </section>

        {/* SECONDARY SHOWCASE GRID */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* PRODUCT STATUS BOARD */}
          <article
            className="flex flex-col justify-between rounded-2xl border border-stone-300 bg-white p-6 md:p-8 shadow-sm space-y-6"
            data-split-flap-variant="product-status"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-sky-700">Product Status</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">Release Gate Monitor</h2>
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            </div>

            <div className="space-y-6">
              {/* Board with generous column spacing for clean legibility */}
              <div className="flex items-center justify-center rounded-xl bg-neutral-950 p-4 border border-stone-800">
                <SplitFlapDisplay
                  rows={[{ label: "GATE", value: status.value }]}
                  columns={18}
                  size="md"
                  accentColor={status.accent}
                  staggerDelay={18}
                  flipSpeed={24}
                  reduceMotion={reduceMotion}
                  data-split-flap-variant="product-status-board"
                />
              </div>

              <p className="min-h-[48px] text-xs md:text-sm leading-relaxed text-neutral-600 font-sans">
                {status.copy}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {statusStates.map((item, index) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatusIndex(index)}
                    className={`rounded-lg border px-3 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      statusIndex === index
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-xs"
                        : "border-stone-300 bg-stone-50 text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={advanceStatus}
                className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 hover:text-sky-900 transition-colors"
              >
                Cycle status <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>

          {/* FINANCIAL DATA BOARD */}
          <article
            className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-[#11130f] p-6 md:p-8 text-stone-50 shadow-md space-y-6"
            data-split-flap-variant="financial-data"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-lime-400">Financial Data</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Revenue &amp; Delta Monitor</h2>
              </div>
              <BarChart3 className="h-6 w-6 text-lime-400 shrink-0" />
            </div>

            <div className="space-y-6">
              {/* Board with clear labels ARR / CHANGE */}
              <div className="flex items-center justify-center rounded-xl bg-[#080907] p-4 border border-stone-800">
                <SplitFlapDisplay
                  rows={[
                    { label: "ARR", value: financial.amount },
                    { label: "CHANGE", value: financial.change },
                  ]}
                  columns={16}
                  size="sm"
                  accentColor={financial.change.startsWith("-") ? "#f97316" : "#a3e635"}
                  staggerDelay={20}
                  flipSpeed={28}
                  reduceMotion={reduceMotion}
                  data-split-flap-variant="financial-data-board"
                />
              </div>

              <p className="min-h-[48px] text-xs md:text-sm leading-relaxed text-stone-300 font-sans">
                {financial.label}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {financialStates.map((item, index) => (
                  <button
                    key={`${item.amount}-${item.change}`}
                    type="button"
                    onClick={() => setFinancialIndex(index)}
                    className={`rounded-lg border px-3 py-2.5 text-left font-mono text-xs tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 ${
                      financialIndex === index
                        ? "border-lime-400 bg-lime-400 text-neutral-950 font-bold shadow-xs"
                        : "border-white/10 bg-white/[0.04] text-stone-300 hover:bg-white/[0.08]"
                    }`}
                  >
                    {item.amount} {item.change}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={advanceFinancial}
                className="inline-flex items-center gap-2 text-xs font-bold text-lime-400 hover:text-lime-300 transition-colors"
              >
                Advance figure <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        </section>

        {/* COLLAPSIBLE CAPTURE NOTES SECTION (CLOSED BY DEFAULT) */}
        <section className="pt-2">
          <details className="group rounded-xl border border-stone-300/80 bg-[#eae8e3] p-4 text-xs text-neutral-700 transition-all">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-900 select-none">
              <div className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4 text-sky-800" />
                <span>Consignes de Capture &amp; Automation Split Flap</span>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-3 border-t border-stone-300/80 pt-3 leading-relaxed text-neutral-600 font-mono text-[11px]">
              <p>
                • Chaque démo expose un attribut stable :{" "}
                <code className="rounded bg-stone-300/70 px-1.5 py-0.5 text-neutral-900 font-bold">
                  data-split-flap-variant=&quot;cinematic | product-status | financial-data&quot;
                </code>.
              </p>
              <p>
                • Le bouton <strong className="text-neutral-900">Motion réduite</strong> force l’affichage direct des caractères cibles sans animation de basculement, idéal pour des captures d’écran statiques et déterministes.
              </p>
              <p>
                • Séquence Hero : de <code className="text-cyan-800">05</code> à <code className="text-emerald-800">LIVE</code>, conçue pour un enregistrement haute fréquence (60 FPS) dans Remotion ou Playwright.
              </p>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
