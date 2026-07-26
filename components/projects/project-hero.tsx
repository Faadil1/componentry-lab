"use client"

// ─────────────────────────────────────────────────────────────
// Project Hero — Overview statistics and identity
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"

export function ProjectHero() {
  const { state } = useProjectBrain()
  const { activeProject, readiness } = state

  if (!activeProject) return null

  return (
    <header className="border-b border-stone-250 bg-stone-50 py-8 px-6 text-left">
      <div className="mx-auto max-w-screen-xl space-y-6">
        {/* Top bar with identity badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-6 items-center rounded-sm border border-stone-300 bg-white px-2 font-mono text-[9px] tracking-widest text-stone-500 uppercase">
              PROJECT BRAIN
            </span>
            <span className="inline-flex h-6 items-center rounded-sm border border-stone-300 bg-white px-2 font-mono text-[9px] tracking-widest text-stone-500 uppercase">
              {activeProject.kind.replace(/-/g, " ")}
            </span>
          </div>

          {/* Session only warning */}
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono text-[9px] tracking-wider text-stone-400 uppercase">
              Workspace changes are session-only until exported
            </span>
          </div>
        </div>

        {/* Title and descriptions */}
        <div className="space-y-2">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl uppercase">
            {activeProject.title}
          </h1>
          <p className="font-mono text-[11px] italic text-cyan-700 border-l-2 border-cyan-500/40 pl-3">
            Memory Hook: &ldquo;{activeProject.memoryHook}&rdquo;
          </p>
        </div>

        {/* Fact grid for 5-second scanning */}
        <div className="grid grid-cols-2 gap-px rounded-md border border-stone-200 bg-stone-200 sm:grid-cols-4">
          {[
            { label: "Current Status / Phase", value: activeProject.status, highlight: true },
            { label: "Readiness Score", value: `${readiness}%` },
            { label: "Active Blockers", value: activeProject.blockers.length > 0 ? `${activeProject.blockers.length} active` : "0 blockers" },
            { label: "Hero Demo Moment", value: activeProject.heroDemoMoment }
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col gap-1 bg-stone-50 px-4 py-3 justify-center">
              <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
                {stat.label}
              </span>
              <span className="font-mono text-[11px] font-semibold text-neutral-950 uppercase truncate" title={stat.value}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
export default ProjectHero
