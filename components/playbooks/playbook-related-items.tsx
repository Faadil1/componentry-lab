"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Related Items — related playbooks sidebar section
// ─────────────────────────────────────────────────────────────

import Link from "next/link"
import type { PlaybookEntry } from "@/lib/playbooks"
import { getRelatedPlaybooks } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

interface PlaybookRelatedItemsProps {
  entry: PlaybookEntry
  className?: string
}

export function PlaybookRelatedItems({ entry, className }: PlaybookRelatedItemsProps) {
  const related = getRelatedPlaybooks(entry.id)
  if (related.length === 0) return null

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
        Related Playbooks
      </span>
      <div className="flex flex-col gap-2">
        {related.map((rel) => (
          <Link
            key={rel.id}
            href={`/playbooks/${rel.slug}`}
            className="group flex flex-col gap-0.5 rounded-md border border-stone-200 bg-white p-2.5 transition hover:border-stone-400"
          >
            <span className="font-mono text-[9px] text-stone-400 uppercase">
              {rel.collectionId.replace(/-/g, " ")} · {rel.format}
            </span>
            <span className="font-mono text-[10px] font-semibold text-neutral-950 leading-snug group-hover:underline">
              {rel.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
