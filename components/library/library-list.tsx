"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import { cn } from "@/lib/utils"

export interface LibraryListProps {
  className?: string
}

export function LibraryList({ className }: LibraryListProps) {
  const { state, actions } = useComponentLibrary()
  const { results, viewMode, activeEntryId } = state

  if (viewMode !== "list") return null

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-stone-850 bg-[#0e0d0c]", className)}>
      <table className="w-full text-left font-mono text-[10px] text-stone-400 select-none">
        <thead>
          <tr className="border-b border-stone-850 bg-stone-900/40 uppercase tracking-widest text-[8.5px] text-stone-500 font-bold">
            <th className="px-4 py-3">Label</th>
            <th className="px-4 py-3">Kind / Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Capabilities</th>
            <th className="px-4 py-3">Primary Export / Auth</th>
            <th className="px-4 py-3">Route / Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((entry) => {
            const isSelected = activeEntryId === entry.projectionId
            return (
              <tr
                key={entry.projectionId}
                onClick={() => actions.selectEntry(isSelected ? null : entry.projectionId)}
                className={cn(
                  "border-b border-stone-900 last:border-0 hover:bg-stone-900/30 transition-colors cursor-pointer",
                  isSelected && "bg-stone-900"
                )}
              >
                <td className="px-4 py-3.5 font-bold text-stone-200 uppercase">{entry.title}</td>
                <td className="px-4 py-3.5 uppercase">
                  {entry.sourceKind === "COMPONENT" && entry.componentDetails?.kind}
                  {entry.sourceKind === "CREATIVE_RESOURCE" && entry.resourceDetails?.resourceType.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3.5 uppercase">{entry.status.value.replace(/-/g, " ").replace(/_/g, " ")}</td>
                <td className="px-4 py-3.5 text-stone-500 truncate max-w-[200px]" title={entry.capabilityRefs.join(", ")}>
                  {entry.capabilityRefs[0]?.replace(/-/g, " ").replace(/_/g, " ") || "—"}
                  {entry.capabilityRefs.length > 1 && ` (+${entry.capabilityRefs.length - 1})`}
                </td>
                <td className="px-4 py-3.5 text-cyan-500 font-bold truncate max-w-[150px]">
                  {entry.sourceKind === "COMPONENT" && entry.componentDetails?.entry.primaryExport}
                  {entry.sourceKind === "CREATIVE_RESOURCE" && entry.resourceDetails?.maxExecutionAuthority.replace(/_/g, " ")}
                  {(!entry.componentDetails?.entry.primaryExport && !entry.resourceDetails?.maxExecutionAuthority) && "—"}
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-stone-600 hover:text-stone-300">
                    {entry.href || "—"}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
export default LibraryList
