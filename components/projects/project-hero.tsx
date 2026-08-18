"use client"

import { useProjectBrain } from "./project-provider"

export function ProjectHero() {
  const { state } = useProjectBrain()
  const { activeProject, readiness } = state

  if (!activeProject) return null

  return (
    <header className="border-b border-stone-300 bg-stone-50 px-4 py-9 text-left sm:px-6 lg:py-12">
      <div className="mx-auto max-w-screen-xl space-y-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="cl-kicker">Project Brain</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-500">
                {activeProject.kind.replace(/-/g, " ")}
              </span>
            </div>
            <h1 className="cl-display mt-4 max-w-5xl text-5xl text-neutral-950 sm:text-6xl">
              {activeProject.title}
            </h1>
            <p className="mt-5 max-w-3xl border-l border-blue-600 pl-4 font-mono text-[11px] leading-6 text-stone-600">
              Memory hook — “{activeProject.memoryHook}”
            </p>
          </div>

          <div className="flex items-center gap-2 border-y border-stone-300 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-stone-500">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Workspace changes are session-only until exported
          </div>
        </div>

        <div className="grid gap-px border-y border-stone-300 bg-stone-300 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Current status / phase", value: activeProject.status },
            { label: "Readiness score", value: `${readiness}%` },
            { label: "Active blockers", value: activeProject.blockers.length > 0 ? `${activeProject.blockers.length} active` : "0 blockers" },
            { label: "Hero demo moment", value: activeProject.heroDemoMoment },
          ].map((stat) => (
            <div key={stat.label} className="bg-stone-50 px-4 py-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-400">{stat.label}</span>
              <p className="mt-2 truncate text-sm font-semibold text-neutral-950" title={stat.value}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}

export default ProjectHero
