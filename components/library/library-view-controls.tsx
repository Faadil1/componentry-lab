"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import { cn } from "@/lib/utils"

export function LibraryViewControls() {
  const { state, actions } = useComponentLibrary()
  const { viewMode, filtersVisible } = state

  // Keyboard events bindings
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement
      const isEditable =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl && activeEl.getAttribute("contenteditable") === "true")

      if (isEditable) return

      const keyUpper = e.key.toUpperCase()
      if (keyUpper === "G") {
        actions.setViewMode("grid")
      } else if (keyUpper === "L") {
        actions.setViewMode("list")
      } else if (keyUpper === "F") {
        actions.toggleFiltersVisible()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [actions])

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Toggle filters */}
      <button
        type="button"
        onClick={actions.toggleFiltersVisible}
        className={cn(
          "px-3 py-1.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
          filtersVisible
            ? "border-cyan-500/30 bg-cyan-950/20 text-cyan-400"
            : "border-stone-850 bg-stone-900/60 text-stone-400 hover:text-stone-200"
        )}
        aria-pressed={filtersVisible}
      >
        Filters (F)
      </button>

      {/* Grid view mode button */}
      <button
        type="button"
        onClick={() => actions.setViewMode("grid")}
        className={cn(
          "px-3 py-1.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
          viewMode === "grid"
            ? "border-cyan-500/30 bg-cyan-950/20 text-cyan-400"
            : "border-stone-850 bg-stone-900/60 text-stone-400 hover:text-stone-200"
        )}
        aria-pressed={viewMode === "grid"}
        aria-label="Set grid layout"
      >
        Grid (G)
      </button>

      {/* List view mode button */}
      <button
        type="button"
        onClick={() => actions.setViewMode("list")}
        className={cn(
          "px-3 py-1.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
          viewMode === "list"
            ? "border-cyan-500/30 bg-cyan-950/20 text-cyan-400"
            : "border-stone-850 bg-stone-900/60 text-stone-400 hover:text-stone-200"
        )}
        aria-pressed={viewMode === "list"}
        aria-label="Set list layout"
      >
        List (L)
      </button>
    </div>
  )
}
export default LibraryViewControls
