"use client"

// ─────────────────────────────────────────────────────────────
// Project Playbook Map — Playbooks selected or active
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import Link from "next/link"

export function ProjectPlaybookMap() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject) return null

  const selectedIds = activeProject.selectedPlaybookIds

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Target Playbook Map
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Playbooks explicitly mapped to prove claims and guide this build.
        </p>
      </div>

      {selectedIds.length === 0 ? (
        <div className="py-6 text-stone-400 font-mono text-xs">
          No playbooks mapped. Add target playbook IDs.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {selectedIds.map((pbId) => {
            // Standard route path structure slug-mapped
            const label = pbId.replace(/-/g, " ")
            const relativeSlug = 
              pbId.includes("system") || pbId.includes("rules") || pbId.includes("blueprint") || pbId.includes("cards") || pbId.includes("pattern")
                ? `uiux/${pbId}` 
                : pbId.includes("hackathon")
                ? `hackathon/${pbId}`
                : `positioning-judging/${pbId}`

            return (
              <div
                key={pbId}
                className="rounded border border-stone-200 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <span className="font-mono text-[8px] text-stone-400 uppercase block">
                    ID: {pbId}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-neutral-950 uppercase">
                    {label}
                  </span>
                </div>

                <Link
                  href={`/playbooks/${relativeSlug}`}
                  className="self-start sm:self-center inline-flex h-6 items-center gap-1 rounded border border-stone-200 px-2 font-mono text-[9px] text-stone-500 transition hover:border-neutral-950 hover:text-neutral-950"
                >
                  Read Playbook →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
export default ProjectPlaybookMap
