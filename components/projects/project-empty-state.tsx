"use client"

// ─────────────────────────────────────────────────────────────
// Project Empty State — fallback if project load fails
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"

export function ProjectEmptyState() {
  const { actions } = useProjectBrain()

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-left">
      <div className="flex h-10 w-10 items-center justify-center rounded border border-stone-200 bg-stone-50">
        <span className="font-mono text-lg text-stone-400 font-bold">?</span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-mono text-sm font-semibold text-neutral-950">
          Project dossier not found
        </p>
        <p className="font-mono text-xs text-stone-500">
          The selected identifier is missing or corrupt.
        </p>
      </div>
      <button
        type="button"
        onClick={() => actions.setProject("stated")}
        className="rounded border border-stone-300 bg-white px-3 py-1.5 font-mono text-xs text-stone-600 transition hover:border-neutral-950 hover:text-neutral-950"
      >
        Restore Stated System
      </button>
    </div>
  )
}
export default ProjectEmptyState
