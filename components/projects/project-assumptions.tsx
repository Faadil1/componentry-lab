"use client"

// ─────────────────────────────────────────────────────────────
// Project Assumptions Section — Hypotheses to validate
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import { cn } from "@/lib/utils"

export function ProjectAssumptions() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject || activeProject.assumptions.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No assumptions declared for this project.
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated":
        return "border-emerald-800/30 bg-emerald-950/20 text-emerald-700"
      case "rejected":
        return "border-red-800/30 bg-red-950/20 text-red-700"
      default:
        return "border-amber-800/30 bg-amber-950/20 text-amber-700"
    }
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Assumptions & Hypotheses
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Provisional assertions that require direct verification.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeProject.assumptions.map((asm) => (
          <div
            key={asm.id}
            className="rounded border border-stone-200 bg-white p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold text-neutral-950 uppercase">
                {asm.label}
              </span>
              <span className={cn(
                "font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border",
                getStatusColor(asm.status)
              )}>
                {asm.status}
              </span>
            </div>

            <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed">
              {asm.description}
            </p>

            <div className="border-t border-stone-100 pt-2 space-y-1">
              <span className="font-mono text-[8px] text-stone-400 uppercase block font-semibold">
                Validation Criteria
              </span>
              <p className="font-mono text-[10px] text-stone-500 italic leading-relaxed">
                {asm.validationCriteria}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProjectAssumptions
