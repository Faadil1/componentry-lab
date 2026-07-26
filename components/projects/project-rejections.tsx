"use client"

// ─────────────────────────────────────────────────────────────
// Project Rejections Section — Rejected angles register
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"

export function ProjectRejections() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject || activeProject.rejections.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No rejected angles recorded.
      </div>
    )
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Rejected Directions
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Memory Hook: &ldquo;Rejected once. Remembered forever.&rdquo; Prevents repeating errors.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeProject.rejections.map((rej) => (
          <div
            key={rej.id}
            className="rounded border border-stone-200 bg-stone-50/30 p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold text-red-700 uppercase">
                ✕ {rej.label}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border border-stone-200 bg-white text-stone-500">
                rejected in: {rej.rejectedPhase}
              </span>
            </div>

            <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed">
              <span className="font-semibold text-neutral-850">Reason for rejection:</span> {rej.reason}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-stone-200/50 pt-2.5 font-mono text-[9px] text-stone-500">
              <div>
                <span className="text-stone-400 uppercase">Risk Avoided:</span> {rej.riskAvoided}
              </div>
              <div>
                <span className="text-stone-400 uppercase">Reconsider Condition:</span> {rej.reconsiderCondition}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProjectRejections
