"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Reading Paths — all 5 paths list
// ─────────────────────────────────────────────────────────────

import { playbookReadingPaths, getPlaybookById } from "@/lib/playbooks"
import { usePlaybooks } from "./playbook-provider"
import { cn } from "@/lib/utils"

const ECOSYSTEM_LABEL: Record<string, string> = {
  componentry: "Componentry",
  "universal-demo-film-kit": "Demo Film Kit ↗",
  shared: "Shared",
  "reference-only": "Reference",
}

export function PlaybookReadingPaths({ className }: { className?: string }) {
  const { state, actions } = usePlaybooks()

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
          Reading Paths
        </h2>
        <span className="font-mono text-[9px] text-stone-400">
          {playbookReadingPaths.length} paths
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {playbookReadingPaths.map((path) => {
          const isActive = state.selectedReadingPathId === path.id
          return (
            <button
              key={path.id}
              type="button"
              id={`playbook-path-${path.id}`}
              onClick={() =>
                actions.selectReadingPath(isActive ? null : path.id)
              }
              aria-expanded={isActive}
              className={cn(
                "group flex flex-col gap-2 rounded-md border p-3 text-left transition",
                isActive
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-stone-200 bg-white hover:border-stone-400"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "font-mono text-[10px] font-bold tracking-wide uppercase",
                    isActive ? "text-white" : "text-neutral-950"
                  )}
                >
                  {path.label}
                </span>
                <span
                  className={cn(
                    "flex-shrink-0 font-mono text-[9px]",
                    isActive ? "text-white/60" : "text-stone-400"
                  )}
                >
                  {path.steps.length} steps · {path.estimatedMinutes}m
                </span>
              </div>

              <p
                className={cn(
                  "font-mono text-[10px] leading-relaxed",
                  isActive ? "text-white/80" : "text-stone-500"
                )}
              >
                {path.description}
              </p>

              {/* Ecosystem target */}
              {path.ecosystemTarget !== "componentry" && (
                <span
                  className={cn(
                    "self-start rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase",
                    isActive
                      ? "border-white/30 text-white/70"
                      : "border-stone-200 text-stone-400"
                  )}
                >
                  {ECOSYSTEM_LABEL[path.ecosystemTarget]}
                </span>
              )}

              {/* Steps preview when active */}
              {isActive && (
                <ol className="mt-1 flex flex-col gap-1">
                  {path.steps.map((step, i) => {
                    const entry = getPlaybookById(step.playbookId)
                    return (
                      <li key={step.playbookId} className="flex items-baseline gap-2">
                        <span className="font-mono text-[9px] text-white/40 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-[10px] text-white/90">
                          {entry?.title ?? step.playbookId}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
