"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import type { LibraryProjectionItem } from "@/lib/library/types"
import { cn } from "@/lib/utils"

export interface LibraryCardProps {
  entry: LibraryProjectionItem
}

export function LibraryCard({ entry }: LibraryCardProps) {
  const { state, actions } = useComponentLibrary()
  const { activeEntryId } = state
  const isSelected = activeEntryId === entry.projectionId

  const caps = entry.capabilityRefs.slice(0, 3)

  return (
    <div
      onClick={() => actions.selectEntry(isSelected ? null : entry.projectionId)}
      className={cn(
        "rounded-xl border p-4 text-left transition-all cursor-pointer select-none space-y-3 relative overflow-hidden",
        isSelected
          ? "border-cyan-500/40 bg-stone-900 shadow-sm"
          : "border-stone-850 bg-[#0e0d0c] hover:border-stone-800 text-stone-400 hover:text-stone-300"
      )}
    >
      {/* Top badges */}
      <div className="flex justify-between items-center">
        <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500">
          {entry.sourceKind === "COMPONENT" && entry.componentDetails?.kind}
          {entry.sourceKind === "CREATIVE_RESOURCE" && entry.resourceDetails?.resourceType.replace(/_/g, " ")}
        </span>
        <span className={cn(
          "font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.2 rounded border",
          entry.status.value === "production-candidate" || entry.status.value === "APPROVED" || entry.status.value === "VALIDATED"
            ? "border-emerald-950/45 bg-emerald-950/20 text-emerald-400"
            : entry.status.value === "reusable" || entry.status.value === "TEST_CANDIDATE" || entry.status.value === "TESTING"
              ? "border-cyan-950/45 bg-cyan-950/20 text-cyan-400"
              : "border-stone-800 bg-stone-900 text-stone-500"
        )} title={entry.status.namespace}>
          {entry.status.value.replace(/-/g, " ").replace(/_/g, " ")}
        </span>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h4 className={cn("text-xs font-bold uppercase tracking-wider font-mono", isSelected ? "text-cyan-400" : "text-stone-200")}>
          {entry.title}
        </h4>
        <p className="text-[10.5px] text-stone-500 leading-normal line-clamp-2">
          {entry.description}
        </p>
      </div>

      {/* capabilities list tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {caps.map((cap) => (
          <span key={cap} className="font-mono text-[7px] text-stone-600 border border-stone-900 px-1 py-0.2 rounded uppercase truncate max-w-full">
            {cap.replace(/-/g, " ").replace(/_/g, " ")}
          </span>
        ))}
        {entry.capabilityRefs.length > 3 && (
          <span className="font-mono text-[7px] text-stone-700 px-1 py-0.2">
            +{entry.capabilityRefs.length - 3}
          </span>
        )}
      </div>

      {/* Footer info */}
      <div className="border-t border-stone-900 pt-3 flex justify-between items-center text-[8px] font-mono text-stone-600">
        <span>
          {entry.sourceKind === "COMPONENT" && entry.componentDetails && `RELATIONS: ${entry.componentDetails.entry.relations.length}`}
          {entry.sourceKind === "CREATIVE_RESOURCE" && entry.resourceDetails && `AUTH: ${entry.resourceDetails.maxExecutionAuthority}`}
        </span>
        {entry.sourceKind === "COMPONENT" && entry.componentDetails?.deterministic && (
          <span className="text-cyan-600 font-bold uppercase">DETERMINISTIC</span>
        )}
        {entry.sourceKind === "CREATIVE_RESOURCE" && entry.resourceDetails?.license && (
          <span className="text-stone-500 font-bold uppercase">{entry.resourceDetails.license}</span>
        )}
      </div>
    </div>
  )
}
export default LibraryCard
