"use client"

import * as React from "react"
import Link from "next/link"
import { Aperture, ArrowDownToLine, Banknote, Factory, RotateCcw, SlidersHorizontal } from "lucide-react"
import { ScrubInput } from "@/components/ui/scrub-input"

const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat("en-CA", {
  maximumFractionDigits: 0,
})

function PresetButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
    >
      {children}
    </button>
  )
}

export default function ScrubInputLabPage() {
  const [reduceMotion, setReduceMotion] = React.useState(false)
  const [monthlyRevenue, setMonthlyRevenue] = React.useState(42000)
  const [capacity, setCapacity] = React.useState(64)
  const [depth, setDepth] = React.useState(58)

  const operatingReserve = Math.round(monthlyRevenue * 0.28)
  const annualRunRate = monthlyRevenue * 12
  const throughput = Math.round(capacity * 185)
  const serviceWindow = Math.max(4, Math.round(18 - capacity / 8))
  const glowOpacity = 0.18 + depth / 180
  const panelScale = 0.96 + depth / 1250
  const beamWidth = 18 + depth * 1.4

  return (
    <main className="min-h-screen bg-[#f3f0e8] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f3f0e8]/90 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">Componentry Lab</p>
            <h1 className="text-lg font-semibold tracking-tight">Scrub Input Lab</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/" className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 font-medium text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950">
              Spotlight Lab
            </Link>
            <Link href="/split-flap" className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 font-medium text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950">
              Split Flap Lab
            </Link>
            <Link href="/scrub-input" aria-current="page" className="rounded-lg bg-neutral-950 px-3 py-1.5 font-medium text-white">
              Scrub Input Lab
            </Link>
            <button
              type="button"
              onClick={() => setReduceMotion((value) => !value)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition ${
                reduceMotion
                  ? "border-amber-500/60 bg-amber-50 text-amber-900"
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

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <section className="grid gap-8 overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950 p-5 text-white shadow-2xl md:grid-cols-[0.9fr_1.1fr] md:p-8" data-scrub-input-variant="cinematic">
          <div className="flex min-h-[420px] flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
                Hero Demo Moment
              </p>
              <h2 className="max-w-xl text-5xl font-semibold tracking-tight md:text-7xl">Control depth like a live visual rig.</h2>
              <p className="max-w-lg text-sm leading-6 text-neutral-300">
                Drag horizontally on the scrub input, or use arrow keys, to tune the visual depth of a product launch scene in real time.
              </p>
            </div>

            <div className="space-y-4">
              <ScrubInput
                label="Scene depth"
                value={depth}
                onChange={setDepth}
                min={0}
                max={100}
                step={1}
                scrubSensitivity={0.85}
                formatValue={(value) => `${value}%`}
                reduceMotion={reduceMotion}
                data-scrub-input-variant="cinematic"
                className="max-w-[420px] border-fuchsia-300/20 bg-white/10 text-white dark"
              />
              <div className="flex flex-wrap gap-2">
                {[20, 58, 86].map((value) => (
                  <PresetButton key={value} onClick={() => setDepth(value)}>{value}%</PresetButton>
                ))}
                <button type="button" onClick={() => setDepth(58)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-white/10 bg-[#090912]">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${42 + depth / 4}% 42%, rgba(217,70,239,${glowOpacity}), transparent ${beamWidth}%), radial-gradient(circle at 24% 76%, rgba(34,211,238,0.24), transparent 34%), #090912`,
                transition: reduceMotion ? "none" : "background 160ms ease-out",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-48 w-64 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/20 bg-white/[0.08] shadow-2xl backdrop-blur"
              style={{
                transform: `translate(-50%, -50%) scale(${panelScale}) rotateX(${depth / 18}deg) rotateY(${-depth / 24}deg)`,
                transition: reduceMotion ? "none" : "transform 160ms ease-out",
              }}
            >
              <div className="flex h-full flex-col justify-between p-5">
                <div className="flex items-center justify-between text-xs text-fuchsia-100">
                  <span>Launch lens</span>
                  <Aperture className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-4xl font-semibold tabular-nums">{depth}%</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-300">Depth intensity</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm" data-scrub-input-variant="financial">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Financial Scenario</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Monthly operating revenue</h2>
              </div>
              <Banknote className="h-5 w-5 text-sky-700" />
            </div>

            <div className="space-y-5">
              <ScrubInput
                label="Revenue"
                value={monthlyRevenue}
                onChange={setMonthlyRevenue}
                min={12000}
                max={90000}
                step={500}
                scrubSensitivity={0.75}
                formatValue={(value) => cadFormatter.format(value)}
                reduceMotion={reduceMotion}
                data-scrub-input-variant="financial"
              />
              <p className="text-sm leading-6 text-neutral-600">
                Current monthly revenue is <strong>{cadFormatter.format(monthlyRevenue)}</strong>, with a recommended operating reserve of <strong>{cadFormatter.format(operatingReserve)}</strong>.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <p className="text-xs text-neutral-500">Annual run rate</p>
                  <p className="mt-1 font-mono font-semibold tabular-nums">{cadFormatter.format(annualRunRate)}</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <p className="text-xs text-neutral-500">Step</p>
                  <p className="mt-1 font-mono font-semibold tabular-nums">{cadFormatter.format(500)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[24000, 42000, 72000].map((value) => (
                  <PresetButton key={value} onClick={() => setMonthlyRevenue(value)}>{cadFormatter.format(value)}</PresetButton>
                ))}
                <PresetButton onClick={() => setMonthlyRevenue(42000)}>Reset</PresetButton>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-stone-300 bg-[#151511] p-5 text-stone-50 shadow-sm" data-scrub-input-variant="product">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Product Configuration</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Modular storage capacity</h2>
              </div>
              <Factory className="h-5 w-5 text-amber-300" />
            </div>

            <div className="space-y-5">
              <ScrubInput
                label="Capacity"
                value={capacity}
                onChange={setCapacity}
                min={24}
                max={120}
                step={4}
                scrubSensitivity={0.9}
                formatValue={(value) => `${value} TB`}
                reduceMotion={reduceMotion}
                data-scrub-input-variant="product"
                className="border-amber-300/20 bg-stone-900 text-stone-50 dark"
              />
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-stone-400">
                  <span>Projected throughput</span>
                  <span className="font-mono tabular-nums">{throughput.toLocaleString("en-CA")} files/hour</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-amber-300"
                    style={{ width: `${percentFormatter.format(((capacity - 24) / 96) * 100)}%`, transition: reduceMotion ? "none" : "width 160ms ease-out" }}
                  />
                </div>
              </div>
              <p className="text-sm leading-6 text-stone-300">
                A {capacity} TB module supports a {serviceWindow}-hour maintenance window while keeping the premium enclosure within thermal limits.
              </p>
              <div className="flex flex-wrap gap-2">
                {[32, 64, 96].map((value) => (
                  <button key={value} type="button" onClick={() => setCapacity(value)} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                    {value} TB
                  </button>
                ))}
                <button type="button" onClick={() => setCapacity(64)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#e7e1d4] p-5 text-sm leading-6 text-neutral-700">
          <div className="mb-2 flex items-center gap-2 font-semibold text-neutral-950">
            <ArrowDownToLine className="h-4 w-4" /> Interaction notes
          </div>
          <p>
            The scrub surface is horizontally draggable, supports arrow keys plus Home/End/PageUp/PageDown, preserves vertical mobile scroll with <code className="rounded bg-stone-200 px-1.5 py-0.5 font-mono text-xs">touch-pan-y</code>, and exposes deterministic values for Playwright and Remotion capture.
          </p>
        </section>
      </div>
    </main>
  )
}
