"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Copy Controls — copy source path, metadata, raw MD
// ─────────────────────────────────────────────────────────────

import { useState } from "react"
import type { PlaybookEntry } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

interface PlaybookCopyControlsProps {
  entry: PlaybookEntry
  className?: string
}

type CopyTarget = "path" | "metadata"

export function PlaybookCopyControls({ entry, className }: PlaybookCopyControlsProps) {
  const [copied, setCopied] = useState<CopyTarget | null>(null)

  const copy = async (target: CopyTarget) => {
    let text = ""
    if (target === "path") {
      text = entry.publicTargetPath
    } else if (target === "metadata") {
      text = JSON.stringify(
        {
          id: entry.id,
          title: entry.title,
          slug: entry.slug,
          collectionId: entry.collectionId,
          source: entry.source,
          format: entry.format,
          phases: entry.phases,
          audiences: entry.audiences,
          outcomes: entry.outcomes,
          tags: entry.tags,
          summary: entry.summary,
          sha256: entry.sha256,
          publicTargetPath: entry.publicTargetPath,
          wordCount: entry.wordCount,
          estimatedReadMinutes: entry.estimatedReadMinutes,
        },
        null,
        2
      )
    }
    await navigator.clipboard.writeText(text)
    setCopied(target)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
        Copy
      </span>
      <div className="flex flex-wrap gap-1.5">
        {(["path", "metadata"] as CopyTarget[]).map((target) => (
          <button
            key={target}
            type="button"
            id={`playbook-copy-${target}-${entry.id}`}
            aria-label={`Copy ${target} for ${entry.title}`}
            onClick={() => copy(target)}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[9px] tracking-wide uppercase transition",
              copied === target
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-stone-300 bg-white text-stone-500 hover:border-stone-500 hover:text-neutral-950"
            )}
          >
            {copied === target ? "✓ Copied" : target === "path" ? "Source Path" : "Metadata JSON"}
          </button>
        ))}
      </div>
    </div>
  )
}
