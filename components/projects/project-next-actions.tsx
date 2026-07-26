"use client"

// ─────────────────────────────────────────────────────────────
// Project Next Actions Section — TODO list
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import { cn } from "@/lib/utils"

export function ProjectNextActions() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject || activeProject.nextActions.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No immediate actions registered.
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "border-emerald-800/30 bg-emerald-950/10 text-emerald-700 font-bold"
      case "blocked":
        return "border-red-800/30 bg-red-950/10 text-red-700 font-bold"
      case "doing":
        return "border-cyan-800/30 bg-cyan-950/10 text-cyan-700"
      default:
        return "border-stone-200 bg-stone-50 text-stone-500"
    }
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Next Actions
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Required roadmap tasks for the current sprint.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeProject.nextActions.map((act) => (
          <div
            key={act.id}
            className="rounded border border-stone-200 bg-white p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold text-neutral-950 uppercase">
                {act.label}
              </span>
              <span className={cn(
                "font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border",
                getStatusColor(act.status)
              )}>
                {act.status}
              </span>
            </div>

            {act.description && (
              <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed">
                {act.description}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-2 font-mono text-[9px] text-stone-400 uppercase">
              <span>Phase: {act.phase}</span>
              {act.deadlineLabel && (
                <span>Deadline: {act.deadlineLabel}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProjectNextActions
