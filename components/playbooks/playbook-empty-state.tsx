"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Empty State
// ─────────────────────────────────────────────────────────────

import { usePlaybooks } from "./playbook-provider"
import { cn } from "@/lib/utils"

export function PlaybookEmptyState({ className }: { className?: string }) {
  const { state, actions } = usePlaybooks()

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-20 text-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 bg-stone-50">
        <svg
          className="h-5 w-5 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-3-3v6M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-mono text-sm font-semibold text-neutral-950">
          No documents match
        </p>
        {state.query && (
          <p className="font-mono text-xs text-stone-500">
            No results for &ldquo;{state.query}&rdquo;
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={actions.clearFilters}
        className="rounded-md border border-stone-300 bg-white px-3 py-1.5 font-mono text-xs text-stone-600 transition hover:border-neutral-950 hover:text-neutral-950"
      >
        Clear filters
      </button>
    </div>
  )
}
