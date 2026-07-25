"use client"

import * as React from "react"
import { useRecipeStudio } from "./recipe-provider"
import { cn } from "@/lib/utils"

type ExportTab = "preset" | "plan" | "snapshot" | "usage" | "map"

export interface RecipeExportProps {
  className?: string
}

export function RecipeExport({ className }: RecipeExportProps) {
  const { state } = useRecipeStudio()
  const { activeRecipe, snapshot, cleanView } = state
  const [activeTab, setActiveTab] = React.useState<ExportTab>("usage")
  const [copied, setCopied] = React.useState(false)

  const presetExport = React.useMemo(() => {
    return `export const recipeConfig = ${JSON.stringify(activeRecipe, null, 2)} as const`
  }, [activeRecipe])

  const planExport = React.useMemo(() => {
    return JSON.stringify(activeRecipe.capturePlan, null, 2)
  }, [activeRecipe])

  const snapshotExport = React.useMemo(() => {
    return JSON.stringify(snapshot, null, 2)
  }, [snapshot])

  const mapExport = React.useMemo(() => {
    return JSON.stringify(activeRecipe.systems, null, 2)
  }, [activeRecipe])

  const usageExport = `import { RecipeWorkbench } from "@/components/recipes/recipe-workbench"
import { recipePresets } from "@/lib/recipes/presets"

export function MyComposition() {
  return (
    <RecipeWorkbench
      recipes={recipePresets}
      initialRecipeId="operational-workspace"
      initialViewport="desktop"
    />
  )
}`

  const contents: Record<ExportTab, string> = React.useMemo(() => ({
    preset: presetExport,
    plan: planExport,
    snapshot: snapshotExport,
    usage: usageExport,
    map: mapExport,
  }), [presetExport, planExport, snapshotExport, usageExport, mapExport])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contents[activeTab])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent
    }
  }, [activeTab, contents])

  const tabs: Array<{ key: ExportTab; label: string }> = [
    { key: "usage", label: "Usage Example" },
    { key: "preset", label: "Preset TS" },
    { key: "plan", label: "Plan JSON" },
    { key: "snapshot", label: "Snapshot" },
    { key: "map", label: "System Map" },
  ]

  if (cleanView) return null

  return (
    <div className={cn("rounded-xl border border-stone-850 bg-[#0e0d0c] overflow-hidden text-xs", className)}>
      {/* Tab selectors */}
      <div className="flex items-center justify-between border-b border-stone-850 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => (
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

      {/* Code window */}
      <div className="overflow-x-auto p-4 max-h-[300px]">
        <pre className="font-mono text-[10.5px] leading-relaxed text-stone-300 whitespace-pre select-all">
          {contents[activeTab]}
        </pre>
      </div>
    </div>
  )
}
export default RecipeExport
