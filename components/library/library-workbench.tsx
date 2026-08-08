"use client"

// ─────────────────────────────────────────────────────────────
// Registry V2 — Workbench Coordinator
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import { LibraryProvider } from "./library-provider"
import { LibraryHero } from "./library-hero"
import { LibrarySearch } from "./library-search"
import { LibraryFilterBar } from "./library-filter-bar"
import { LibraryResultsSummary } from "./library-results-summary"
import { LibraryViewControls } from "./library-view-controls"
import { LibraryGrid } from "./library-grid"
import { LibraryList } from "./library-list"
import { LibraryDetailPanel } from "./library-detail-panel"
import { LibrarySystemMap } from "./library-system-map"
import { LibraryExport } from "./library-export"
import { LibraryEmptyState } from "./library-empty-state"
import type { LibraryProjectionItem } from "@/lib/library/types"
import { cn } from "@/lib/utils"

export interface LibraryWorkbenchProps {
  entries?: LibraryProjectionItem[]
  categories?: unknown
  initialQuery?: string
  initialViewMode?: "grid" | "list"
  showHero?: boolean
  showFilters?: boolean
  showStats?: boolean
  className?: string
  onEntrySelect?: (entry: LibraryProjectionItem | null) => void
}

function WorkbenchContent({
  showHero,
  showFilters,
}: {
  showHero: boolean
  showFilters: boolean
}) {
  return (
    <div className="space-y-8">
      {showHero && <LibraryHero />}

      {/* Search and view modes bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-stone-900 pb-4">
        <LibrarySearch />
        <div className="flex items-center gap-4">
          <LibraryResultsSummary />
          <LibraryViewControls />
        </div>
      </div>

      {/* Main split dashboard content */}
      <div className="grid gap-6 md:grid-cols-[250px_1fr] items-start">
        {showFilters && <LibraryFilterBar />}

        <div className="space-y-8">
          <LibraryEmptyState />
          <LibraryGrid />
          <LibraryList />

          <div className="grid gap-6 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2 space-y-6">
              <LibrarySystemMap />
              <LibraryExport />
            </div>
            <LibraryDetailPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LibraryWorkbench({
  initialQuery = "",
  initialViewMode = "grid",
  showHero = true,
  showFilters = true,
  className,
  onEntrySelect,
}: LibraryWorkbenchProps) {
  return (
    <LibraryProvider
      initialQuery={initialQuery}
      initialViewMode={initialViewMode}
      onEntrySelect={onEntrySelect}
    >
      <div className={cn("space-y-6", className)}>
        <WorkbenchContent
          showHero={showHero}
          showFilters={showFilters}
        />
      </div>
    </LibraryProvider>
  )
}
export default LibraryWorkbench
