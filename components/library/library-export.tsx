"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
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

  const item = React.useMemo(() => {
    return activeEntryId ? results.find(r => r.projectionId === activeEntryId) || null : null
  }, [activeEntryId, results])

  // Sync tab selection depending on detailVisible
  React.useEffect(() => {
    if (detailVisible) {
      setTimeout(() => setActiveTab("usage"), 0)
    } else {
      setTimeout(() => setActiveTab("snapshot"), 0)
    }
  }, [detailVisible])

  const entryTsExport = React.useMemo(() => {
    if (!item) return "// Select an item card to see its configuration."
    return `export const itemConfig = ${JSON.stringify(item, null, 2)} as const`
  }, [item])

  const entryJsonExport = React.useMemo(() => {
    if (!item) return "{}"
    return JSON.stringify(item, null, 2)
  }, [item])

  const snapshotExport = React.useMemo(() => {
    return JSON.stringify(snapshot, null, 2)
  }, [snapshot])

  const searchExport = React.useMemo(() => {
    return JSON.stringify(results.map(r => ({ id: r.projectionId, title: r.title, sourceKind: r.sourceKind })), null, 2)
  }, [results])

  const usageExport = React.useMemo(() => {
    if (!item) return "// Select an item card to see its usage example."
    if (item.sourceKind === "COMPONENT" && item.componentDetails?.entry.usageExamples && item.componentDetails.entry.usageExamples.length > 0) {
      return item.componentDetails.entry.usageExamples[0].code
    }
    return `// No usage code example documented for: ${item.projectionId}`
  }, [item])

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
    { key: "usage", label: "Usage Example", detailOnly: true },
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
                  ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900"
                  : "bg-transparent hover:bg-stone-800 text-stone-500 border border-transparent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="px-2.5 py-1 rounded border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-[9px] uppercase tracking-wider font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 shrink-0"
        >
          {copied ? "Copied!" : "Copy Output"}
        </button>
      </div>

      <div className="p-4 bg-[#0a0908] max-h-[300px] overflow-auto">
        <pre className="font-mono text-[10px] text-stone-400 whitespace-pre-wrap leading-loose">
          {contents[activeTab]}
        </pre>
      </div>
    </div>
  )
}
export default LibraryExport
