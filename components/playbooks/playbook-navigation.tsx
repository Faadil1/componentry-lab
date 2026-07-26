"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Navigation — prev/next within collection
// ─────────────────────────────────────────────────────────────

import Link from "next/link"
import type { PlaybookEntry } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

interface PlaybookNavigationProps {
  prev: PlaybookEntry | null
  next: PlaybookEntry | null
  className?: string
}

export function PlaybookNavigation({ prev, next, className }: PlaybookNavigationProps) {
  if (!prev && !next) return null

  return (
    <nav
      className={cn(
        "flex items-center justify-between gap-4 border-t border-stone-200 pt-6",
        className
      )}
      aria-label="Document navigation"
    >
      {prev ? (
        <Link
          href={`/playbooks/${prev.slug}`}
          aria-label={`Previous: ${prev.title}`}
          className="group flex flex-col gap-0.5 max-w-xs"
        >
          <span className="font-mono text-[9px] text-stone-400 uppercase">← Previous</span>
          <span className="font-mono text-[10px] font-semibold text-neutral-950 leading-snug group-hover:underline">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/playbooks/${next.slug}`}
          aria-label={`Next: ${next.title}`}
          className="group flex flex-col gap-0.5 items-end text-right max-w-xs"
        >
          <span className="font-mono text-[9px] text-stone-400 uppercase">Next →</span>
          <span className="font-mono text-[10px] font-semibold text-neutral-950 leading-snug group-hover:underline">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
