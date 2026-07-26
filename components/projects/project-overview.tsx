"use client"

// ─────────────────────────────────────────────────────────────
// Project Overview Section — Summary dashboard
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"

export function ProjectOverview() {
  const { state, actions } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject) return null

  const stats = [
    { label: "Decisions Ledger", count: activeProject.decisions.length, detail: `${activeProject.decisions.filter((d) => d.status === "approved").length} approved` },
    { label: "Open Risks", count: activeProject.risks.filter((r) => r.status === "open").length, detail: "requiring mitigation" },
    { label: "Unresolved Assumptions", count: activeProject.assumptions.filter((a) => a.status === "unresolved").length, detail: "to be validated" },
    { label: "Verifiable Evidence", count: activeProject.evidence.filter((e) => e.status === "available").length, detail: "claims supported" }
  ]

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Executive Summary
        </h2>
        <p className="font-mono text-xs leading-relaxed text-stone-600">
          {activeProject.description}
        </p>
      </div>

      {/* Target goals and success definition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded border border-stone-200 bg-stone-50/50 p-4 space-y-2">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Primary Target Goal
          </h3>
          <p className="font-mono text-xs text-stone-700 font-semibold leading-relaxed">
            {activeProject.primaryGoal}
          </p>
        </div>

        <div className="rounded border border-stone-200 bg-stone-50/50 p-4 space-y-2">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Success Metric Definition
          </h3>
          <p className="font-mono text-xs text-stone-700 font-semibold leading-relaxed">
            {activeProject.successDefinition}
          </p>
        </div>
      </div>

      {/* Numerical overview counters */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded border border-stone-200 p-4 space-y-1">
            <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase block">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold text-neutral-950">
                {stat.count}
              </span>
              <span className="font-mono text-[9px] text-stone-500">
                {stat.detail}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick view button hooks */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => actions.setSection("context")}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 font-mono text-[10px] uppercase text-stone-600 hover:border-neutral-950 hover:text-neutral-950"
        >
          View full brief
        </button>
        <button
          type="button"
          onClick={actions.toggleAudit}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 font-mono text-[10px] uppercase text-stone-600 hover:border-neutral-950 hover:text-neutral-950"
        >
          Inspect audit gates
        </button>
      </div>
    </div>
  )
}
export default ProjectOverview
