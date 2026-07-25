"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import { getRecommendedRegistryEntries, getRegistryEntryById } from "@/lib/registry/selectors"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface LibraryDetailPanelProps {
  className?: string
}

export function LibraryDetailPanel({ className }: LibraryDetailPanelProps) {
  const { state, actions } = useComponentLibrary()
  const { activeEntryId, detailVisible } = state

  const entry = React.useMemo(() => {
    return activeEntryId ? getRegistryEntryById(activeEntryId) || null : null
  }, [activeEntryId])

  // ESC close key bindings
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && detailVisible) {
        actions.closeDetail()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [detailVisible, actions])

  if (!detailVisible || !entry) return null

  const bestMatches = getRecommendedRegistryEntries(entry)

  return (
    <div className={cn("rounded-xl border border-stone-850 bg-[#0c0b0a] p-5 space-y-6 select-none text-xs text-stone-400 relative", className)}>
      {/* Top title */}
      <div className="flex justify-between items-start border-b border-stone-900 pb-3">
        <div className="space-y-1 text-left">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold block">
            {entry.kind} / {entry.categoryId}
          </span>
          <h3 className="text-sm font-bold text-stone-200 uppercase font-mono tracking-wide">
            {entry.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={actions.closeDetail}
          className="font-mono text-[9px] text-stone-500 uppercase tracking-widest font-bold hover:text-stone-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
          aria-label="Close detail panel"
        >
          Close (ESC)
        </button>
      </div>

      {/* memory hook */}
      {entry.memoryHook && (
        <p className="font-mono text-[10.5px] italic text-cyan-400 border-l border-cyan-800/40 pl-3">
          &ldquo;{entry.memoryHook}&rdquo;
        </p>
      )}

      {/* Description */}
      <div className="space-y-2 text-left leading-relaxed">
        <p className="text-[11.5px] text-stone-300">{entry.description}</p>
      </div>

      {/* Primary specs grid */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-stone-900 pt-4">
        <div>
          <span className="text-stone-500 block uppercase">Maturity Level</span>
          <span className="text-stone-300 font-bold uppercase">{entry.maturity.replace("-", " ")}</span>
        </div>
        <div>
          <span className="text-stone-500 block uppercase">SSR Safe</span>
          <span className={cn("font-bold uppercase", entry.ssrSafe ? "text-emerald-400" : "text-amber-500")}>
            {entry.ssrSafe ? "YES" : "NO"}
          </span>
        </div>
        <div>
          <span className="text-stone-500 block uppercase">Deterministic</span>
          <span className={cn("font-bold uppercase", entry.deterministic ? "text-emerald-400" : "text-stone-400")}>
            {entry.deterministic ? "YES" : "NO"}
          </span>
        </div>
        <div>
          <span className="text-stone-500 block uppercase">Capture Ready</span>
          <span className={cn("font-bold uppercase", entry.captureReady ? "text-emerald-400" : "text-stone-400")}>
            {entry.captureReady ? "YES" : "NO"}
          </span>
        </div>
      </div>

      {/* Navigation action open route */}
      <Link
        href={entry.route}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-stone-900 border border-stone-850 hover:border-stone-800 text-stone-200 hover:text-stone-100 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors text-center"
      >
        Open Lab Demonstration →
      </Link>

      {/* Source paths & exports details */}
      <div className="space-y-3 border-t border-stone-900 pt-4 text-left">
        <div>
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block font-bold mb-1">Source Files</span>
          <ul className="space-y-1 font-mono text-[10px] text-stone-400">
            {entry.sourcePaths.map((p) => (
              <li key={p} className="truncate" title={p}>{p}</li>
            ))}
          </ul>
        </div>

        {entry.primaryExport && (
          <div>
            <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block font-bold mb-0.5">Primary Export</span>
            <span className="font-mono text-[10px] text-cyan-400 font-bold">{entry.primaryExport}</span>
          </div>
        )}

        {entry.componentExports && entry.componentExports.length > 0 && (
          <div>
            <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block font-bold mb-1">Component Exports</span>
            <div className="flex flex-wrap gap-1.5">
              {entry.componentExports.map((exp) => (
                <span key={exp} className="font-mono text-[9.5px] text-stone-300 bg-stone-950 px-1.5 py-0.2 rounded border border-stone-900">
                  {exp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Best matches */}
      {bestMatches.length > 0 && (
        <div className="space-y-2 border-t border-stone-900 pt-4 text-left">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block font-bold">Best Matches</span>
          <div className="space-y-1.5">
            {bestMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => actions.selectEntry(match.id)}
                className="p-2.5 rounded border border-stone-900 bg-stone-950/40 hover:border-stone-850 cursor-pointer transition-colors flex justify-between items-center"
              >
                <div>
                  <span className="font-mono text-[10px] text-stone-300 font-semibold block uppercase">{match.label}</span>
                  <span className="font-mono text-[8px] text-stone-500 block uppercase">{match.kind}</span>
                </div>
                <span className="font-mono text-[9px] text-stone-600">→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limitations panel details list */}
      {entry.limitations.length > 0 && (
        <div className="space-y-2 border-t border-stone-900 pt-4 text-left">
          <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest block font-bold">Limitations</span>
          <ul className="list-disc pl-3 text-[10.5px] text-stone-400 space-y-1">
            {entry.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
export default LibraryDetailPanel
