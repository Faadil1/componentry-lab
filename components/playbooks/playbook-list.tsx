"use client"

// ─────────────────────────────────────────────────────────────
// Playbook List — table-style list view
// ─────────────────────────────────────────────────────────────

import Link from "next/link"
import { usePlaybooks } from "./playbook-provider"
import { PlaybookEmptyState } from "./playbook-empty-state"
import { cn } from "@/lib/utils"

export function PlaybookList({ className }: { className?: string }) {
  const { state, actions } = usePlaybooks()

  if (state.results.length === 0) {
    return <PlaybookEmptyState />
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table
        className="w-full border-collapse font-mono text-xs"
        aria-label="Playbook documents list"
      >
        <thead>
          <tr className="border-b border-stone-200">
            {["Title", "Collection", "Format", "Source", "Min", ""].map((h) => (
              <th
                key={h}
                scope="col"
                className="py-2 pr-4 text-left text-[9px] tracking-widest text-stone-400 uppercase first:pl-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.results.map((entry, i) => {
            const isActive = state.activePlaybookId === entry.id
            return (
              <tr
                key={entry.id}
                className={cn(
                  "border-b border-stone-100 transition",
                  isActive
                    ? "bg-neutral-50"
                    : "hover:bg-stone-50"
                )}
                aria-current={isActive ? "true" : undefined}
              >
                {/* Row number + title */}
                <td className="py-2.5 pr-4 max-w-xs">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[9px] text-stone-300 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      id={`playbook-list-${entry.id}`}
                      onClick={() => actions.selectPlaybook(isActive ? null : entry.id)}
                      className="truncate text-left font-semibold text-neutral-950 hover:underline"
                    >
                      {entry.title}
                    </button>
                  </div>
                </td>
                {/* Collection */}
                <td className="py-2.5 pr-4 text-[10px] text-stone-500 capitalize whitespace-nowrap">
                  {entry.collectionId.replace(/-/g, " ")}
                </td>
                {/* Format */}
                <td className="py-2.5 pr-4 text-[10px] text-stone-500 whitespace-nowrap">
                  {entry.format}
                </td>
                {/* Source */}
                <td className="py-2.5 pr-4">
                  <span className="rounded-sm border border-stone-200 px-1.5 py-0.5 text-[9px] text-stone-500 uppercase">
                    {entry.source === "uiux" ? "UI/UX" : "HCK"}
                  </span>
                </td>
                {/* Read time */}
                <td className="py-2.5 pr-4 text-stone-400 tabular-nums">
                  {entry.estimatedReadMinutes}
                </td>
                {/* Actions */}
                <td className="py-2.5 text-right">
                  <Link
                    href={`/playbooks/${entry.slug}`}
                    id={`playbook-list-read-${entry.id}`}
                    aria-label={`Read ${entry.title}`}
                    className="font-mono text-[9px] text-neutral-950 underline underline-offset-2 hover:no-underline"
                  >
                    Read →
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
