"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Card — grid view card
// ─────────────────────────────────────────────────────────────

import Link from "next/link"
import type { PlaybookEntry } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

const MATURITY_COLORS = {
  foundational: "border-neutral-950 text-neutral-950",
  active: "border-emerald-600 text-emerald-700",
  reference: "border-stone-400 text-stone-500",
} as const

const FORMAT_SHORT: Record<string, string> = {
  principle: "PRNC",
  blueprint: "BLPT",
  system: "SYS",
  pattern: "PTTN",
  method: "MTHD",
  checklist: "CHKL",
  "prompt-set": "PMPT",
  template: "TMPL",
  gate: "GATE",
  script: "SCPT",
  reference: "REF",
  "launch-pack": "LNCH",
  "operating-module": "MOD",
}

interface PlaybookCardProps {
  entry: PlaybookEntry
  active?: boolean
  onSelect?: (id: string) => void
  className?: string
}

export function PlaybookCard({
  entry,
  active = false,
  onSelect,
  className,
}: PlaybookCardProps) {
  const readPath = `/playbooks/${entry.slug}`

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-3 rounded-md border bg-white p-4 transition",
        active
          ? "border-neutral-950 shadow-sm"
          : "border-stone-200 hover:border-stone-400",
        className
      )}
      aria-current={active ? "true" : undefined}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[9px] tracking-widest uppercase",
            MATURITY_COLORS[entry.maturity]
          )}
        >
          {FORMAT_SHORT[entry.format] ?? entry.format.slice(0, 4).toUpperCase()}
        </span>
        <span className="font-mono text-[9px] tracking-wider text-stone-400 uppercase">
          {entry.source === "uiux" ? "UI/UX" : "HCK"}
        </span>
      </div>

      {/* Title */}
      <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-950">
        {entry.title}
      </h2>

      {/* Summary */}
      <p className="line-clamp-2 grow font-mono text-[10px] leading-relaxed text-stone-500">
        {entry.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="font-mono text-[9px] text-stone-400">
          {entry.estimatedReadMinutes} min
        </span>
        <div className="flex gap-1">
          {/* Preview button */}
          {onSelect && (
            <button
              type="button"
              id={`playbook-preview-${entry.id}`}
              aria-label={`Preview ${entry.title}`}
              onClick={(e) => {
                e.preventDefault()
                onSelect(entry.id)
              }}
              className="flex h-6 items-center gap-1 rounded border border-stone-200 px-1.5 font-mono text-[9px] text-stone-500 transition hover:border-stone-400 hover:text-neutral-950"
            >
              Preview
            </button>
          )}
          {/* Read link */}
          <Link
            href={readPath}
            id={`playbook-read-${entry.id}`}
            aria-label={`Read ${entry.title}`}
            className="flex h-6 items-center gap-1 rounded border border-neutral-950 bg-neutral-950 px-1.5 font-mono text-[9px] text-white transition hover:bg-neutral-800"
          >
            Read →
          </Link>
        </div>
      </div>

      {/* Active indicator */}
      {active && (
        <span className="absolute inset-y-0 left-0 w-0.5 rounded-l-md bg-neutral-950" />
      )}
    </article>
  )
}
