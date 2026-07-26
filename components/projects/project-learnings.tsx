"use client"

// ─────────────────────────────────────────────────────────────
// Project Learnings Section — Retrospective takeaways
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"

export function ProjectLearnings() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject || activeProject.learnings.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No learnings recorded in this project cycle yet.
      </div>
    )
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Learnings & Retrospectives
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Structural insights carried over to the global component system.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeProject.learnings.map((lrn) => (
          <div
            key={lrn.id}
            className="rounded border border-stone-200 bg-white p-4 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold text-neutral-950 uppercase">
                {lrn.label}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border border-stone-200 bg-stone-50 text-stone-500">
                Impact: {lrn.impactArea}
              </span>
            </div>

            <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed">
              {lrn.description}
            </p>

            {lrn.reusableAsset && (
              <div className="font-mono text-[9px] text-emerald-700">
                Reusable Asset created: {lrn.reusableAsset}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProjectLearnings
