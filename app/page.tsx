import type { Metadata } from "next"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { buildCommandProjection } from "@/lib/command/projection"

export const metadata: Metadata = {
  title: "Command",
  description: "Read-only orchestration of canonical system truth for Componentry Lab.",
}

export default async function CommandPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = searchParams ? await searchParams : {}
  const projectId = typeof params.project === "string" ? params.project : undefined
  const projection = buildCommandProjection(projectId)
  const activeProject = projection.activeProject

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-neutral-900 selection:bg-neutral-900 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-[#f5f4f0]/90 px-4 py-3 backdrop-blur-md shadow-xs md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Componentry Lab</p>
            <h1 className="text-sm font-semibold tracking-tight text-neutral-900">Command</h1>
            <p className="text-xs text-neutral-500">Read-only orchestration of canonical system truth</p>
          </div>
          <LabNavigation
            projectId={projectId}
            className="contents"
            activeClassName="bg-neutral-900 text-white"
            inactiveClassName="border border-stone-300 bg-stone-100/80 text-neutral-700 transition-all hover:border-neutral-400 hover:text-neutral-950"
          />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-8 space-y-8">
        <section className="rounded-3xl border border-stone-300/80 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Active Project</p>
              <h2 className="text-3xl font-black tracking-tight text-neutral-950 md:text-5xl">
                {activeProject ? activeProject.title : "Project unavailable"}
              </h2>
              {activeProject ? (
                <p className="max-w-3xl text-sm leading-relaxed text-stone-700">{activeProject.description}</p>
              ) : (
                <p className="max-w-3xl text-sm leading-relaxed text-stone-700">The canonical project context could not be resolved.</p>
              )}
            </div>
            {activeProject ? (
              <div className="grid gap-2 text-sm text-stone-700 lg:text-right">
                <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Type</span><p className="mt-1 font-medium text-neutral-950">{activeProject.kind.replace(/-/g, " ")}</p></div>
                <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Phase</span><p className="mt-1 font-medium text-neutral-950">{projection.projectPhase}</p></div>
                <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Readiness</span><p className="mt-1 font-medium text-neutral-950">{projection.readiness}%</p></div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-neutral-950 bg-neutral-950 p-5 text-white shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-400">Next move</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{projection.directorNextAction?.title ?? "Unavailable"}</h3>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">1</span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-300">{projection.directorRationaleSummary ?? "No director result available."}</p>
          </article>
        </section>
      </div>
    </main>
  )
}
