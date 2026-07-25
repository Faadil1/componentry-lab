"use client"

// ─────────────────────────────────────────────────────────────
// Composition Recipes — Workbench Coordinator
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import { RecipeProvider } from "./recipe-provider"
import { RecipeStage } from "./recipe-stage"
import { RecipeSelector } from "./recipe-selector"
import { RecipeSystemMap } from "./recipe-system-map"
import { RecipeInspector } from "./recipe-inspector"
import { RecipeCapturePlan } from "./recipe-capture-plan"
import { RecipeExport } from "./recipe-export"
import type { RecipeId, RecipeViewport, RecipePreset } from "@/lib/recipes/types"
import { cn } from "@/lib/utils"

export interface RecipeWorkbenchProps {
  recipes?: unknown
  initialRecipeId?: RecipeId
  initialViewport?: RecipeViewport
  showInspector?: boolean
  showSystemMap?: boolean
  showCapturePlan?: boolean
  className?: string
  onRecipeChange?: (recipe: RecipePreset) => void
}

function WorkbenchContent({
  showInspector,
  showSystemMap,
  showCapturePlan,
}: {
  showInspector: boolean
  showSystemMap: boolean
  showCapturePlan: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Recipe switcher row */}
      <RecipeSelector />

      {/* Main specimen stage */}
      <RecipeStage className="w-full" />

      {/* Capture plan checklist triggers */}
      {showCapturePlan && <RecipeCapturePlan />}

      {/* Map, Inspector and Exporter */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          {showSystemMap && <RecipeSystemMap />}
          <RecipeExport />
        </div>
        {showInspector && <RecipeInspector />}
      </div>
    </div>
  )
}

export function RecipeWorkbench({
  initialRecipeId = "product-launch",
  initialViewport = "desktop",
  showInspector = true,
  showSystemMap = true,
  showCapturePlan = true,
  className,
  onRecipeChange,
}: RecipeWorkbenchProps) {
  return (
    <RecipeProvider
      initialRecipeId={initialRecipeId}
      initialViewport={initialViewport}
      onRecipeChange={onRecipeChange}
    >
      <div className={cn("space-y-6", className)}>
        <WorkbenchContent
          showInspector={showInspector}
          showSystemMap={showSystemMap}
          showCapturePlan={showCapturePlan}
        />
      </div>
    </RecipeProvider>
  )
}
export default RecipeWorkbench
