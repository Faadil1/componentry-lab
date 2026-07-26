"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Results Summary — aria-live count
// ─────────────────────────────────────────────────────────────

import { usePlaybooks } from "./playbook-provider"
import { cn } from "@/lib/utils"
import { MANIFEST_ENTRY_COUNT } from "@/lib/playbooks"

export function PlaybookResultsSummary({ className }: { className?: string }) {
  const { state } = usePlaybooks()
  const total = MANIFEST_ENTRY_COUNT
  const count = state.resultCount

  return (
    <p
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "font-mono text-[10px] tracking-wide text-stone-500 uppercase",
        className
      )}
    >
      {count === total
        ? `${total} documents`
        : `${count} of ${total} documents`}
      {state.query && (
        <span className="ml-1.5 text-stone-400">for &ldquo;{state.query}&rdquo;</span>
      )}
    </p>
  )
}
