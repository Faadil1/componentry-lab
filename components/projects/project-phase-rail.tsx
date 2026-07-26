"use client"

// ─────────────────────────────────────────────────────────────
// Project Phase Rail — Horizontal scrollable workflow steps
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import { PROJECT_PHASES, PROJECT_PHASE_LABELS, getPhaseFromProjectStatus } from "@/lib/projects/schema"
import type { ProjectPhase } from "@/lib/projects"
import { cn } from "@/lib/utils"

export function ProjectPhaseRail() {
  const { state, actions } = useProjectBrain()
  const { activeProject, activePhase } = state

  if (!activeProject) return null

  // Helper to determine status
  const getPhaseStatus = (phase: ProjectPhase) => {
    const currentIdx = PROJECT_PHASES.indexOf(getPhaseFromProjectStatus(activeProject.status, activeProject.currentPhase))
    const thisIdx = PROJECT_PHASES.indexOf(phase)

    if (activeProject.blockedBy.length > 0 && phase === activeProject.status) {
      return "blocked"
    }
    if (phase === activePhase) {
      return "active"
    }
    if (thisIdx < currentIdx) {
      return "completed"
    }
    return "upcoming"
  }

  return (
    <nav className="flex flex-col gap-2 text-left" aria-label="Project phase progress">
      <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase px-6 lg:px-0">
        Phase rail mapping
      </span>

      {/* Outer scrollable viewport */}
      <div className="w-full overflow-x-auto border-b border-t border-stone-200 bg-stone-50/50 py-3 lg:border-none lg:bg-transparent lg:py-0">
        <ol className="flex min-w-max items-center gap-1.5 px-6 lg:flex-wrap lg:gap-1 lg:px-0">
          {PROJECT_PHASES.map((phase, idx) => {
            const status = getPhaseStatus(phase)
            const label = PROJECT_PHASE_LABELS[phase]

            // Accessible symbols
            const symbol = {
              blocked: "✖",
              active: "►",
              completed: "✓",
              upcoming: "○"
            }[status]

            return (
              <li key={phase} className="flex items-center">
                <button
                  type="button"
                  onClick={() => actions.setPhase(phase)}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[10px] tracking-wide uppercase transition border",
                    status === "active" && "border-cyan-700 bg-cyan-950 text-cyan-200",
                    status === "completed" && "border-stone-300 bg-white text-stone-600 hover:border-neutral-500",
                    status === "blocked" && "border-red-800/40 bg-red-950 text-red-300",
                    status === "upcoming" && "border-stone-200 bg-stone-50/80 text-stone-400 hover:border-stone-300"
                  )}
                  title={`${label} phase status: ${status}`}
                >
                  <span className="text-[9px] font-bold" aria-hidden="true">
                    {symbol}
                  </span>
                  <span>
                    {label}
                  </span>
                </button>

                {idx < PROJECT_PHASES.length - 1 && (
                  <span className="mx-1.5 font-mono text-stone-300 text-[10px] hidden lg:inline" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
export default ProjectPhaseRail
