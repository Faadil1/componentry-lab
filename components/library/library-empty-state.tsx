"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import { cn } from "@/lib/utils"

export interface LibraryEmptyStateProps {
  className?: string
}

export function LibraryEmptyState({ className }: LibraryEmptyStateProps) {
  const { state, actions } = useComponentLibrary()
  const { resultCount } = state

  if (resultCount > 0) return null

  return (
    <div className={cn("rounded-xl border border-dashed border-stone-850 p-12 text-center space-y-4 max-w-md mx-auto", className)}>
      <div className="space-y-1">
        <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest block font-bold">
          Zero matches found
        </span>
        <h4 className="text-sm font-bold text-stone-200 uppercase font-mono tracking-wide">
          No matching components
        </h4>
        <p className="text-[11px] text-stone-500 leading-normal max-w-xs mx-auto">
          No registered entries match your search criteria. Try clearing some filters to broaden your search.
        </p>
      </div>
      <button
        type="button"
        onClick={actions.clearFilters}
        className="px-4 py-2 rounded bg-stone-900 border border-stone-850 hover:border-stone-800 text-stone-200 hover:text-stone-100 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors"
      >
        Clear Active Filters
      </button>
    </div>
  )
}
export default LibraryEmptyState
