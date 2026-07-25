"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import { getRegistryEntryById } from "@/lib/registry/selectors"
import { cn } from "@/lib/utils"

type ExportTab = "entry-ts" | "entry-json" | "snapshot" | "usage" | "search-res"

export interface LibraryExportProps {
  className?: string
}

export function LibraryExport({ className }: LibraryExportProps) {
  const { state } = useComponentLibrary()
  const { activeEntryId, snapshot, results, detailVisible } = state
  const [activeTab, setActiveTab] = React.useState<ExportTab>("snapshot")
  const [copied, setCopied] = React.useState(false)

  const entry = React.useMemo(() => {
    return activeEntryId ? getRegistryEntryById(activeEntryId) || null : null
  }, [activeEntryId])

  // Sync tab selection depending on detailVisible
  React.useEffect(() => {
    if (detailVisible) {
      setTimeout(() => setActiveTab("usage"), 0)
    } else {
      setTimeout(() => setActiveTab("snapshot"), 0)
    }
  }, [detailVisible])

  const entryTsExport = React.useMemo(() => {
    if (!entry) return "// Select a component card to see its TypeScript configuration."
    return `export const componentConfig = ${JSON.stringify(entry, null, 2)} as const`
  }, [entry])

  const entryJsonExport = React.useMemo(() => {
    if (!entry) return "{}"
    return JSON.stringify(entry, null, 2)
  }, [entry])

  const snapshotExport = React.useMemo(() => {
    return JSON.stringify(snapshot, null, 2)
  }, [snapshot])

  const searchExport = React.useMemo(() => {
    return JSON.stringify(results.map(r => ({ id: r.id, label: r.label, route: r.route })), null, 2)
  }, [results])

  const usageExport = React.useMemo(() => {
    if (!entry) return "// Select a component card to see its usage example."
    if (entry.usageExamples && entry.usageExamples.length > 0) {
      return entry.usageExamples[0].code
    }
    return `// No usage code example documented for: ${entry.id}`
  }, [entry])

  const contents: Record<ExportTab, string> = React.useMemo(() => ({
    "entry-ts": entryTsExport,
    "entry-json": entryJsonExport,
    snapshot: snapshotExport,
    usage: usageExport,
    "search-res": searchExport,
  }), [entryTsExport, entryJsonExport, snapshotExport, usageExport, searchExport])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contents[activeTab])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent
    }
  }, [activeTab, contents])

  const tabs: Array<{ key: ExportTab; label: string; detailOnly: boolean }> = [
    { key: "usage", label: "React Usage", detailOnly: true },
    { key: "entry-ts", label: "Entry TS", detailOnly: true },
    { key: "entry-json", label: "Entry JSON", detailOnly: true },
    { key: "snapshot", label: "Filter Snapshot", detailOnly: false },
    { key: "search-res", label: "Search Results", detailOnly: false },
  ]

  const visibleTabs = tabs.filter((t) => !t.detailOnly || detailVisible)

  return (
    <div className={cn("rounded-xl border border-stone-850 bg-[#0e0d0c] overflow-hidden text-xs text-stone-300", className)}>
      <div className="flex items-center justify-between border-b border-stone-850 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key)
                setCopied(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[9px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
                activeTab === tab.key
                  ? "bg-stone-800 text-stone-200"
                  : "text-stone-500 hover:text-stone-300"
              )}
              aria-pressed={activeTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[9.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
            copied ? "text-emerald-300" : "text-stone-500 hover:text-stone-300"
          )}
          aria-label={`Copy ${activeTab} data`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="overflow-x-auto p-4 max-h-[300px] text-left">
        <pre className="font-mono text-[10.5px] leading-relaxed text-stone-300 whitespace-pre select-all">
          {contents[activeTab]}
        </pre>
      </div>
    </div>
  )
}
export default LibraryExport
