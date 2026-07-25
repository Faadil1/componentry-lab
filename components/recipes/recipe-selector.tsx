"use client"

import * as React from "react"
import { useRecipeStudio } from "./recipe-provider"
import { recipePresets } from "@/lib/recipes/presets"
import { cn } from "@/lib/utils"

export interface RecipeSelectorProps {
  className?: string
}

export function RecipeSelector({ className }: RecipeSelectorProps) {
  const { state, actions } = useRecipeStudio()
  const { activeRecipeId, cleanView } = state

  if (cleanView) return null

  const items = Object.values(recipePresets)

  return (
    <div className={cn("grid gap-3 sm:grid-cols-4", className)}>
      {items.map((recipe) => {
        const isSelected = activeRecipeId === recipe.id
        return (
          <button
            key={recipe.id}
            type="button"
            onClick={() => actions.setRecipe(recipe.id)}
            className={cn(
              "flex flex-col text-left p-3.5 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
              isSelected
                ? "border-cyan-500/40 bg-stone-900 text-stone-100 shadow-sm"
                : "border-stone-850 bg-[#0e0d0c] text-stone-400 hover:border-stone-850 hover:text-stone-300"
            )}
            aria-pressed={isSelected}
          >
            <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500">
              {recipe.category}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider font-mono mt-1">
              {recipe.label}
            </span>
            <span className="text-[10px] text-stone-500 leading-normal mt-1 block truncate w-full">
              {recipe.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
export default RecipeSelector
