"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import { registryCategories } from "@/lib/registry"
import type {
  RegistryEntryKind,
  RegistryMaturity,
  RegistryCapability,
  RegistryViewport,
  RegistryRuntime,
} from "@/lib/registry/types"
import { cn } from "@/lib/utils"

export interface LibraryFilterBarProps {
  className?: string
}

export function LibraryFilterBar({ className }: LibraryFilterBarProps) {
  const { state, actions } = useComponentLibrary()
  const {
    selectedKinds,
    selectedCategories,
    selectedMaturities,
    selectedCapabilities,
    selectedViewports,
    selectedRuntime,
    counts,
    filtersVisible,
  } = state

  if (!filtersVisible) return null

  const kinds: Array<{ key: RegistryEntryKind; label: string }> = [
    { key: "interaction", label: "Interactions" },
    { key: "foundation", label: "Foundations" },
    { key: "layout", label: "Layouts" },
    { key: "system", label: "Systems" },
    { key: "recipe", label: "Recipes" },
  ]

  const maturities: Array<{ key: RegistryMaturity; label: string }> = [
    { key: "experimental", label: "Experimental" },
    { key: "reusable", label: "Reusable" },
    { key: "production-candidate", label: "Production Candidate" },
  ]

  const capabilities: Array<{ key: RegistryCapability; label: string }> = [
    { key: "deterministic", label: "Deterministic" },
    { key: "capture-ready", label: "Capture Ready" },
    { key: "keyboard-accessible", label: "Keyboard Accessible" },
    { key: "responsive", label: "Responsive" },
    { key: "url-restorable", label: "URL Restorable" },
    { key: "decision-traceable", label: "Decision Traceable" },
    { key: "broadcast", label: "Broadcast" },
    { key: "editorial", label: "Editorial" },
    { key: "operational", label: "Operational" },
    { key: "product", label: "Product" },
    { key: "webgl", label: "WebGL Shader" },
  ]

  const viewports: Array<{ key: RegistryViewport; label: string }> = [
    { key: "desktop", label: "Desktop" },
    { key: "tablet", label: "Tablet" },
    { key: "mobile", label: "Mobile" },
    { key: "broadcast", label: "Broadcast" },
    { key: "portrait-video", label: "Portrait Video" },
  ]

  const runtimes: Array<{ key: RegistryRuntime | "all"; label: string }> = [
    { key: "all", label: "All Runtimes" },
    { key: "react", label: "React" },
    { key: "css", label: "CSS" },
    { key: "svg", label: "SVG" },
    { key: "webgl", label: "WebGL" },
    { key: "browser-api", label: "Browser API" },
    { key: "server-compatible", label: "Server Safe" },
  ]

  const categories = Object.values(registryCategories)

  return (
    <aside className={cn("space-y-6 rounded-xl border border-stone-850 bg-[#0c0b0a] p-5 shrink-0 select-none text-xs", className)}>
      <div className="flex justify-between items-center border-b border-stone-900 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Filter Options
        </span>
        <button
          type="button"
          onClick={actions.clearFilters}
          className="font-mono text-[9px] text-cyan-500 uppercase tracking-widest font-bold hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
        >
          Clear All
        </button>
      </div>

      {/* Runtimes Dropdown Select */}
      <div className="space-y-2">
        <label htmlFor="runtime-selector" className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block font-bold">
          Runtime Platform
        </label>
        <select
          id="runtime-selector"
          value={selectedRuntime}
          onChange={(e) => actions.setRuntime(e.target.value as RegistryRuntime | "all")}
          className="w-full bg-stone-900 border border-stone-850 rounded px-2.5 py-1.5 font-mono text-[10px] text-stone-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 cursor-pointer"
        >
          {runtimes.map((rt) => (
            <option key={rt.key} value={rt.key}>
              {rt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Kinds Checklist */}
      <div className="space-y-2">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block font-bold">
          Entry Kinds
        </span>
        <div className="space-y-1.5">
          {kinds.map((k) => {
            const checked = selectedKinds.includes(k.key)
            const count = counts.kinds[k.key] || 0
            return (
              <label key={k.key} className="flex items-center justify-between gap-2 cursor-pointer font-mono text-[10px] text-stone-400 hover:text-stone-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => actions.toggleKind(k.key)}
                    className="accent-cyan-500"
                  />
                  <span>{k.label}</span>
                </div>
                <span className="text-stone-600 text-[9px] font-semibold">{count}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Maturities Checklist */}
      <div className="space-y-2 border-t border-stone-900 pt-3">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block font-bold">
          Maturity Levels
        </span>
        <div className="space-y-1.5">
          {maturities.map((m) => {
            const checked = selectedMaturities.includes(m.key)
            const count = counts.maturities[m.key] || 0
            return (
              <label key={m.key} className="flex items-center justify-between gap-2 cursor-pointer font-mono text-[10px] text-stone-400 hover:text-stone-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => actions.toggleMaturity(m.key)}
                    className="accent-cyan-500"
                  />
                  <span>{m.label}</span>
                </div>
                <span className="text-stone-600 text-[9px] font-semibold">{count}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Categories Checklist */}
      <div className="space-y-2 border-t border-stone-900 pt-3">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block font-bold">
          Categories Taxonomy
        </span>
        <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
          {categories.map((c) => {
            const checked = selectedCategories.includes(c.id)
            const count = counts.categories[c.id] || 0
            return (
              <label key={c.id} className="flex items-center justify-between gap-2 cursor-pointer font-mono text-[10px] text-stone-400 hover:text-stone-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => actions.toggleCategory(c.id)}
                    className="accent-cyan-500"
                  />
                  <span className="truncate max-w-[120px]">{c.label}</span>
                </div>
                <span className="text-stone-600 text-[9px] font-semibold">{count}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Capabilities Checklist */}
      <div className="space-y-2 border-t border-stone-900 pt-3">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block font-bold">
          System Capabilities
        </span>
        <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
          {capabilities.map((cap) => {
            const checked = selectedCapabilities.includes(cap.key)
            const count = counts.capabilities[cap.key] || 0
            return (
              <label key={cap.key} className="flex items-center justify-between gap-2 cursor-pointer font-mono text-[10px] text-stone-400 hover:text-stone-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => actions.toggleCapability(cap.key)}
                    className="accent-cyan-500"
                  />
                  <span className="truncate max-w-[120px]">{cap.label}</span>
                </div>
                <span className="text-stone-600 text-[9px] font-semibold">{count}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Viewports Checklist */}
      <div className="space-y-2 border-t border-stone-900 pt-3">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block font-bold">
          Viewports Layouts
        </span>
        <div className="space-y-1.5">
          {viewports.map((vp) => {
            const checked = selectedViewports.includes(vp.key)
            const count = counts.viewports[vp.key] || 0
            return (
              <label key={vp.key} className="flex items-center justify-between gap-2 cursor-pointer font-mono text-[10px] text-stone-400 hover:text-stone-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => actions.toggleViewport(vp.key)}
                    className="accent-cyan-500"
                  />
                  <span>{vp.label}</span>
                </div>
                <span className="text-stone-600 text-[9px] font-semibold">{count}</span>
              </label>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
export default LibraryFilterBar
