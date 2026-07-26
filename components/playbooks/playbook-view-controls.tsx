"use client"

// ─────────────────────────────────────────────────────────────
// Playbook View Controls — G (grid), L (list), F (filters)
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react"
import { usePlaybooks } from "./playbook-provider"
import { cn } from "@/lib/utils"

export function PlaybookViewControls({ className }: { className?: string }) {
  const { state, actions } = usePlaybooks()

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return
      if (e.key === "g" || e.key === "G") actions.setViewMode("grid")
      if (e.key === "l" || e.key === "L") actions.setViewMode("list")
      if (e.key === "f" || e.key === "F") actions.toggleFiltersVisible()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [actions])

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="group"
      aria-label="View controls"
    >
      {/* Grid */}
      <button
        type="button"
        id="playbook-view-grid"
        aria-pressed={state.viewMode === "grid"}
        onClick={() => actions.setViewMode("grid")}
        title="Grid view (G)"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border transition",
          state.viewMode === "grid"
            ? "border-neutral-950 bg-neutral-950 text-white"
            : "border-stone-300 bg-white text-stone-500 hover:border-neutral-500"
        )}
      >
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
        <span className="sr-only">Grid view</span>
      </button>

      {/* List */}
      <button
        type="button"
        id="playbook-view-list"
        aria-pressed={state.viewMode === "list"}
        onClick={() => actions.setViewMode("list")}
        title="List view (L)"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border transition",
          state.viewMode === "list"
            ? "border-neutral-950 bg-neutral-950 text-white"
            : "border-stone-300 bg-white text-stone-500 hover:border-neutral-500"
        )}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <line x1="3" y1="4" x2="13" y2="4" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="8" x2="13" y2="8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="12" x2="13" y2="12" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="sr-only">List view</span>
      </button>

      {/* Filters toggle */}
      <button
        type="button"
        id="playbook-filters-toggle"
        aria-expanded={state.filtersVisible}
        aria-controls="playbook-filter-bar"
        onClick={actions.toggleFiltersVisible}
        title="Toggle filters (F)"
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md border px-2 font-mono text-[10px] tracking-wide uppercase transition",
          state.filtersVisible
            ? "border-neutral-950 bg-neutral-950 text-white"
            : "border-stone-300 bg-white text-stone-500 hover:border-neutral-500"
        )}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 4h12M5 8h6M8 12h0" />
        </svg>
        Filters
        {(state.selectedCollections.length +
          state.selectedSources.length +
          state.selectedFormats.length) > 0 && (
          <span
            className={cn(
              "rounded-full px-1.5 py-px text-[9px] font-bold tabular-nums",
              state.filtersVisible ? "bg-white/20" : "bg-stone-100 text-stone-600"
            )}
          >
            {state.selectedCollections.length +
              state.selectedSources.length +
              state.selectedFormats.length}
          </span>
        )}
      </button>
    </div>
  )
}
