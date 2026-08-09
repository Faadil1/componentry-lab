import type { Metadata } from "next"
import Link from "next/link"

import { LabNavigation } from "@/components/navigation/lab-navigation"
import { getFilmProjectById, getFilmProductionTruth, getFilmProjectIndex } from "@/lib/film-kit"
import { getProjectById } from "@/lib/projects/repository"

export const metadata: Metadata = {
  title: "Universal Demo Film Kit",
  description: "Index of the three Film Kit routes derived from Project Brain.",
}

const routeNotes = {
  "before-bar-one": "Release one-pager with approval gates and production handoff notes.",
  stated: "Narrative planning route built around a statement-first editorial shape.",
  "glow-atelier": "Cinematic product route tuned for mood, capture, and composited handoff.",
} as const

export default async function FilmKitIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = searchParams ? await searchParams : {}
  const projectId = typeof params.project === "string" ? params.project : undefined
  const activeProject = projectId ? getProjectById(projectId) ?? null : null
  const filmProject = projectId ? getFilmProjectById(projectId) : null
  const productionTruth = projectId ? getFilmProductionTruth(projectId) : null
  const films = getFilmProjectIndex()

  return (
    <main className="min-h-screen bg-[#0a0a09] text-stone-100 selection:bg-cyan-400/20 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-[#0a0a09]/95 px-4 py-3 backdrop-blur-md md:px-6 xl:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Componentry Lab</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-base font-bold tracking-tight text-stone-100">Universal Demo Film Kit</h1>
              <span className="rounded-full border border-stone-700 bg-stone-900/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-300">3 routes</span>
            </div>
          </div>
          <LabNavigation className="w-full xl:max-w-4xl" linkClassName="px-3" activeClassName="bg-stone-100 font-semibold text-stone-900 shadow-xs" inactiveClassName="border border-stone-700 bg-stone-900/80 text-stone-400 transition hover:border-stone-500 hover:text-stone-200" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-6 md:py-10 xl:px-8 xl:py-12">
        {projectId ? (
          <section className="grid gap-6 rounded-[2rem] border border-stone-800 bg-[#0e0d0c] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:p-8 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-4">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Project-aware shell</p>
              <h2 className="max-w-3xl text-balance text-4xl font-black leading-[0.94] tracking-tight md:text-6xl">{activeProject?.title ?? projectId}</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-stone-300 md:text-base">
                {activeProject
                  ? activeProject.description
                  : "The selected project exists in Projects, but no FilmProject has been initialized."}
              </p>
            </div>
            <div className="grid gap-3 rounded-[1.5rem] border border-stone-800 bg-stone-950/60 p-4 text-sm text-stone-300">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Film Project</p>
                <p className="mt-1 leading-relaxed">{filmProject ? filmProject.brief.title : "NONE / NOT INITIALIZED"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Production intent</p>
                <p className="mt-1 leading-relaxed">{filmProject ? "DEFINED" : "UNAVAILABLE / NOT INITIALIZED"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Canonical production spine</p>
                <p className="mt-1 leading-relaxed">{productionTruth?.availability ?? "NO_CANONICAL_PRODUCTION_SPINE"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Routes / artifacts / manifest</p>
                <p className="mt-1 leading-relaxed">{productionTruth ? `${productionTruth.routes.length} / ${productionTruth.artifacts.length} / ${productionTruth.manifest ? "present" : "none"}` : "0 / 0 / none"}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 rounded-[2rem] border border-stone-800 bg-[#0e0d0c] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:p-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Film Kit index</p>
            <h2 className="max-w-3xl text-balance text-4xl font-black leading-[0.94] tracking-tight md:text-6xl">Three production routes, each tuned for a different handoff rhythm.</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-stone-300 md:text-base">Each route keeps Project Brain read-only and reinterprets the same source data through a different editorial shape, capture strategy, and approval cadence.</p>
          </div>
          <div className="grid gap-3 rounded-[1.5rem] border border-stone-800 bg-stone-950/60 p-4 text-sm text-stone-300">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Operating rule</p>
              <p className="mt-1 leading-relaxed">No automatic AI33 request. The workspace opens with route context only.</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Shared source</p>
              <p className="mt-1 leading-relaxed">Project Brain stays as the dependency, not as a redesign target.</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Workspace promise</p>
              <p className="mt-1 leading-relaxed">Inspect, export, and hand off without hiding the film structure behind a generic landing page.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {films.map((film, index) => {
            const note = routeNotes[film.slug as keyof typeof routeNotes] ?? "Production route derived from the shared Project Brain source set."
            return (
              <article key={film.id} className="group overflow-hidden rounded-[1.6rem] border border-stone-800 bg-[#11110f] text-stone-100 shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="border-b border-stone-800 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone-500">/{film.slug}</p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-stone-100">{film.title}</h3>
                    </div>
                    <span className="rounded-full border border-stone-700 bg-stone-950 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-300">0{index + 1}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-300">{note}</p>
                </div>

                <div className="grid gap-px bg-stone-800/80">
                  <div className="bg-[#151512] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Editorial center</p>
                    <p className="mt-2 text-sm leading-relaxed text-stone-200">{film.purpose}</p>
                  </div>
                  <div className="grid gap-px sm:grid-cols-2">
                    <div className="bg-[#151512] p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Primary title</p>
                      <p className="mt-2 text-sm font-medium text-stone-100">{film.title}</p>
                    </div>
                    <div className="bg-[#151512] p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Route form</p>
                      <p className="mt-2 text-sm font-medium text-stone-100">{film.slug.replace(/-/g, " ")}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-stone-800 p-5">
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Open route</p>
                    <p className="text-xs leading-relaxed text-stone-400">Inspect the production workspace shell, packet exports, and AI33 handoff state.</p>
                  </div>
                  <Link href={`/film-kit/${film.id}`} className="inline-flex shrink-0 items-center justify-center rounded-full border border-stone-100 bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-950 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-100/80">Open</Link>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}
