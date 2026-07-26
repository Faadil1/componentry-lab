"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Document Header — title, badges, meta for reader
// ─────────────────────────────────────────────────────────────

import Link from "next/link"
import type { PlaybookEntry } from "@/lib/playbooks"
import { getReadingPathsContaining } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

interface PlaybookDocumentHeaderProps {
  entry: PlaybookEntry
  className?: string
}

const MATURITY_STYLE = {
  foundational: "border-neutral-950 text-neutral-950",
  active: "border-emerald-600 text-emerald-700",
  reference: "border-stone-400 text-stone-500",
} as const

const ECOSYSTEM_LABEL: Record<string, string> = {
  componentry: "Componentry",
  "universal-demo-film-kit": "→ Demo Film Kit",
  shared: "Shared",
  "reference-only": "Reference",
}

export function PlaybookDocumentHeader({
  entry,
  className,
}: PlaybookDocumentHeaderProps) {
  const inPaths = getReadingPathsContaining(entry.id)

  return (
    <header className={cn("flex flex-col gap-4 pb-6 border-b border-stone-200", className)}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400">
        <Link href="/playbooks" className="transition hover:text-neutral-950">
          Playbooks
        </Link>
        <span aria-hidden="true">/</span>
        <span className="capitalize">
          {entry.collectionId.replace(/-/g, " ")}
        </span>
      </nav>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase",
            MATURITY_STYLE[entry.maturity]
          )}
        >
          {entry.maturity}
        </span>
        <span className="inline-flex items-center rounded-sm border border-stone-300 px-2 py-0.5 font-mono text-[9px] tracking-widest text-stone-500 uppercase">
          {entry.format}
        </span>
        <span className="inline-flex items-center rounded-sm border border-stone-300 px-2 py-0.5 font-mono text-[9px] tracking-widest text-stone-500 uppercase">
          {entry.source === "uiux" ? "UI/UX System" : "Hackathon OS"}
        </span>
        {entry.ecosystemTarget !== "componentry" && (
          <span className="inline-flex items-center rounded-sm border border-stone-300 px-2 py-0.5 font-mono text-[9px] tracking-widest text-stone-500 uppercase">
            {ECOSYSTEM_LABEL[entry.ecosystemTarget]}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="font-mono text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
        {entry.title}
      </h1>

      {/* Summary */}
      <p className="max-w-2xl font-mono text-sm leading-relaxed text-stone-600">
        {entry.summary}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] text-stone-400">
        <span>{entry.wordCount.toLocaleString()} words</span>
        <span>{entry.estimatedReadMinutes} min read</span>
        <span className="uppercase">{entry.classification}</span>
        {inPaths.length > 0 && (
          <span className="text-stone-500">
            In {inPaths.length} reading {inPaths.length === 1 ? "path" : "paths"}
          </span>
        )}
      </div>

      {/* Reading path tags */}
      {inPaths.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {inPaths.map((path) => (
            <Link
              key={path.id}
              href={`/playbooks?path=${path.id}`}
              className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 font-mono text-[9px] tracking-wide text-stone-500 uppercase transition hover:border-neutral-950 hover:text-neutral-950"
            >
              {path.label}
            </Link>
          ))}
        </div>
      )}

      {/* Phases */}
      {entry.phases.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.phases.map((phase) => (
            <span
              key={phase}
              className="rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[9px] text-stone-500 capitalize"
            >
              {phase}
            </span>
          ))}
        </div>
      )}
    </header>
  )
}
