"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Preview Panel — quick metadata view
// ─────────────────────────────────────────────────────────────

import Link from "next/link"
import { usePlaybooks } from "./playbook-provider"
import { getPlaybookById, getRelatedPlaybooks, getReadingPathsContaining } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

export function PlaybookPreview({ className }: { className?: string }) {
  const { state, actions } = usePlaybooks()
  const { activePlaybookId, previewVisible } = state

  const entry = activePlaybookId ? getPlaybookById(activePlaybookId) : null

  if (!previewVisible || !entry) return null

  const related = getRelatedPlaybooks(entry.id).slice(0, 3)
  const inPaths = getReadingPathsContaining(entry.id)

  return (
    <aside
      className={cn(
        "flex flex-col gap-4 rounded-md border border-stone-200 bg-stone-50 p-4",
        className
      )}
      aria-label={`Preview: ${entry.title}`}
    >
      {/* Close */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
            {entry.collectionId.replace(/-/g, " ")} · {entry.format}
          </span>
          <h2 className="font-mono text-sm font-semibold text-neutral-950 leading-snug">
            {entry.title}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close preview"
          onClick={actions.closePreview}
          className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-md border border-stone-200 text-stone-400 transition hover:border-stone-400 hover:text-neutral-950"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 12 12" aria-hidden="true">
            <path strokeLinecap="round" strokeWidth={1.5} d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>
      </div>

      {/* Summary */}
      <p className="font-mono text-[10px] leading-relaxed text-stone-600">
        {entry.summary}
      </p>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Source", value: entry.source === "uiux" ? "UI/UX System" : "Hackathon OS" },
          { label: "Maturity", value: entry.maturity },
          { label: "Words", value: String(entry.wordCount) },
          { label: "Read", value: `${entry.estimatedReadMinutes} min` },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">{label}</span>
            <span className="font-mono text-[10px] font-semibold text-neutral-950 capitalize">{value}</span>
          </div>
        ))}
      </div>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-stone-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Reading paths */}
      {inPaths.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">Reading Paths</span>
          {inPaths.map((path) => (
            <span
              key={path.id}
              className="font-mono text-[10px] text-stone-600 leading-snug"
            >
              → {path.label}
            </span>
          ))}
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">Related</span>
          {related.map((rel) => (
            <Link
              key={rel.id}
              href={`/playbooks/${rel.slug}`}
              className="font-mono text-[10px] text-neutral-950 underline underline-offset-2 hover:no-underline"
            >
              {rel.title}
            </Link>
          ))}
        </div>
      )}

      {/* Read CTA */}
      <Link
        href={`/playbooks/${entry.slug}`}
        className="mt-1 flex h-8 items-center justify-center rounded-md bg-neutral-950 font-mono text-[10px] tracking-wide text-white transition hover:bg-neutral-800"
      >
        Read Full Document →
      </Link>
    </aside>
  )
}
