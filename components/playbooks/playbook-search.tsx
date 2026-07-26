"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Search — keyboard shortcut, / to focus
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react"
import { usePlaybooks } from "./playbook-provider"
import { cn } from "@/lib/utils"

interface PlaybookSearchProps {
  className?: string
}

export function PlaybookSearch({ className }: PlaybookSearchProps) {
  const { state, actions } = usePlaybooks()
  const inputRef = useRef<HTMLInputElement>(null)

  // / shortcut to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        inputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Search icon */}
      <svg
        className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-stone-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.15z"
        />
      </svg>

      <input
        ref={inputRef}
        id="playbook-search"
        type="search"
        aria-label="Search playbooks"
        placeholder="Search playbooks…"
        value={state.query}
        onChange={(e) => actions.setQuery(e.target.value)}
        className="h-9 w-full rounded-md border border-stone-300 bg-white pl-9 pr-16 font-mono text-xs text-neutral-950 placeholder:text-stone-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950"
      />

      {/* Keyboard hint */}
      {!state.query && (
        <kbd className="pointer-events-none absolute right-3 flex h-5 items-center gap-0.5 rounded border border-stone-200 bg-stone-100 px-1.5 font-mono text-[10px] text-stone-500">
          /
        </kbd>
      )}

      {/* Clear button */}
      {state.query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            actions.setQuery("")
            inputRef.current?.focus()
          }}
          className="absolute right-3 flex h-4 w-4 items-center justify-center rounded-sm text-stone-400 transition hover:text-neutral-950"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
