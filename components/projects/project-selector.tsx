"use client"

// ─────────────────────────────────────────────────────────────
// Project Selector — Switch between active project presets
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import { cn } from "@/lib/utils"

export function ProjectSelector() {
  const { state, actions } = useProjectBrain()
  const { allProjects, activeProjectId } = state

  return (
    <div className="flex flex-col gap-2 text-left">
      <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
        Active dossier
      </span>
      <div className="flex flex-col gap-1.5">
        {allProjects.map((p) => {
          const isActive = p.id === activeProjectId
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => actions.setProject(p.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex flex-col gap-1 rounded border p-3 text-left transition",
                isActive
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-stone-200 bg-white hover:border-stone-400 text-stone-600"
              )}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="font-mono text-xs font-bold uppercase truncate">
                  {p.shortTitle}
                </span>
                <span className={cn(
                  "font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border",
                  isActive 
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-stone-200 bg-stone-50 text-stone-500"
                )}>
                  {p.kind.replace("-", " ")}
                </span>
              </div>
              <p className={cn(
                "font-mono text-[9px] line-clamp-1 leading-snug",
                isActive ? "text-white/70" : "text-stone-400"
              )}>
                {p.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
export default ProjectSelector
