"use client"

import type { FilmKitPreset } from "@/lib/film-kit"

export function FilmKitPresetGrid({
  presets,
  activePresetId,
  onSelectPreset,
}: {
  presets: FilmKitPreset[]
  activePresetId: string
  onSelectPreset: (presetId: string) => void
}) {
  return (
    <section className="space-y-4" data-film-kit-section="presets">
      <div className="border-b border-stone-300 pb-3">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Film presets</p>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Three demo paths</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {presets.map((preset) => {
          const active = preset.id === activePresetId
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              aria-pressed={active}
              className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70 ${
                active ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-950 hover:border-stone-500"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-75">{preset.deliveryMode}</p>
                  <h3 className="text-sm font-semibold">{preset.label}</h3>
                </div>
                <span className="rounded-full border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em]">
                  {preset.aspectRatio}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed opacity-80">{preset.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.18em] opacity-80">
                <span>{preset.audience}</span>
                <span>•</span>
                <span>source: {preset.sourceProjectId}</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
