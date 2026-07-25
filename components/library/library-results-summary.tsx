"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"

export function LibraryResultsSummary() {
  const { state } = useComponentLibrary()
  const { resultCount } = state

  return (
    <div
      className="font-mono text-[10px] text-stone-500 uppercase tracking-widest"
      aria-live="polite"
      aria-atomic="true"
    >
      {resultCount} {resultCount === 1 ? "component match" : "components match"} found
    </div>
  )
}
export default LibraryResultsSummary
