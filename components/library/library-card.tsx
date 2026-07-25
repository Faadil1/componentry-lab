"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import type { RegistryEntry } from "@/lib/registry/types"
import { cn } from "@/lib/utils"

export interface LibraryCardProps {
  entry: RegistryEntry
}

export function LibraryCard({ entry }: LibraryCardProps) {
  const { state, actions } = useComponentLibrary()
  const { activeEntryId } = state
  const isSelected = activeEntryId === entry.id

  const caps = entry.capabilities.slice(0, 3)

  return (
    <div
      onClick={() => actions.selectEntry(isSelected ? null : entry.id)}
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
          {entry.kind}
        </span>
        <span className={cn(
          "font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.2 rounded border",
          entry.maturity === "production-candidate"
            ? "border-emerald-950/45 bg-emerald-950/20 text-emerald-400"
            : entry.maturity === "reusable"
              ? "border-cyan-950/45 bg-cyan-950/20 text-cyan-400"
              : "border-stone-800 bg-stone-900 text-stone-500"
        )}>
          {entry.maturity.replace("-", " ")}
        </span>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h4 className={cn("text-xs font-bold uppercase tracking-wider font-mono", isSelected ? "text-cyan-400" : "text-stone-200")}>
          {entry.label}
        </h4>
        <p className="text-[10.5px] text-stone-500 leading-normal line-clamp-2">
          {entry.summary}
        </p>
      </div>

      {/* capabilities list tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {caps.map((cap) => (
          <span key={cap} className="font-mono text-[7px] text-stone-600 border border-stone-900 px-1 py-0.2 rounded uppercase">
            {cap.replace("-", " ")}
          </span>
        ))}
      </div>

      {/* Footer info */}
      <div className="border-t border-stone-900 pt-3 flex justify-between items-center text-[8px] font-mono text-stone-600">
        <span>RELATIONS: {entry.relations.length}</span>
        {entry.deterministic && (
          <span className="text-cyan-600 font-bold uppercase">DETERMINISTIC</span>
        )}
      </div>
    </div>
  )
}
export default LibraryCard
