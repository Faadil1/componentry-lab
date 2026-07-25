"use client"

import * as React from "react"
import { useRecipeStudio } from "./recipe-provider"
import { cn } from "@/lib/utils"

export interface RecipeSystemMapProps {
  className?: string
}

export function RecipeSystemMap({ className }: RecipeSystemMapProps) {
  const { state } = useRecipeStudio()
  const { activeRecipe, systemMapVisible, cleanView } = state

  if (cleanView || !systemMapVisible) return null

  return (
    <div className={cn("rounded-lg border border-stone-850 bg-[#0c0b0a] p-4 space-y-4", className)}>
      <div className="border-b border-stone-900 pb-2 flex justify-between items-center">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Composition System Map
        </span>
        <span className="font-mono text-[9px] text-stone-600">
          Component dependencies hierarchy
        </span>
      </div>

      {/* Dependency Nodes Tree */}
      <div className="space-y-3">
        {activeRecipe.systems.map((sys, idx) => {
          return (
            <div key={sys.systemId} className="relative">
              {/* Vertical connector line */}
              {idx < activeRecipe.systems.length - 1 && (
                <div className="absolute left-[13px] top-6 bottom-0 w-px bg-stone-850" />
              )}

              <div className="flex gap-3 items-start">
                {/* Bullet Node */}
                <div className="w-7 h-7 rounded-full border border-stone-800 bg-[#0e0d0c] flex items-center justify-center shrink-0 z-10 font-mono text-[9px] text-cyan-400 font-bold">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-300 font-mono">
                      {sys.label}
                    </span>
                    {sys.optional ? (
                      <span className="font-mono text-[7px] text-stone-600 border border-stone-900 px-1 py-0.2 rounded uppercase">
                        Optional
                      </span>
                    ) : (
                      <span className="font-mono text-[7px] text-cyan-500 border border-cyan-900 px-1 py-0.2 rounded uppercase">
                        Required
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-500 leading-normal">
                    {sys.role}
                  </p>

                  {sys.dependencies.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-1 font-mono text-[8px] text-stone-600">
                      <span>Depends:</span>
                      {sys.dependencies.map((dep) => (
                        <span key={dep} className="text-stone-500 font-bold">
                          {dep}
                        </span>
                      ))}
                    </div>
                  )}

                  {sys.limitation && (
                    <p className="text-[10px] text-red-500 italic mt-0.5">
                      Limit: {sys.limitation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default RecipeSystemMap
