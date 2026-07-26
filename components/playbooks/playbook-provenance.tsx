"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Provenance — SHA-256, source, classification display
// ─────────────────────────────────────────────────────────────

import { useState } from "react"
import type { PlaybookEntry } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

interface PlaybookProvenanceProps {
  entry: PlaybookEntry
  className?: string
}

export function PlaybookProvenance({ entry, className }: PlaybookProvenanceProps) {
  const [copied, setCopied] = useState(false)

  const copyHash = async () => {
    await navigator.clipboard.writeText(entry.sha256)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
        Provenance
      </span>

      <div className="flex flex-col gap-1.5 rounded-md border border-stone-200 bg-stone-50 p-3">
        {[
          { label: "Source", value: entry.source === "uiux" ? "JUDGE-WINNING-UIUX-SYSTEM-V3" : "Assistant Hackathon System" },
          { label: "Classification", value: entry.classification },
          { label: "Canonical", value: String(entry.canonical) },
          { label: "Original Path", value: entry.originalPath },
          { label: "Bytes", value: entry.bytes.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-2">
            <span className="w-24 flex-shrink-0 font-mono text-[9px] text-stone-400 uppercase">
              {label}
            </span>
            <span className="font-mono text-[10px] text-stone-600 break-all">{value}</span>
          </div>
        ))}

        {/* SHA-256 with copy */}
        <div className="flex items-baseline gap-2">
          <span className="w-24 flex-shrink-0 font-mono text-[9px] text-stone-400 uppercase">
            SHA-256
          </span>
          <button
            type="button"
            onClick={copyHash}
            title="Copy SHA-256"
            className="group flex items-baseline gap-1.5"
          >
            <code className="break-all font-mono text-[9px] text-stone-500 transition group-hover:text-neutral-950">
              {entry.sha256.slice(0, 16)}…
            </code>
            <span className="font-mono text-[9px] text-stone-400 transition group-hover:text-neutral-950">
              {copied ? "✓ copied" : "copy"}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
