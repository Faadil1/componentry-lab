"use client"

// ─────────────────────────────────────────────────────────────
// Project Outputs Section — Assets and code outputs
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import { cn } from "@/lib/utils"

export function ProjectOutputs() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject || activeProject.outputs.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No outputs declared.
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-emerald-800/30 bg-emerald-950/10 text-emerald-700 font-bold"
      case "blocked":
        return "border-red-800/30 bg-red-950/10 text-red-700 font-bold"
      case "in-progress":
        return "border-cyan-800/30 bg-cyan-950/10 text-cyan-700"
      default:
        return "border-stone-255 bg-stone-50 text-stone-500"
    }
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Required Outputs
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Required assets, documents, design tokens, or source files.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeProject.outputs.map((out) => (
          <div
            key={out.id}
            className="rounded border border-stone-200 bg-white p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold text-neutral-950 uppercase">
                {out.label}
              </span>
              <span className={cn(
                "font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border",
                getStatusColor(out.status)
              )}>
                {out.status}
              </span>
            </div>

            <p className="font-mono text-[10.5px] text-stone-600 leading-relaxed">
              {out.description}
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono text-[9px] text-stone-400 uppercase border-t border-stone-100 pt-2">
              <div>
                Format: <span className="font-semibold text-neutral-850">{out.format}</span>
              </div>
              <div>
                Phase: <span className="font-semibold text-neutral-850">{out.phase}</span>
              </div>
              {out.filepath && (
                <div className="col-span-2 font-mono text-[9px] text-stone-500 lowercase truncate">
                  Path: {out.filepath}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProjectOutputs
