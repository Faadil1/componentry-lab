"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Table of Contents
// ─────────────────────────────────────────────────────────────

import type { PlaybookHeading } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

interface PlaybookTableOfContentsProps {
  headings: PlaybookHeading[]
  className?: string
}

export function PlaybookTableOfContents({
  headings,
  className,
}: PlaybookTableOfContentsProps) {
  // Filter out h1 (document title) and only show h2/h3
  const tocItems = headings.filter((h) => h.level === 2 || h.level === 3)

  if (tocItems.length < 2) return null

  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Table of contents"
    >
      <span className="mb-2 font-mono text-[9px] tracking-widest text-stone-400 uppercase">
        Contents
      </span>
      {tocItems.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={cn(
            "block truncate font-mono text-[10px] leading-relaxed text-stone-500 transition hover:text-neutral-950",
            heading.level === 3 && "pl-3 text-stone-400"
          )}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  )
}
