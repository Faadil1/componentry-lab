"use client"

import * as React from "react"
import Link from "next/link"
import { Aperture, ArrowDownToLine, Banknote, ChevronDown, Factory, MoveHorizontal, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react"
import { ScrubInput } from "@/components/ui/scrub-input"

const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat("en-CA", {
  maximumFractionDigits: 0,
})

function PresetButton({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3.5 py-2 text-xs font-mono font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 ${
        active
          ? "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200 shadow-xs ring-1 ring-fuchsia-400/30"
          : "border-stone-700 bg-stone-900/80 text-stone-300 hover:border-stone-500 hover:text-white"
      }`}
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

  // Depth-driven 3D scene parameters
  const depthFactor = depth / 100
  const lightOpacity = 0.12 + depthFactor * 0.45
  const lightRadius = 25 + depthFactor * 35
  const cardTranslateZ = depthFactor * 65
  const cardRotateX = (depthFactor - 0.5) * 22
  const cardRotateY = -(depthFactor - 0.5) * 30
  const backNodeTranslateZ = -depthFactor * 90
  const backNodeOpacity = 0.35 + (1 - depthFactor) * 0.45
  const frontPillTranslateZ = depthFactor * 110
  const frontPillOpacity = 0.4 + depthFactor * 0.6
  const gridOpacity = 0.12 + depthFactor * 0.4

  const depthStageLabel =
    depth < 35
      ? "20% — COMPACT & FLAT STACK"
      : depth < 75
      ? "58% — INTERMEDIATE DEPTH"
      : "86% — DEEP 3D PLAN SEPARATION"

  return (
    <main className="min-h-screen bg-[#f3f0e8] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f3f0e8]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">Scrub Input Lab</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="/"
              className="rounded-lg border border-stone-300 bg-stone-100/80 px-3 py-1.5 font-medium text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950"
            >
              Spotlight Lab
            </Link>
            <Link
              href="/split-flap"
              className="rounded-lg border border-stone-300 bg-stone-100/80 px-3 py-1.5 font-medium text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950"
            >
              Split Flap Lab
            </Link>
            <Link
              href="/scrub-input"
              aria-current="page"
              className="rounded-lg bg-neutral-950 px-3.5 py-1.5 font-semibold text-white shadow-xs"
            >
              Scrub Input Lab
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

      {/* Main Content Container */}
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 md:px-8 md:py-12">
        {/* HERO CINEMATIC MULTI-LAYERED DEPTH DEMO SECTION */}
        <section
          className="grid gap-8 overflow-hidden rounded-2xl border border-stone-900 bg-[#120f17] p-6 text-white shadow-2xl md:grid-cols-[0.9fr_1.1fr] md:p-10"
          data-scrub-input-variant="cinematic"
        >
          {/* Left Control Column */}
          <div className="flex min-h-[460px] flex-col justify-between gap-8 py-2">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-fuchsia-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-300 animate-ping" />
                </span>
                <span className="inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.2em] text-fuchsia-200">
                  Hero Demo Moment — Depth Rig
                </span>
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-[#f4f2ee] md:text-6xl leading-[1.1]">
                Control 3D depth like a visual rig.
              </h2>

              <p className="max-w-md text-sm leading-relaxed text-stone-300 font-sans">
                Glissez horizontalement sur l’input Scrub pour ajuster en temps réel la séparation multi-plan, la perspective et le cône de lumière de la scène.
              </p>
            </div>

            {/* Scrub Input Control Unit */}
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                  <span className="flex items-center gap-1.5 text-fuchsia-300 font-semibold">
                    <MoveHorizontal className="h-3.5 w-3.5" /> DRAG HORIZONTALLY ↔
                  </span>
                  <span className="text-[11px] text-stone-400">{depthStageLabel}</span>
                </div>

                <ScrubInput
                  label="Scene depth"
                  value={depth}
                  onChange={setDepth}
                  min={0}
                  max={100}
                  step={1}
                  scrubSensitivity={0.85}
                  formatValue={(val) => `${val}%`}
                  reduceMotion={reduceMotion}
                  data-scrub-input-variant="cinematic"
                  className="max-w-[420px] border-fuchsia-400/30 bg-[#1d1728] text-[#f4f2ee]"
                />
              </div>

              {/* Presets and Reset Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[20, 58, 86].map((val) => (
                  <PresetButton
                    key={val}
                    active={depth === val}
                    onClick={() => setDepth(val)}
                  >
                    {val}%
                  </PresetButton>
                ))}
                <button
                  type="button"
                  onClick={() => setDepth(58)}
                  className="inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-900/80 px-3.5 py-2 text-xs font-mono font-semibold text-stone-200 transition hover:border-stone-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right Multi-Layered 3D Stage (Aubergine Black / Mineral Gray / Cold Ivory) */}
          <div className="relative min-h-[460px] md:min-h-[500px] overflow-hidden rounded-xl border border-stone-800 bg-[#0d0a12] flex items-center justify-center p-6 sm:p-8">
            {/* Background Localized Haze / Light Cone */}
            <div
              className="pointer-events-none absolute inset-0 transition-all duration-300"
              style={{
                background: `
                  radial-gradient(circle at ${50 + (depth - 50) / 4}% 35%, rgba(217, 70, 239, ${lightOpacity}) 0%, transparent ${lightRadius}%),
                  radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.18), transparent 30%),
                  #0d0a12
                `,
              }}
            />

            {/* Layer 1: Perspective Architectural Grid (Arrière-plan) */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: gridOpacity,
                backgroundImage: `
                  linear-gradient(to right, rgba(244, 242, 238, 0.08) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(244, 242, 238, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: "28px 28px",
              }}
            />

            {/* 3D Perspective Stage Container */}
            <div
              className="relative w-full max-w-[340px] aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center"
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Layer 2: Background Satellite Node Card (Plan arrière profond) */}
              <div
                className="absolute inset-x-4 top-2 rounded-xl border border-stone-800 bg-[#161120]/90 p-4 text-stone-400 text-xs font-mono shadow-xl transition-transform duration-200"
                style={{
                  transform: reduceMotion
                    ? "none"
                    : `translateZ(${backNodeTranslateZ}px) translateY(-18px)`,
                  opacity: backNodeOpacity,
                }}
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-widest">
                    Node Alpha // Deep Plane
                  </span>
                  <span>Z: -140px</span>
                </div>
                <div className="pt-2 flex justify-between text-[11px] text-stone-400">
                  <span>Spatial Matrix Grid</span>
                  <span className="text-emerald-400">SYNCED</span>
                </div>
              </div>

              {/* Layer 3: Main Focal Card (Carte principale en scène) */}
              <div
                className="relative z-10 w-full rounded-2xl border border-[#f4f2ee]/20 bg-[#1a1426]/95 text-[#f4f2ee] shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-md p-6 sm:p-7 space-y-6 transition-transform duration-200"
                style={{
                  transform: reduceMotion
                    ? "none"
                    : `perspective(1000px) translateZ(${cardTranslateZ}px) rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg)`,
                }}
              >
                {/* Main Card Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300">
                      <Aperture className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#f4f2ee] text-base leading-tight">
                        Launch Optics Core
                      </h3>
                      <p className="text-[11px] font-mono text-stone-400">
                        Raytraced Depth Lens
                      </p>
                    </div>
                  </div>
                  <span className="rounded bg-fuchsia-400/20 px-2 py-0.5 text-[10px] font-mono text-fuchsia-300">
                    Focal Rig
                  </span>
                </div>

                {/* Depth Value Indicator */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
                      {depth}%
                    </span>
                    <span className="text-xs font-mono text-fuchsia-300">
                      Intensity
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-900 border border-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all duration-150"
                      style={{ width: `${depth}%` }}
                    />
                  </div>
                </div>

                {/* Footer spec */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-400 border-t border-white/10">
                  <span>Layer Gap: {(depth * 1.8).toFixed(0)}px</span>
                  <span className="text-cyan-300 font-semibold">60 FPS Render</span>
                </div>
              </div>

              {/* Layer 4: Foreground Floating Pill Badge (Plan avant en saillie) */}
              <div
                className="absolute inset-x-8 -bottom-3 z-20 rounded-full border border-fuchsia-400/40 bg-fuchsia-950/90 px-4 py-2 text-[11px] font-mono text-fuchsia-200 shadow-2xl backdrop-blur-md flex items-center justify-between transition-all duration-200"
                style={{
                  transform: reduceMotion
                    ? "none"
                    : `translateZ(${frontPillTranslateZ}px) translateY(12px)`,
                  opacity: frontPillOpacity,
                }}
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
                  3D PLANE SEPARATION
                </span>
                <span className="text-[10px] text-fuchsia-300 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECONDARY SHOWCASE GRID */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* FINANCIAL SCENARIO CARD */}
          <article
            className="flex flex-col justify-between rounded-2xl border border-stone-300 bg-white p-6 md:p-8 shadow-sm space-y-6"
            data-scrub-input-variant="financial"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-sky-700">Financial Scenario</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">Monthly Operating Revenue</h2>
              </div>
              <Banknote className="h-6 w-6 text-sky-700 shrink-0" />
            </div>

            <div className="space-y-6">
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

              <p className="text-xs md:text-sm leading-relaxed text-neutral-600 font-sans">
                Current monthly revenue is <strong className="text-neutral-900">{cadFormatter.format(monthlyRevenue)}</strong>, with a recommended operating reserve of <strong className="text-sky-700">{cadFormatter.format(operatingReserve)}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5">
                  <p className="text-xs text-neutral-500 font-mono">Annual run rate</p>
                  <p className="mt-1 font-mono font-bold tabular-nums text-neutral-900">{cadFormatter.format(annualRunRate)}</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5">
                  <p className="text-xs text-neutral-500 font-mono">Scrub Step</p>
                  <p className="mt-1 font-mono font-bold tabular-nums text-neutral-900">{cadFormatter.format(500)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[24000, 42000, 72000].map((val) => (
                  <PresetButton key={val} active={monthlyRevenue === val} onClick={() => setMonthlyRevenue(val)}>
                    {cadFormatter.format(val)}
                  </PresetButton>
                ))}
                <PresetButton onClick={() => setMonthlyRevenue(42000)}>Reset</PresetButton>
              </div>
            </div>
          </article>

          {/* PRODUCT CONFIGURATION CARD */}
          <article
            className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-[#151511] p-6 md:p-8 text-stone-50 shadow-md space-y-6"
            data-scrub-input-variant="product"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-amber-400">Product Configuration</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Modular Storage Capacity</h2>
              </div>
              <Factory className="h-6 w-6 text-amber-400 shrink-0" />
            </div>

            <div className="space-y-6">
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
                className="border-amber-400/30 bg-stone-900 text-stone-50"
              />

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                  <span>Projected Throughput</span>
                  <span className="font-bold text-amber-300 tabular-nums">{throughput.toLocaleString("en-CA")} files/hour</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-black/50 border border-white/10">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-150"
                    style={{
                      width: `${percentFormatter.format(((capacity - 24) / 96) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xs md:text-sm leading-relaxed text-stone-300 font-sans">
                A {capacity} TB module supports a {serviceWindow}-hour maintenance window while keeping the premium enclosure within thermal limits.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {[32, 64, 96].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCapacity(val)}
                    className={`rounded-lg border px-3.5 py-2 text-xs font-mono font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                      capacity === val
                        ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow-xs"
                        : "border-white/10 bg-white/[0.04] text-stone-200 hover:bg-white/[0.08]"
                    }`}
                  >
                    {val} TB
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCapacity(64)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-mono font-bold text-stone-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
          </article>
        </section>

        {/* COLLAPSIBLE INTERACTION NOTES SECTION (CLOSED BY DEFAULT) */}
        <section className="pt-2">
          <details className="group rounded-xl border border-stone-300/80 bg-[#eae8e3] p-4 text-xs text-neutral-700 transition-all">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-900 select-none">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="h-4 w-4 text-sky-800" />
                <span>Consignes de Capture &amp; Interaction Scrub Input</span>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-3 border-t border-stone-300/80 pt-3 leading-relaxed text-neutral-600 font-mono text-[11px]">
              <p>
                • Chaque carte expose un sélecteur stable :{" "}
                <code className="rounded bg-stone-300/70 px-1.5 py-0.5 text-neutral-900 font-bold">
                  data-scrub-input-variant=&quot;cinematic | financial | product&quot;
                </code>.
              </p>
              <p>
                • Le bouton <strong className="text-neutral-900">Motion réduite</strong> stoppe l’animation de perspective 3D et applique directement les transformations statiques.
              </p>
              <p>
                • Interaction Scrub : glisser horizontalement sur la surface ou utiliser les flèches du clavier (Left/Right, PageUp/PageDown, Home/End) tout en maintenant le défilement tactile vertical grâce à <code className="text-indigo-800">touch-pan-y</code>.
              </p>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
