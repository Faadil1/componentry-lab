"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import { LibraryCard } from "./library-card"
import { cn } from "@/lib/utils"

export interface LibraryGridProps {
  className?: string
}

export function LibraryGrid({ className }: LibraryGridProps) {
  const { state } = useComponentLibrary()
  const { results, viewMode } = state

  if (viewMode !== "grid") return null

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {results.map((entry) => (
        <LibraryCard key={entry.projectionId} entry={entry} />
      ))}
    </div>
  )
}
export default LibraryGrid
