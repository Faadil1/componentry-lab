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
    selectedSourceKinds,
    selectedResourceTypes,
    selectedLifecycles,
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


  const resourceTypes = [
    { key: "CORE_METHOD", label: "Core Method" },
    { key: "KNOWLEDGE_PACK", label: "Knowledge Pack" },
    { key: "SKILL", label: "Skill" },
    { key: "PROVIDER", label: "Provider" },
    { key: "COMPONENT_SOURCE", label: "Component Source" },
    { key: "PRODUCTION_PIPELINE", label: "Production Pipeline" },
    { key: "DISCOVERY_FEED", label: "Discovery Feed" },
    { key: "REFERENCE_ONLY", label: "Reference Only" },
  ]

  const lifecycles = [
    { key: "CAPTURED", label: "Captured" },
    { key: "AUDITED", label: "Audited" },
    { key: "TEST_CANDIDATE", label: "Test Candidate" },
    { key: "TESTING", label: "Testing" },
    { key: "VALIDATED", label: "Validated" },
    { key: "APPROVED", label: "Approved" },
    { key: "DEPRECATED", label: "Deprecated" },
    { key: "SUPERSEDED", label: "Superseded" },
    { key: "REJECTED", label: "Rejected" },
  ]

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

  const showComponentFilters = selectedSourceKinds.length === 0 || selectedSourceKinds.includes("COMPONENT")
  const showResourceFilters = selectedSourceKinds.length === 0 || selectedSourceKinds.includes("CREATIVE_RESOURCE")
  const isAll = selectedSourceKinds.length === 0
  const isComponentsOnly = selectedSourceKinds.length === 1 && selectedSourceKinds[0] === "COMPONENT"
  const isResourcesOnly = selectedSourceKinds.length === 1 && selectedSourceKinds[0] === "CREATIVE_RESOURCE"

  return (
    <aside className={cn("w-64 shrink-0 space-y-6 rounded-xl border border-stone-850 bg-[#0c0b0a] p-5 select-none text-xs", className)}>
      
      {/* Source Kind Switcher (Primary Orientation) */}
      <div className="space-y-2">
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block font-bold">
          Library Scope
        </span>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => actions.setExactSourceKinds([])}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded border text-left transition-colors font-mono text-[10px] uppercase font-bold",
              isAll
                ? "border-cyan-500/40 bg-cyan-950/20 text-cyan-400"
                : "border-stone-850 bg-[#0e0d0c] text-stone-500 hover:border-stone-800 hover:text-stone-300"
            )}
          >
            <span>All Sources</span>
            <span className="text-stone-600 text-[9px]">{counts.total}</span>
          </button>
          
          <button
            onClick={() => actions.setExactSourceKinds(["COMPONENT"])}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded border text-left transition-colors font-mono text-[10px] uppercase font-bold",
              isComponentsOnly
                ? "border-cyan-500/40 bg-cyan-950/20 text-cyan-400"
                : "border-stone-850 bg-[#0e0d0c] text-stone-500 hover:border-stone-800 hover:text-stone-300"
            )}
          >
            <span>Components</span>
            <span className="text-stone-600 text-[9px]">{counts.components}</span>
          </button>

          <button
            onClick={() => actions.setExactSourceKinds(["CREATIVE_RESOURCE"])}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded border text-left transition-colors font-mono text-[10px] uppercase font-bold",
              isResourcesOnly
                ? "border-cyan-500/40 bg-cyan-950/20 text-cyan-400"
                : "border-stone-850 bg-[#0e0d0c] text-stone-500 hover:border-stone-800 hover:text-stone-300"
            )}
          >
            <span>Creative Resources</span>
            <span className="text-stone-600 text-[9px]">{counts.resources}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-stone-900 pt-6">
        <span className="font-mono text-[11px] font-bold text-stone-300 uppercase tracking-wider">
          Filters
        </span>
        <button
          onClick={actions.clearFilters}
          className="font-mono text-[9px] text-stone-500 hover:text-stone-300 uppercase font-bold"
        >
          Clear
        </button>
      </div>

      {showComponentFilters && (
        <>
          {/* Runtimes Dropdown Select */}
          <div className="space-y-2 border-t border-stone-900 pt-3">
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
          <div className="space-y-2 border-t border-stone-900 pt-3">
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
        </>
      )}

      {showResourceFilters && (
        <>
          {/* Resource Types Checklist */}
          <div className="space-y-2 border-t border-stone-900 pt-3">
            <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block font-bold">
              Resource Types
            </span>
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
              {resourceTypes.map((k) => {
                const checked = selectedResourceTypes.includes(k.key)
                return (
                  <label key={k.key} className="flex items-center justify-between gap-2 cursor-pointer font-mono text-[10px] text-stone-400 hover:text-stone-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => actions.toggleResourceType(k.key)}
                        className="accent-cyan-500"
                      />
                      <span>{k.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Lifecycles Checklist */}
          <div className="space-y-2 border-t border-stone-900 pt-3">
            <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider block font-bold">
              Lifecycles
            </span>
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
              {lifecycles.map((m) => {
                const checked = selectedLifecycles.includes(m.key)
                return (
                  <label key={m.key} className="flex items-center justify-between gap-2 cursor-pointer font-mono text-[10px] text-stone-400 hover:text-stone-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => actions.toggleLifecycle(m.key)}
                        className="accent-cyan-500"
                      />
                      <span>{m.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Categories Checklist (Shared conceptually but categories mostly map to components) */}
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
      {showComponentFilters && (
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
      )}
    </aside>
  )
}
export default LibraryFilterBar
