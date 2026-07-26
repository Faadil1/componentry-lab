"use client"

// ─────────────────────────────────────────────────────────────
// Project Risks Section — Potential showstoppers
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import { cn } from "@/lib/utils"

export function ProjectRisks() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject || activeProject.risks.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No risks documented.
      </div>
    )
  }

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical":
        return "text-red-600 font-bold"
      case "high":
        return "text-orange-500 font-semibold"
      case "medium":
        return "text-amber-500"
      default:
        return "text-stone-400"
    }
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Risks & Gaps
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Factors that could delay, compromise, or block project release.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeProject.risks.map((risk) => (
          <div
            key={risk.id}
            className="rounded border border-stone-200 bg-white p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold text-neutral-950 uppercase">
                {risk.label}
              </span>
              <span className={cn(
                "font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border",
                risk.status === "mitigated" ? "border-emerald-800/30 bg-emerald-950/10 text-emerald-700" : "border-amber-800/30 bg-amber-950/10 text-amber-700"
              )}>
                {risk.status}
              </span>
            </div>

            <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed">
              {risk.description}
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono text-[9px] text-stone-400 uppercase pt-1">
              <div>
                Severity: <span className={cn(getSeverityColor(risk.severity))}>{risk.severity}</span>
              </div>
              <div>
                Probability: <span className="font-semibold text-neutral-800">{risk.probability}</span>
              </div>
            </div>

            {risk.mitigationStrategy && (
              <div className="border-t border-stone-100 pt-2.5 space-y-1">
                <span className="font-mono text-[8px] text-stone-400 uppercase block font-semibold">
                  Mitigation Strategy
                </span>
                <p className="font-mono text-[10px] text-stone-600 italic leading-relaxed">
                  {risk.mitigationStrategy}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProjectRisks
