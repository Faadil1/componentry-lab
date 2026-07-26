"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Grid — grid layout of PlaybookCards
// ─────────────────────────────────────────────────────────────

import { usePlaybooks } from "./playbook-provider"
import { PlaybookCard } from "./playbook-card"
import { PlaybookEmptyState } from "./playbook-empty-state"
import { cn } from "@/lib/utils"

export function PlaybookGrid({ className }: { className?: string }) {
  const { state, actions } = usePlaybooks()

  if (state.results.length === 0) {
    return <PlaybookEmptyState />
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
      role="list"
      aria-label="Playbook documents grid"
    >
      {state.results.map((entry) => (
        <div key={entry.id} role="listitem">
          <PlaybookCard
            entry={entry}
            active={state.activePlaybookId === entry.id}
            onSelect={(id) => actions.selectPlaybook(id)}
          />
        </div>
      ))}
    </div>
  )
}
