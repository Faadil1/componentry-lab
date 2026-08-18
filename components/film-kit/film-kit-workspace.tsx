"use client"

import * as React from "react"
import { buildAi33Packet } from "@/lib/film-kit/ai33-packet"
import { buildFilmKitPackets } from "@/lib/film-kit/packets"
import { getFilmProductionTruth, getFilmProductionIntent } from "@/lib/film-kit/production-adapter"
import { useFilmKit } from "./film-kit-provider"

const workflowGroups = [
  { label: "Define", sections: ["overview", "brief", "narrative"] },
  { label: "Direct", sections: ["scenes", "shots", "capture"] },
  { label: "Produce", sections: ["production", "broll", "voice", "music", "assets"] },
  { label: "Assemble", sections: ["manifest", "timeline", "subtitles", "providers", "budget"] },
  { label: "Deliver", sections: ["qa", "export"] },
] as const

function stageForSection(section: string) {
  return workflowGroups.find((group) => group.sections.includes(section as never))?.label ?? "Define"
}

function statusLabel(score: number) {
  if (score >= 80) return "Ready"
  if (score >= 50) return "Needs review"
  return "Blocked"
}

function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "green" | "amber" | "rose" }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : tone === "rose"
          ? "border-rose-200 bg-rose-50 text-rose-900"
          : "border-stone-200 bg-stone-50 text-neutral-950"

  return <span className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${toneClass}`}>{label}</span>
}

function RawDisclosure({ label, value }: { label: string; value: unknown }) {
  return (
    <details className="group rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
      <summary className="cursor-pointer list-none text-xs font-medium text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70">
        View raw data
        <span className="ml-2 text-stone-400">{label}</span>
      </summary>
      <pre className="mt-3 overflow-auto rounded-xl border border-stone-200 bg-white p-4 text-[11px] leading-relaxed text-neutral-800">{JSON.stringify(value, null, 2)}</pre>
    </details>
  )
}

function DefinitionGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="bg-white px-4 py-3">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">{label}</dt>
          <dd className="mt-1 text-sm leading-relaxed text-neutral-950">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function SectionHeader({ title, eyebrow, helper }: { title: string; eyebrow: string; helper: string }) {
  return (
    <div className="space-y-2 border-b border-stone-200 pb-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">{eyebrow}</p>
      <h2 className="text-2xl font-bold tracking-tight text-neutral-950">{title}</h2>
      <p className="max-w-3xl text-sm leading-relaxed text-stone-700">{helper}</p>
    </div>
  )
}

export function FilmKitWorkspace() {
  const { state, actions } = useFilmKit()
  const film = state.activeFilm

  if (!film) {
    return <div className="rounded-2xl border border-stone-300 bg-white p-6 text-sm text-stone-600">No film loaded.</div>
  }

  const section = state.activeSection
  const readiness = statusLabel(film.qaReport.readinessScore)
  const readinessTone = readiness === "Ready" ? "green" : readiness === "Needs review" ? "amber" : "rose"
  const nextGate = film.approvalGates.find((gate) => gate.status !== "approved") ?? film.approvalGates[0]
  const activeStage = stageForSection(section)
  const packets = buildFilmKitPackets(film)
  const ai33Packet = buildAi33Packet(film)
  const productionTruth = getFilmProductionTruth(film.id)
  const productionIntent = getFilmProductionIntent(film)

  const heroStats = [
    ["Memory hook", film.brief.memoryHook],
    ["Hero Demo Moment", film.brief.heroDemoMoment],
    ["Primary proof", film.brief.primaryProof],
    ["Readiness", `${film.qaReport.readinessScore}%`],
    ["Next gate", nextGate?.label ?? "Complete"],
    ["Blockers", film.brief.limitations[0] ?? "None"],
  ] as Array<[string, string]>

  const sectionContent: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Overview" title="Production brief at a glance" helper="Keep the proof story, release constraints, and approval path visible without opening raw data first." />
        <DefinitionGrid
          items={[
            ["Project", film.brief.title],
            ["Purpose", film.brief.purpose],
            ["Format", film.brief.format],
            ["Duration", `${film.brief.durationSeconds}s`],
            ["Readiness", readiness],
            ["Current stage", activeStage],
          ]}
        />
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-stone-200 bg-[#0f0f0e] p-5 text-stone-100 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Signature frame</p>
            <div className="mt-4 aspect-[16/10] rounded-2xl border border-stone-700 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_38%),linear-gradient(160deg,rgba(245,158,11,0.16),rgba(34,197,94,0.08),rgba(6,182,212,0.14))] p-4">
              <div className="flex h-full items-end justify-between rounded-xl border border-stone-800 bg-neutral-950/70 p-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">{film.brief.slug}</p>
                  <p className="mt-1 text-lg font-bold leading-tight text-white">{film.brief.heroDemoMoment}</p>
                </div>
                <div className="rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">frame 01</div>
              </div>
            </div>
          </div>
          <div className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">State</p>
              <StatusPill label={readiness} tone={readinessTone} />
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200">
              {heroStats.map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <RawDisclosure label="overview" value={film.brief} />
      </div>
    ),
    brief: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Brief" title="Project brief and source context" helper="The brief is the primary document for planning and approval." />
        <DefinitionGrid
          items={[
            ["Audience", film.brief.audience],
            ["Memory hook", film.brief.memoryHook],
            ["Hero Demo Moment", film.brief.heroDemoMoment],
            ["Primary proof", film.brief.primaryProof],
            ["Source project", film.brief.sourceProjectTitle],
            ["Source phase", film.brief.sourceProjectPhase],
          ]}
        />
        <RawDisclosure label="brief" value={film.brief} />
      </div>
    ),
    narrative: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Narrative" title="Beat architecture" helper="Different films use different narrative shapes so the workspace feels like a director's document, not a template." />
        <div className="grid gap-4 lg:grid-cols-2">
          {film.narrative.beats.map((beat) => (
            <article key={beat.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Beat {beat.order}</p>
              <h3 className="mt-2 text-lg font-bold text-neutral-950">{beat.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">{beat.description}</p>
              <div className="mt-4 flex flex-wrap gap-2"><StatusPill label={beat.emphasis} /></div>
            </article>
          ))}
        </div>
        <DefinitionGrid
          items={[
            ["Voice direction", film.narrative.voiceDirection],
            ["B-roll strategy", film.narrative.bRollStrategy],
            ["Music direction", film.narrative.musicDirection],
            ["CTA", film.narrative.cta],
          ]}
        />
        <RawDisclosure label="narrative" value={film.narrative} />
      </div>
    ),
    scenes: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Scenes" title="Scene map" helper="Use the scene map to orient capture and review." />
        <div className="grid gap-4 lg:grid-cols-2">
          {film.scenes.map((scene) => (
            <article key={scene.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Scene {scene.order}</p>
                  <h3 className="mt-1 text-lg font-bold text-neutral-950">{scene.label}</h3>
                </div>
                <StatusPill label={scene.purpose} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-700">{scene.description}</p>
              <div className="mt-4 grid gap-2 text-xs text-stone-600 sm:grid-cols-2">
                <div><span className="font-mono uppercase tracking-[0.16em] text-stone-400">Shots</span><p className="mt-1">{scene.shotIds.length}</p></div>
                <div><span className="font-mono uppercase tracking-[0.16em] text-stone-400">QA priority</span><p className="mt-1">{scene.qaPriority}</p></div>
              </div>
            </article>
          ))}
        </div>
        <RawDisclosure label="scenes" value={film.scenes} />
      </div>
    ),
    shots: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Shots" title="Shot plan" helper="Shot rows keep route, proof, and fallback visible without a JSON wall." />
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50 text-left text-[10px] uppercase tracking-[0.18em] text-stone-500">
              <tr>
                <th className="px-4 py-3">Shot</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Capture</th>
                <th className="px-4 py-3">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {film.shots.map((shot) => (
                <tr key={shot.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-medium text-neutral-950">{shot.label}</p>
                    <p className="mt-1 text-xs text-stone-500">{shot.description}</p>
                  </td>
                  <td className="px-4 py-4 text-stone-700">{shot.route}</td>
                  <td className="px-4 py-4">
                    <p className="text-stone-700">{shot.captureStateId ?? "Not started"}</p>
                    <p className="mt-1 text-xs text-stone-500">{shot.viewport} � {shot.aspectRatio}</p>
                  </td>
                  <td className="px-4 py-4 text-stone-700">{shot.expectedVisualResult}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <RawDisclosure label="shots" value={film.shots} />
      </div>
    ),
    capture: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Capture" title="Capture queue" helper="Each capture row remains tied to a real route, restore URL, and expected result." />
        <div className="grid gap-3">
          {film.captureQueue.map((item) => (
            <article key={item.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-neutral-950">{item.outputFilename}</p>
                  <p className="mt-1 text-xs text-stone-500">{item.route}</p>
                </div>
                <StatusPill label={item.status === "ready" ? "Ready" : item.status === "captured" ? "Approved" : item.status === "blocked" ? "Blocked" : "Needs review"} tone={item.status === "blocked" ? "rose" : item.status === "ready" ? "green" : "amber"} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
                <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Restore URL</p><p className="mt-1 text-stone-700">{item.restoreUrl ?? "None"}</p></div>
                <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Viewport</p><p className="mt-1 text-stone-700">{item.viewport}</p></div>
                <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Aspect</p><p className="mt-1 text-stone-700">{item.aspectRatio}</p></div>
                <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Evidence</p><p className="mt-1 text-stone-700">{item.evidenceIds.length} IDs</p></div>
              </div>
            </article>
          ))}
        </div>
        <RawDisclosure label="capture" value={film.captureQueue} />
      </div>
    ),
    timeline: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Timeline" title="Deterministic timeline" helper="The timeline is displayed as tracks and clips before any raw JSON disclosure." />
        <div className="grid gap-4 xl:grid-cols-2">
          {film.timeline.tracks.map((track) => (
            <section key={track.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-neutral-950">{track.label}</h3>
                <StatusPill label={track.kind} />
              </div>
              <div className="mt-4 space-y-2">
                {track.clips.map((clip) => (
                  <div key={clip.id} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-neutral-950">{clip.label}</span>
                      <span className="text-xs text-stone-500">{clip.start}s / {clip.duration}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <DefinitionGrid items={[["Duration", `${film.timeline.durationSeconds}s`], ["Timing status", film.timeline.timingStatus]]} />
        <RawDisclosure label="timeline" value={film.timeline} />
      </div>
    ),
    qa: (
      <div className="space-y-5">
        <SectionHeader eyebrow="QA" title="Readiness and gates" helper="Keep the next approval gate and blockers visible before export." />
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Readiness</p>
            <div className="mt-3 flex items-center gap-3"><StatusPill label={readiness} tone={readinessTone} /><p className="text-sm text-stone-700">{film.qaReport.summary}</p></div>
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              {film.qaReport.checks.map((check) => (
                <li key={check.id} className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2">
                  <span>{check.label}</span>
                  <StatusPill label={check.passed ? "Pass" : "Fail"} tone={check.passed ? "green" : "rose"} />
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Approval gates</p>
            <div className="mt-3 grid gap-2">
              {film.approvalGates.map((gate) => (
                <div key={gate.id} className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2">
                  <span className="text-sm text-neutral-950">{gate.label}</span>
                  <StatusPill label={gate.status === "approved" ? "Approved" : gate.status === "rejected" ? "Blocked" : "Needs review"} tone={gate.status === "approved" ? "green" : gate.status === "rejected" ? "rose" : "amber"} />
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">Next approval gate: {nextGate?.label ?? "Complete"}</div>
          </article>
        </div>
        <RawDisclosure label="qa" value={film.qaReport} />
      </div>
    ),
    production: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Production" title="Production spine routes" helper="Read-only view of deterministic production routes and execution states, separated from Film Kit intent." />

        <div className="space-y-4">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Canonical Production State</h3>
          {productionTruth.availability === "NO_CANONICAL_PRODUCTION_SPINE" ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
              No canonical production route exists yet.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {productionTruth.routes.map(route => (
                <article key={route.routeId} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">{route.routeType}</p>
                      <h4 className="mt-1 font-bold text-neutral-950">{route.requestedArtifactType}</h4>
                    </div>
                    <StatusPill label={route.status} tone={route.status === "PLANNED" ? "neutral" : "green"} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Production Intent</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {productionIntent.assetIntent.map(asset => (
              <article key={asset.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Asset Intent</p>
                    <h4 className="mt-1 font-bold text-neutral-950">{asset.kind}</h4>
                  </div>
                  <StatusPill label={asset.status} />
                </div>
                <div className="mt-4 text-xs text-stone-600">
                  <span className="font-mono uppercase tracking-[0.16em] text-stone-400">Prompt</span>
                  <p className="mt-1 truncate" title={asset.prompt}>{asset.prompt}</p>
                </div>
              </article>
            ))}
            {productionIntent.captureIntent.map(capture => (
              <article key={capture.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Capture Intent</p>
                    <h4 className="mt-1 font-bold text-neutral-950">{capture.shotId}</h4>
                  </div>
                  <StatusPill label={capture.status} />
                </div>
                <div className="mt-4 text-xs text-stone-600">
                  <span className="font-mono uppercase tracking-[0.16em] text-stone-400">Requirements</span>
                  <p className="mt-1 truncate" title={capture.requirements}>{capture.requirements}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    ),
    manifest: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Manifest" title="Artifact assembly manifest" helper="The canonical read-only inventory for assembly." />
        {productionTruth.manifest ? (
          <>
            <DefinitionGrid
              items={[
                ["Next assembly step", productionTruth.manifest.nextAssemblyStep ?? "Unknown"],
                ["Total artifacts", productionTruth.manifest.artifacts.length.toString()],
                ["Missing count", productionTruth.manifest.missingArtifacts.length.toString()],
              ]}
            />
            <div className="space-y-4">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Artifacts</h3>
              <div className="grid gap-4">
                {productionTruth.manifest.artifacts.map(art => (
                  <div key={art.artifactId} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-stone-100 pb-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">{art.artifactId}</p>
                        <p className="mt-1 font-bold text-neutral-950">{art.artifactType}</p>
                      </div>
                      <div className="flex gap-2">
                        <StatusPill label={art.status} tone={art.status === "APPROVED" || art.status === "PRODUCED" ? "green" : art.status === "QA_REQUIRED" ? "amber" : art.status === "REJECTED" ? "rose" : "neutral"} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <RawDisclosure label="manifest" value={productionTruth.manifest} />
          </>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            No canonical artifact manifest exists for this project yet.
          </div>
        )}
      </div>
    ),
    export: (
      <div className="space-y-5">
        <SectionHeader eyebrow="Export" title="Packet export and handoff" helper="Each packet row is collapsed by default and can be previewed one at a time." />
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            {packets.map((packet, index) => (
              <details key={packet.id} className="group rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70">
                  <div className="space-y-1">
                    <p className="font-medium text-neutral-950">{packet.label}</p>
                    <p className="text-sm leading-relaxed text-stone-600">{packet.description}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">JSON � {packet.content.split(/\r?\n/).length} lines</p>
                  </div>
                  <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">Preview</span>
                </summary>
                <div className="mt-4 flex items-center gap-3">
                  <button type="button" onClick={async () => navigator.clipboard.writeText(packet.content)} className="rounded-full border border-neutral-950 bg-neutral-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800">Copy</button>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Packet {index + 1}</span>
                </div>
                <pre className="mt-4 overflow-auto rounded-2xl border border-stone-200 bg-white p-4 text-[11px] leading-relaxed text-neutral-800">{packet.content}</pre>
              </details>
            ))}
          </div>
        </div>
        <RawDisclosure label="export bundle" value={packets} />
      </div>
    ),
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)_19rem]">
        <aside className="sticky top-[4.5rem] hidden h-fit rounded-3xl border border-stone-200 bg-white p-4 shadow-sm xl:block">
          <div className="space-y-1 border-b border-stone-200 pb-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Production desk</p>
            <h2 className="text-lg font-bold tracking-tight text-neutral-950">{film.brief.title}</h2>
            <p className="text-sm text-stone-600">{film.brief.purpose}</p>
          </div>
          <nav className="mt-4 space-y-4" aria-label="Film workflow navigation">
            {workflowGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">{group.label}</p>
                <div className="grid gap-1">
                  {group.sections.map((item) => {
                    const isActive = section === item
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => actions.setSection(item)}
                        className={`rounded-xl px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70 ${isActive ? "bg-neutral-950 text-white" : "text-neutral-700 hover:bg-stone-100 hover:text-neutral-950"}`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          <header className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">Production workspace</p>
                <h1 className="max-w-3xl text-balance text-3xl font-black leading-[0.95] tracking-tight md:text-5xl">{film.brief.title}</h1>
                <p className="max-w-3xl text-sm leading-relaxed text-stone-700">{film.brief.memoryHook}</p>
              </div>
              <div className="grid gap-2 text-sm text-stone-700 lg:text-right">
                <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Stage</span><p className="mt-1 font-medium text-neutral-950">{activeStage}</p></div>
                <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Current section</span><p className="mt-1 font-medium text-neutral-950">{section}</p></div>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[["Duration", `${film.brief.durationSeconds}s`], ["Format", film.brief.format], ["Purpose", film.brief.purpose], ["Readiness", readiness]].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">{label}</p>
                  <p className="mt-1 text-sm font-medium text-neutral-950">{value}</p>
                </div>
              ))}
            </div>
          </header>

          <section className="grid gap-3 md:grid-cols-3">
            {heroStats.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-950">{value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-stone-200 bg-[#f8f5ee] p-5 shadow-sm md:p-6">
            {sectionContent[section] ?? sectionContent.overview}
          </section>
        </main>

        <aside className="space-y-4 xl:sticky xl:top-[4.5rem] xl:h-fit">
          <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Inspector</p>
            <div className="mt-3 space-y-3 text-sm text-stone-700">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Next gate</p>
                <p className="mt-1 font-medium text-neutral-950">{nextGate?.label ?? "Complete"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Blockers</p>
                <p className="mt-1">{film.brief.limitations.join(" � ")}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">AI33 prep</p>
                <p className="mt-1">Manual packet ready, no automatic request.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">AI33</p>
            <p className="mt-2 text-sm text-stone-700">Server-side safety note: the raw packet stays inside a developer disclosure and the key is not exposed in the UI.</p>
            <details className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2">
              <summary className="cursor-pointer list-none text-sm font-medium text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70">Developer packet</summary>
              <pre className="mt-3 overflow-auto rounded-xl border border-stone-200 bg-white p-3 text-[11px] leading-relaxed text-neutral-800">{JSON.stringify(ai33Packet, null, 2)}</pre>
            </details>
          </div>
        </aside>
      </div>

      <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Packets</p>
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">Copy-ready exports</h2>
          </div>
          <StatusPill label="Collapsed rows" />
        </div>
        <div className="grid gap-3">
          {packets.map((packet) => (
            <div key={packet.id} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium text-neutral-950">{packet.label}</p>
                  <p className="text-sm text-stone-600">{packet.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill label={`${packet.content.split(/\r?\n/).length} lines`} />
                  <button type="button" onClick={async () => navigator.clipboard.writeText(packet.content)} className="rounded-full border border-neutral-950 bg-neutral-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800">Copy</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
