"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Hero — corpus facts, real numbers, identity statement
// ─────────────────────────────────────────────────────────────

import { playbookManifestStats, playbookCategoryList } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

interface PlaybookHeroProps {
  className?: string
}

export function PlaybookHero({ className }: PlaybookHeroProps) {
  const { total, sources, totalWords } = playbookManifestStats
  const readMinutes = Math.round(totalWords / 200)

  return (
    <header className={cn("border-b border-stone-200 bg-stone-50", className)}>
      <div className="mx-auto max-w-screen-xl px-6 py-12">
        {/* Identity ─────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-7 items-center rounded-sm border border-stone-300 bg-white px-2 font-mono text-[10px] tracking-widest text-stone-500 uppercase">
            FIELD MANUAL
          </span>
          <span className="inline-flex h-7 items-center rounded-sm border border-stone-300 bg-white px-2 font-mono text-[10px] tracking-widest text-stone-500 uppercase">
            KNOWLEDGE INDEX
          </span>
        </div>

        <h1 className="mb-3 font-mono text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
          Playbook Knowledge System
        </h1>

        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-stone-600">
          {total} canonical documents covering UI/UX, positioning, evidence, demo video,
          and hackathon operating templates.{" "}
          <span className="text-neutral-950">The component tells you what to build.</span>{" "}
          <span className="text-neutral-950">The playbook tells you what to prove.</span>
        </p>

        {/* Corpus Stats ─────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-px rounded-md border border-stone-200 bg-stone-200 sm:grid-cols-4">
          {[
            { label: "Documents", value: String(total) },
            { label: "Sources", value: `${sources.uiux} UI/UX · ${sources.hackathon} Hackathon` },
            {
              label: "Collections",
              value: String(playbookCategoryList.length),
            },
            {
              label: "Est. Read Time",
              value: `${readMinutes} min`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 bg-stone-50 px-4 py-3"
            >
              <span className="font-mono text-[10px] tracking-widest text-stone-500 uppercase">
                {stat.label}
              </span>
              <span className="font-mono text-sm font-semibold text-neutral-950">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Collection Pills ──────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {playbookCategoryList.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 font-mono text-[10px] tracking-wide text-stone-600 uppercase"
            >
              {cat.label}
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}
