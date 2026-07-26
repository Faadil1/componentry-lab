"use client"

// ─────────────────────────────────────────────────────────────
// Project Facts Section — Immutable truths
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"

export function ProjectFacts() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject || activeProject.facts.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No facts documented for this project.
      </div>
    )
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Project Facts
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Verifiable truths or guidelines provided by stakeholders.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {activeProject.facts.map((fact) => (
          <div
            key={fact.id}
            className="rounded border border-stone-200 bg-white p-3.5 space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold text-neutral-950 uppercase">
                {fact.label}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border border-stone-200 bg-stone-50 text-stone-500">
                {fact.category}
              </span>
            </div>
            <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed">
              {fact.description}
            </p>
            <div className="font-mono text-[8px] text-stone-400 uppercase">
              documented in phase: {fact.phase}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProjectFacts
