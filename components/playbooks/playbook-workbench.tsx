"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Workbench — main coordinator layout
// Assembles search, filters, results, and preview
// ─────────────────────────────────────────────────────────────

import { usePlaybooks } from "./playbook-provider"
import { PlaybookSearch } from "./playbook-search"
import { PlaybookFilterBar } from "./playbook-filter-bar"
import { PlaybookResultsSummary } from "./playbook-results-summary"
import { PlaybookViewControls } from "./playbook-view-controls"
import { PlaybookGrid } from "./playbook-grid"
import { PlaybookList } from "./playbook-list"
import { PlaybookPreview } from "./playbook-preview"
import { PlaybookReadingPaths } from "./playbook-reading-paths"
import { cn } from "@/lib/utils"

export function PlaybookWorkbench({ className }: { className?: string }) {
  const { state } = usePlaybooks()

  return (
    <div className={cn("mx-auto max-w-screen-xl px-6 py-8", className)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Left: Reading paths + filters */}
        <aside className="flex flex-col gap-6">
          <PlaybookReadingPaths />

          <div id="playbook-filter-bar" aria-label="Playbook filter panel">
            <PlaybookFilterBar />
          </div>
        </aside>

        {/* Right: Search + results + preview */}
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <PlaybookSearch className="flex-1" />
            <div className="flex items-center justify-between gap-3">
              <PlaybookResultsSummary />
              <PlaybookViewControls />
            </div>
          </div>

          {/* Content area: results + preview */}
          <div
            className={cn(
              "grid gap-6",
              state.previewVisible
                ? "grid-cols-1 lg:grid-cols-[1fr_280px]"
                : "grid-cols-1"
            )}
          >
            {/* Results */}
            <div>
              {state.viewMode === "grid" ? <PlaybookGrid /> : <PlaybookList />}
            </div>

            {/* Preview panel */}
            {state.previewVisible && (
              <PlaybookPreview />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
