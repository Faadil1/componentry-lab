"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"

export function LibrarySearch() {
  const { state, actions } = useComponentLibrary()
  const { query, selectedSourceKinds } = state
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  // Listen to '/' to focus and Escape to clear
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in inputs/textareas
      const activeEl = document.activeElement
      const isEditable =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl && activeEl.getAttribute("contenteditable") === "true")

      if (isEditable) {
        if (e.key === "Escape" && activeEl === inputRef.current) {
          actions.setQuery("")
          inputRef.current?.blur()
        }
        return
      }

      if (e.key === "/") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [actions])

  let placeholderStr = "Search components, resources, or capabilities... (Press '/' to focus)"
  if (selectedSourceKinds.length === 1) {
    if (selectedSourceKinds[0] === "COMPONENT") placeholderStr = "Search components... (Press '/' to focus)"
    if (selectedSourceKinds[0] === "CREATIVE_RESOURCE") placeholderStr = "Search resources... (Press '/' to focus)"
  }

  return (
    <div className="relative max-w-xl w-full">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => actions.setQuery(e.target.value)}
        placeholder={placeholderStr}
        className="w-full rounded-lg border border-stone-850 bg-[#0e0d0c] text-stone-200 px-4 py-3 font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 placeholder-stone-600 transition-colors"
        aria-label="Search component registry"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            actions.setQuery("")
            inputRef.current?.focus()
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-stone-500 uppercase tracking-wider hover:text-stone-300 font-bold"
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  )
}
export default LibrarySearch
