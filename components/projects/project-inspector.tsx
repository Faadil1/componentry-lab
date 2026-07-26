"use client"

// ─────────────────────────────────────────────────────────────
// Project Inspector Panel — Sidebar metadata inspector
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"

export function ProjectInspector() {
  const { state, actions } = useProjectBrain()
  const { activeProject, activeItemId, inspectorVisible } = state

  if (!inspectorVisible || !activeProject || !activeItemId) return null

  // Find decision or evidence
  const decision = activeProject.decisions.find((d) => d.id === activeItemId)
  const evidence = activeProject.evidence.find((e) => e.id === activeItemId)
  const fact = activeProject.facts.find((f) => f.id === activeItemId)

  const label = decision?.label || evidence?.label || fact?.label || activeItemId
  const typeLabel = decision ? "Decision" : evidence ? "Evidence" : fact ? "Fact" : "Item"

  return (
    <aside
      className="rounded border border-stone-200 bg-stone-50 p-4 space-y-4 text-left w-full"
      aria-label={`Inspector: ${label}`}
    >
      {/* Top Header close */}
      <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-3">
        <div className="space-y-0.5">
          <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
            {typeLabel} Inspector
          </span>
          <h3 className="font-mono text-xs font-bold text-neutral-950 uppercase leading-snug">
            {label}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => actions.selectItem(null)}
          aria-label="Close inspector panel"
          className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded border border-stone-200 bg-white text-stone-400 hover:text-neutral-950 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Decision spec */}
      {decision && (
        <div className="space-y-3 font-mono text-[10.5px]">
          <p className="text-stone-600 leading-relaxed">{decision.description}</p>
          <div className="space-y-1">
            <span className="text-[8px] text-stone-400 uppercase font-semibold block">Rationale</span>
            <p className="text-stone-700 italic">{decision.rationale}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px] text-stone-400 uppercase pt-2">
            <div>Status: <span className="font-semibold text-neutral-850">{decision.status}</span></div>
            <div>Reversible: <span className="font-semibold text-neutral-850">{decision.reversible ? "Yes" : "No"}</span></div>
          </div>
        </div>
      )}

      {/* Evidence spec */}
      {evidence && (
        <div className="space-y-3 font-mono text-[10.5px]">
          <div className="space-y-1">
            <span className="text-[8px] text-stone-400 uppercase font-semibold block">Claim supported</span>
            <p className="text-stone-700 font-semibold">&ldquo;{evidence.claimSupported}&rdquo;</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px] text-stone-400 uppercase pt-2">
            <div>Strength: <span className="font-semibold text-neutral-850">{evidence.strength}</span></div>
            <div>Status: <span className="font-semibold text-neutral-850">{evidence.status}</span></div>
            <div className="col-span-2 truncate">Route/File: <span className="font-semibold text-neutral-850 lowercase">{evidence.routeOrFile}</span></div>
          </div>
        </div>
      )}

      {/* Fact spec */}
      {fact && (
        <div className="space-y-3 font-mono text-[10.5px]">
          <p className="text-stone-600 leading-relaxed">{fact.description}</p>
          <div className="grid grid-cols-2 gap-2 text-[9px] text-stone-400 uppercase pt-2">
            <div>Category: <span className="font-semibold text-neutral-850">{fact.category}</span></div>
            <div>Phase: <span className="font-semibold text-neutral-850">{fact.phase}</span></div>
          </div>
        </div>
      )}
    </aside>
  )
}
export default ProjectInspector
