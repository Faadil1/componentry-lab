"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"

export function LibraryResultsSummary() {
  const { state } = useComponentLibrary()
  const { resultCount, selectedSourceKinds } = state

  let term = "items"
  if (selectedSourceKinds.length === 1) {
    if (selectedSourceKinds[0] === "COMPONENT") term = "components"
    if (selectedSourceKinds[0] === "CREATIVE_RESOURCE") term = "creative resources"
  } else if (selectedSourceKinds.length === 0) {
    term = "items" // 'all' scope
  }

  const noun = resultCount === 1 ? term.replace(/s$/, "") : term

  return (
    <div
      className="font-mono text-[10px] text-stone-500 uppercase tracking-widest"
      aria-live="polite"
      aria-atomic="true"
    >
      {resultCount} {noun} found
    </div>
  )
}
export default LibraryResultsSummary
