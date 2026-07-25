"use client"

import * as React from "react"
import { useRecipeStudio } from "./recipe-provider"
import { ProductLaunchRecipe } from "./product-launch-recipe"
import { OperationalWorkspaceRecipe } from "./operational-workspace-recipe"
import { DataStoryRecipe } from "./data-story-recipe"
import { BroadcastPackageRecipe } from "./broadcast-package-recipe"
import type { RecipeViewport } from "@/lib/recipes/types"
import { cn } from "@/lib/utils"

export interface RecipeStageProps {
  className?: string
}

const safeAreaStyles = {
  off: "",
  interface: "border-[12px] border-dashed border-cyan-500/10",
  presentation: "border-[24px] border-dashed border-purple-500/10",
  broadcast: "border-[36px] border-dashed border-amber-500/10",
  cinematic: "border-[16px] border-dashed border-red-500/10",
}

const viewportRatios: Record<RecipeViewport, string> = {
  desktop: "aspect-video",
  laptop: "aspect-[1.6]",
  tablet: "aspect-[0.75]",
  mobile: "aspect-[0.46]",
  broadcast: "aspect-video",
  portrait: "aspect-[0.56]",
}

export function RecipeStage({ className }: RecipeStageProps) {
  const { state, actions } = useRecipeStudio()
  const { activeRecipeId, activeRecipe, activeCaptureStateId, viewport, cleanView } = state

  const defaultCS = activeRecipe.capturePlan.states.find(s => s.id === activeRecipe.signatureStateId) || activeRecipe.capturePlan.states[0]
  const currentCS = activeRecipe.capturePlan.states.find(s => s.id === activeCaptureStateId) || defaultCS

  const renderActiveRecipeContent = () => {
    switch (activeRecipeId) {
      case "product-launch":
        return <ProductLaunchRecipe />
      case "operational-workspace":
        return <OperationalWorkspaceRecipe />
      case "data-story":
        return <DataStoryRecipe />
      case "broadcast-package":
        return <BroadcastPackageRecipe />
      default:
        return <ProductLaunchRecipe />
    }
  }

  // Handle ESC key to exit clean view
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && cleanView) {
        actions.toggleCleanView()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [cleanView, actions])

  return (
    <div className={cn("relative w-full flex flex-col items-center justify-center", className)}>
      <div className={cn(
        "relative w-full overflow-hidden rounded-xl border border-stone-850 bg-[#070707] shadow-xl transition-all duration-300",
        viewportRatios[viewport] || "aspect-video"
      )}>
        {/* Title safe markers overlay */}
        {currentCS.safeArea !== "off" && (
          <div className={cn("absolute inset-0 pointer-events-none z-20 rounded-xl", safeAreaStyles[currentCS.safeArea])} />
        )}

        {/* Signature state label */}
        {currentCS.isSignatureFrame && (
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-mono text-[8px] text-cyan-300 uppercase tracking-widest">Signature Frame</span>
          </div>
        )}

        {/* Clean View notice */}
        {cleanView && (
          <div className="absolute bottom-3 left-3 z-30 font-mono text-[9px] text-stone-600 bg-black/40 px-2 py-0.5 rounded">
            Clean View (Press ESC to return)
          </div>
        )}

        {/* Active Content Container */}
        <div className="w-full h-full relative z-10">
          {renderActiveRecipeContent()}
        </div>
      </div>
    </div>
  )
}
export default RecipeStage
