"use client"

import type { FilmKitPreset } from "@/lib/film-kit"

export function FilmKitHero({
  preset,
  mode,
  onModeChange,
}: {
  preset: FilmKitPreset
  mode: "light" | "dark"
  onModeChange: (mode: "light" | "dark") => void
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]" data-film-kit-section="hero">
      <div className="space-y-4 rounded-2xl border border-stone-800 bg-[#0e0d0c] p-6 text-stone-100 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
            Universal Demo Film Kit V1
          </span>
          <span className="rounded-full border border-stone-700 bg-stone-900/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-300">
            Read-only Project Brain source
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="max-w-3xl text-balance text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
            Film packets for demo, capture, and handoff.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-300 md:text-base">
            The Film Kit turns the existing Project Brain into exportable demo-film packets. The source project stays untouched; this route only reads its data and formats it for AI33, capture, and review.
          </p>
        </div>
        <div className="grid gap-px rounded-xl border border-stone-800 bg-stone-800 sm:grid-cols-3">
          <div className="bg-[#121110] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Project</p>
            <p className="mt-1 text-sm font-semibold text-white">{preset.label}</p>
          </div>
          <div className="bg-[#121110] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Delivery</p>
            <p className="mt-1 text-sm font-semibold text-white">{preset.deliveryMode}</p>
          </div>
          <div className="bg-[#121110] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Aspect</p>
            <p className="mt-1 text-sm font-semibold text-white">{preset.aspectRatio}</p>
          </div>
        </div>
      </div>

      <aside className="space-y-4 rounded-2xl border border-stone-300 bg-stone-50 p-6 shadow-sm">
        <div className="space-y-1">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Workbench controls</p>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Shared film settings</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-pressed={mode === "light"} onClick={() => onModeChange("light")} className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${mode === "light" ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"}`}>Light</button>
          <button type="button" aria-pressed={mode === "dark"} onClick={() => onModeChange("dark")} className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${mode === "dark" ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"}`}>Dark</button>
        </div>
        <p className="text-sm leading-relaxed text-stone-600">
          The mode switch only changes the presentation shell. The underlying project data and AI33 packet content are always the same read-only source.
        </p>
      </aside>
    </section>
  )
}
