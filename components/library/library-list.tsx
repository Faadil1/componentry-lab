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
            <th className="px-4 py-3">Kind</th>
            <th className="px-4 py-3">Maturity</th>
            <th className="px-4 py-3">Recommended For</th>
            <th className="px-4 py-3">Primary Export</th>
            <th className="px-4 py-3">Route</th>
          </tr>
        </thead>
        <tbody>
          {results.map((entry) => {
            const isSelected = activeEntryId === entry.id
            return (
              <tr
                key={entry.id}
                onClick={() => actions.selectEntry(isSelected ? null : entry.id)}
                className={cn(
                  "border-b border-stone-900 last:border-0 hover:bg-stone-900/30 transition-colors cursor-pointer",
                  isSelected && "bg-stone-900"
                )}
              >
                <td className="px-4 py-3.5 font-bold text-stone-200 uppercase">{entry.label}</td>
                <td className="px-4 py-3.5 uppercase">{entry.kind}</td>
                <td className="px-4 py-3.5 uppercase">{entry.maturity.replace("-", " ")}</td>
                <td className="px-4 py-3.5 text-stone-500 truncate max-w-[200px]" title={entry.recommendedFor.join(", ")}>
                  {entry.recommendedFor[0] || "—"}
                </td>
                <td className="px-4 py-3.5 text-cyan-500 font-bold truncate max-w-[150px]">
                  {entry.primaryExport || "—"}
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-stone-600 hover:text-stone-300">
                    {entry.route}
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
