"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import { getRegistryEntryById } from "@/lib/registry/selectors"
import type { RegistryEntry } from "@/lib/registry/types"
import { cn } from "@/lib/utils"

export interface LibrarySystemMapProps {
  className?: string
}

export function LibrarySystemMap({ className }: LibrarySystemMapProps) {
  const { state, actions } = useComponentLibrary()
  const { activeEntryId, detailVisible } = state

  const entry = React.useMemo(() => {
    return activeEntryId ? getRegistryEntryById(activeEntryId) || null : null
  }, [activeEntryId])

  if (!detailVisible || !entry) return null

  // Collect dependencies entries
  const dependencies = entry.relations
    .filter((rel) => rel.type === "uses" || rel.type === "composes" || rel.type === "depends-on")
    .map((rel) => getRegistryEntryById(rel.targetId))
    .filter((e): e is RegistryEntry => !!e)

  return (
    <div className={cn("rounded-lg border border-stone-850 bg-[#0c0b0a] p-4 space-y-4 text-left select-none text-xs", className)}>
      <div className="border-b border-stone-900 pb-2 flex justify-between items-center">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Composition System Map
        </span>
        <span className="font-mono text-[8px] text-stone-600">Relations Hierarchy</span>
      </div>

      <div className="space-y-4">
        {/* Dependencies Row */}
        {dependencies.length > 0 ? (
          <div className="space-y-2">
            <span className="font-mono text-[8.5px] text-amber-500 uppercase tracking-widest block font-bold">Composes / Depends On</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {dependencies.map((dep) => (
                <div
                  key={dep.id}
                  onClick={() => actions.selectEntry(dep.id)}
                  className="p-2 rounded border border-stone-900 bg-stone-950/60 hover:border-stone-850 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-mono text-[9.5px] text-stone-300 font-bold block uppercase">{dep.label}</span>
                    <span className="font-mono text-[8px] text-stone-500 block uppercase">{dep.kind}</span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-600">→</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[10.5px] text-stone-600 italic">
            This element does not compose any other primitives.
          </div>
        )}

        {/* Active Node Focus Indicator */}
        <div className="p-3 rounded border border-cyan-500/20 bg-cyan-950/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-mono text-[8px] text-cyan-400 uppercase tracking-wider font-bold">Active Focus Node</span>
            <span className="font-mono text-[10px] text-stone-200 uppercase font-bold block">{entry.label}</span>
          </div>
          <span className="font-mono text-[8.5px] text-cyan-500 border border-cyan-900 px-1 py-0.2 rounded uppercase">
            {entry.kind}
          </span>
        </div>
      </div>
    </div>
  )
}
export default LibrarySystemMap
