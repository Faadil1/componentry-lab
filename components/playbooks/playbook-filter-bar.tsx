"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Filter Bar
// ─────────────────────────────────────────────────────────────

import { usePlaybooks } from "./playbook-provider"
import { playbookCategoryList } from "@/lib/playbooks"
import { cn } from "@/lib/utils"
import type {
  PlaybookCollectionId,
  PlaybookSource,
  PlaybookFormat,
} from "@/lib/playbooks"

interface PlaybookFilterBarProps {
  className?: string
}

const FORMAT_LABELS: Record<PlaybookFormat, string> = {
  principle: "Principle",
  blueprint: "Blueprint",
  system: "System",
  pattern: "Pattern",
  method: "Method",
  checklist: "Checklist",
  "prompt-set": "Prompt Set",
  template: "Template",
  gate: "Gate",
  script: "Script",
  reference: "Reference",
  "launch-pack": "Launch Pack",
  "operating-module": "Module",
}

function FilterPill({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wide uppercase transition",
        active
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-stone-300 bg-white text-stone-600 hover:border-neutral-500 hover:text-neutral-950"
      )}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "rounded-full px-1 py-px text-[9px] font-bold tabular-nums",
            active ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function FilterSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

const ACTIVE_FORMATS: PlaybookFormat[] = [
  "principle", "blueprint", "system", "pattern",
  "method", "checklist", "prompt-set", "template",
  "gate", "script", "reference", "operating-module",
]

export function PlaybookFilterBar({ className }: PlaybookFilterBarProps) {
  const { state, actions } = usePlaybooks()

  const hasFilters =
    state.selectedCollections.length > 0 ||
    state.selectedSources.length > 0 ||
    state.selectedFormats.length > 0 ||
    state.selectedPhases.length > 0

  return (
    <aside
      className={cn("flex flex-col gap-5 py-4", className)}
      aria-label="Playbook filters"
    >
      {/* Collections */}
      <FilterSection label="Collection">
        {playbookCategoryList.map((cat) => (
          <FilterPill
            key={cat.id}
            active={state.selectedCollections.includes(cat.id)}
            onClick={() => actions.toggleCollection(cat.id)}
            count={state.counts.collections[cat.id as PlaybookCollectionId]}
          >
            {cat.label}
          </FilterPill>
        ))}
      </FilterSection>

      {/* Source */}
      <FilterSection label="Source">
        {(["uiux", "hackathon"] as PlaybookSource[]).map((src) => (
          <FilterPill
            key={src}
            active={state.selectedSources.includes(src)}
            onClick={() => actions.toggleSource(src)}
            count={state.counts.sources[src]}
          >
            {src === "uiux" ? "UI/UX System" : "Hackathon OS"}
          </FilterPill>
        ))}
      </FilterSection>

      {/* Format */}
      <FilterSection label="Format">
        {ACTIVE_FORMATS.filter(
          (f) => (state.counts.formats[f] ?? 0) > 0
        ).map((fmt) => (
          <FilterPill
            key={fmt}
            active={state.selectedFormats.includes(fmt)}
            onClick={() => actions.toggleFormat(fmt)}
            count={state.counts.formats[fmt]}
          >
            {FORMAT_LABELS[fmt]}
          </FilterPill>
        ))}
      </FilterSection>

      {/* Clear */}
      {hasFilters && (
        <button
          type="button"
          onClick={actions.clearFilters}
          className="self-start font-mono text-[10px] tracking-wide text-stone-500 underline underline-offset-2 transition hover:text-neutral-950"
        >
          Clear all filters
        </button>
      )}
    </aside>
  )
}
