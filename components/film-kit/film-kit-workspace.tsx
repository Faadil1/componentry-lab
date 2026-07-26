"use client"

import * as React from "react"
import { useFilmKit } from "./film-kit-provider"
import { FILM_SECTIONS } from "@/lib/film-kit"

export function FilmKitWorkspace() {
  const { state, actions } = useFilmKit()
  const film = state.activeFilm
  if (!film) return <div className="rounded-xl border border-stone-300 bg-white p-6 text-sm text-stone-600">No film loaded.</div>

  const section = state.activeSection

  const summaryCards = [
    ["Project", film.brief.title],
    ["Purpose", film.brief.purpose],
    ["Duration", `${film.brief.durationSeconds}s`],
    ["Format", film.brief.format],
    ["Memory hook", film.brief.memoryHook],
    ["Hero Demo Moment", film.brief.heroDemoMoment],
    ["Primary proof", film.brief.primaryProof],
    ["Capture readiness", String(film.captureQueue.length > 0)],
    ["Narration readiness", String(film.narrationSegments.length > 0)],
    ["Asset readiness", String(film.assets.length > 0)],
    ["Render readiness", String(film.remotion.durationSeconds > 0)],
    ["Blockers", film.brief.limitations.join(" · ")],
    ["Next approval gate", film.approvalGates.find((gate) => gate.status !== "approved")?.label ?? "Complete"],
  ]

  return (
    <div className="space-y-8">
      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        {summaryCards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-stone-300 bg-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">{label}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-950">{value}</p>
          </div>
        ))}
      </section>

      <nav className="flex flex-wrap gap-2" aria-label="Film sections">
        {FILM_SECTIONS.map((item) => (
          <button key={item} type="button" aria-pressed={section === item} onClick={() => actions.setSection(item)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${section === item ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"}`}>
            {item}
          </button>
        ))}
      </nav>

      {section === "overview" && (
        <section className="space-y-4">
          <div className="rounded-xl border border-stone-300 bg-stone-50 p-5">
            <h3 className="text-xl font-bold text-neutral-950">Overview</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">Derived from Project Brain only. This Film Kit packages the project into a film brief, narrative, scenes, shots, capture queue, voice direction, assets, timeline, QA, and exports.</p>
          </div>
        </section>
      )}

      {section === "brief" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.brief, null, 2)}</pre>}
      {section === "narrative" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.narrative, null, 2)}</pre>}
      {section === "scenes" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.scenes, null, 2)}</pre>}
      {section === "shots" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.shots, null, 2)}</pre>}
      {section === "capture" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.captureQueue, null, 2)}</pre>}
      {section === "voice" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify({ direction: film.voiceDirection, candidates: film.voiceCandidates, decision: film.voiceDecision }, null, 2)}</pre>}
      {section === "music" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.musicPackets, null, 2)}</pre>}
      {section === "assets" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.assets, null, 2)}</pre>}
      {section === "timeline" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.timeline, null, 2)}</pre>}
      {section === "subtitles" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.subtitleTracks, null, 2)}</pre>}
      {section === "providers" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify({ flow: film.flowPackets, vidiq: film.vidiqPackets, googleVids: film.googleVidsPacket }, null, 2)}</pre>}
      {section === "budget" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.generationBudget, null, 2)}</pre>}
      {section === "qa" && <pre className="overflow-auto rounded-xl border border-stone-300 bg-white p-4 text-[11px]">{JSON.stringify(film.qaReport, null, 2)}</pre>}
      {section === "export" && <div className="rounded-xl border border-stone-300 bg-white p-5 text-sm text-stone-700">Use the export panels below to copy packets and manifests.</div>}
    </div>
  )
}