"use client"

// ─────────────────────────────────────────────────────────────
// Registry V2 — Client Library Provider
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import type {
  RegistryContext,
  RegistryEntryId,
  RegistryEntryKind,
  RegistryCategoryId,
  RegistryMaturity,
  RegistryCapability,
  RegistryViewport,
  RegistryRuntime,
  RegistryEntry,
  RegistryFilterState,
} from "@/lib/registry/types"
import {
  registryComponents,
  filterRegistryEntries,
  searchRegistryEntries,
  countRegistryFacets,
  getRegistryEntryById,
} from "@/lib/registry"

const LibraryContext = React.createContext<RegistryContext | null>(null)

export function useComponentLibrary(): RegistryContext {
  const ctx = React.useContext(LibraryContext)
  if (!ctx) {
    throw new Error(
      "useComponentLibrary must be used within a <LibraryProvider>. " +
      "Wrap your page component tree in <LibraryProvider> or <LibraryWorkbench>."
    )
  }
  return ctx
}

export interface LibraryProviderProps {
  initialQuery?: string
  initialViewMode?: "grid" | "list"
  children: React.ReactNode
  onEntrySelect?: (entry: RegistryEntry | null) => void
}

export function LibraryProvider({
  initialQuery = "",
  initialViewMode = "grid",
  children,
  onEntrySelect,
}: LibraryProviderProps) {
  const [query, setQuery] = React.useState(initialQuery)
  const [selectedKinds, setSelectedKinds] = React.useState<RegistryEntryKind[]>([])
  const [selectedCategories, setSelectedCategories] = React.useState<RegistryCategoryId[]>([])
  const [selectedMaturities, setSelectedMaturities] = React.useState<RegistryMaturity[]>([])
  const [selectedCapabilities, setSelectedCapabilities] = React.useState<RegistryCapability[]>([])
  const [selectedViewports, setSelectedViewports] = React.useState<RegistryViewport[]>([])
  const [selectedRuntime, setSelectedRuntime] = React.useState<RegistryRuntime | "all">("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">(initialViewMode)
  const [activeEntryId, setActiveEntryId] = React.useState<RegistryEntryId | null>(null)
  const [filtersVisible, setFiltersVisible] = React.useState(true)
  const [detailVisible, setDetailVisible] = React.useState(false)

  // Notify parent ref
  const onEntrySelectRef = React.useRef(onEntrySelect)
  React.useEffect(() => {
    onEntrySelectRef.current = onEntrySelect
  }, [onEntrySelect])

  // Sync state parameters from URL search params on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const qParam = params.get("q")
      const kindParam = params.get("kind")
      const catParam = params.get("category")
      const matParam = params.get("maturity")
      const capParam = params.get("capability")
      const vpParam = params.get("viewport")
      const rtParam = params.get("runtime")
      const viewParam = params.get("view")
      const itemParam = params.get("item") as RegistryEntryId

      setTimeout(() => {
        if (qParam) setQuery(qParam)
        if (kindParam) setSelectedKinds(kindParam.split(",") as RegistryEntryKind[])
        if (catParam) setSelectedCategories(catParam.split(",") as RegistryCategoryId[])
        if (matParam) setSelectedMaturities(matParam.split(",") as RegistryMaturity[])
        if (capParam) setSelectedCapabilities(capParam.split(",") as RegistryCapability[])
        if (vpParam) setSelectedViewports(vpParam.split(",") as RegistryViewport[])
        if (rtParam) setSelectedRuntime(rtParam as RegistryRuntime | "all")
        if (viewParam === "list" || viewParam === "grid") setViewMode(viewParam)
        if (itemParam && registryComponents.some(e => e.id === itemParam)) {
          setActiveEntryId(itemParam)
          setDetailVisible(true)
        }
      }, 0)
    }
  }, [])

  // Filter and Search evaluations
  const results = React.useMemo(() => {
    const filterState: Partial<RegistryFilterState> = {
      selectedKinds,
      selectedCategories,
      selectedMaturities,
      selectedCapabilities,
      selectedViewports,
      selectedRuntime,
    }
    const filtered = filterRegistryEntries(filterState, registryComponents)
    const searched = searchRegistryEntries(query, filtered)
    return searched.map(s => s.entry)
  }, [query, selectedKinds, selectedCategories, selectedMaturities, selectedCapabilities, selectedViewports, selectedRuntime])

  const counts = React.useMemo(() => {
    return countRegistryFacets(results)
  }, [results])

  const activeEntry = React.useMemo(() => {
    return activeEntryId ? getRegistryEntryById(activeEntryId) || null : null
  }, [activeEntryId])

  // Fire callback on active entry change
  React.useEffect(() => {
    onEntrySelectRef.current?.(activeEntry)
  }, [activeEntry])

  const snapshot = React.useMemo(() => {
    return {
      query,
      selectedKinds,
      selectedCategories,
      selectedMaturities,
      selectedCapabilities,
      selectedViewports,
      selectedRuntime,
      viewMode,
      activeEntryId,
    }
  }, [query, selectedKinds, selectedCategories, selectedMaturities, selectedCapabilities, selectedViewports, selectedRuntime, viewMode, activeEntryId])

  // Update URL search parameters when snapshot updates
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams()
      if (snapshot.query) q.set("q", snapshot.query)
      if (snapshot.selectedKinds.length > 0) q.set("kind", snapshot.selectedKinds.join(","))
      if (snapshot.selectedCategories.length > 0) q.set("category", snapshot.selectedCategories.join(","))
      if (snapshot.selectedMaturities.length > 0) q.set("maturity", snapshot.selectedMaturities.join(","))
      if (snapshot.selectedCapabilities.length > 0) q.set("capability", snapshot.selectedCapabilities.join(","))
      if (snapshot.selectedViewports.length > 0) q.set("viewport", snapshot.selectedViewports.join(","))
      if (snapshot.selectedRuntime !== "all") q.set("runtime", snapshot.selectedRuntime)
      q.set("view", snapshot.viewMode)
      if (snapshot.activeEntryId) q.set("item", snapshot.activeEntryId)

      const queryStr = q.toString()
      const newUrl = `${window.location.pathname}${queryStr ? `?${queryStr}` : ""}`
      window.history.replaceState({ ...window.history.state }, "", newUrl)
    }
  }, [snapshot])

  const actions = React.useMemo(() => ({
    setQuery: (q: string) => setQuery(q),
    toggleKind: (kind: RegistryEntryKind) => {
      setSelectedKinds(prev =>
        prev.includes(kind) ? prev.filter(k => k !== kind) : [...prev, kind]
      )
    },
    toggleCategory: (cat: RegistryCategoryId) => {
      setSelectedCategories(prev =>
        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      )
    },
    toggleMaturity: (mat: RegistryMaturity) => {
      setSelectedMaturities(prev =>
        prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
      )
    },
    toggleCapability: (cap: RegistryCapability) => {
      setSelectedCapabilities(prev =>
        prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
      )
    },
    toggleViewport: (vp: RegistryViewport) => {
      setSelectedViewports(prev =>
        prev.includes(vp) ? prev.filter(v => v !== vp) : [...prev, vp]
      )
    },
    setRuntime: (runtime: RegistryRuntime | "all") => setSelectedRuntime(runtime),
    setViewMode: (mode: "grid" | "list") => setViewMode(mode),
    selectEntry: (id: RegistryEntryId | null) => {
      setActiveEntryId(id)
      setDetailVisible(!!id)
    },
    closeDetail: () => {
      setActiveEntryId(null)
      setDetailVisible(false)
    },
    clearFilters: () => {
      setSelectedKinds([])
      setSelectedCategories([])
      setSelectedMaturities([])
      setSelectedCapabilities([])
      setSelectedViewports([])
      setSelectedRuntime("all")
      setQuery("")
    },
    resetLibrary: () => {
      setSelectedKinds([])
      setSelectedCategories([])
      setSelectedMaturities([])
      setSelectedCapabilities([])
      setSelectedViewports([])
      setSelectedRuntime("all")
      setQuery("")
      setActiveEntryId(null)
      setDetailVisible(false)
      setViewMode("grid")
    },
    copySnapshot: async () => {
      await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2))
    },
    copyEntry: async (id: RegistryEntryId) => {
      const target = getRegistryEntryById(id)
      if (target) {
        await navigator.clipboard.writeText(JSON.stringify(target, null, 2))
      }
    },
    copyUsageExample: async (id: RegistryEntryId) => {
      const target = getRegistryEntryById(id)
      if (target && target.usageExamples && target.usageExamples.length > 0) {
        await navigator.clipboard.writeText(target.usageExamples[0].code)
      }
    },
    toggleFiltersVisible: () => setFiltersVisible(v => !v),
  }), [snapshot])

  const contextValue = React.useMemo<RegistryContext>(() => {
    return {
      state: {
        query,
        selectedKinds,
        selectedCategories,
        selectedMaturities,
        selectedCapabilities,
        selectedViewports,
        selectedRuntime,
        viewMode,
        activeEntryId,
        results,
        counts,
        resultCount: results.length,
        filtersVisible,
        detailVisible,
        snapshot,
      },
      actions,
    }
  }, [
    query,
    selectedKinds,
    selectedCategories,
    selectedMaturities,
    selectedCapabilities,
    selectedViewports,
    selectedRuntime,
    viewMode,
    activeEntryId,
    results,
    counts,
    filtersVisible,
    detailVisible,
    snapshot,
    actions,
  ])

  return (
    <LibraryContext.Provider value={contextValue}>
      {children}
    </LibraryContext.Provider>
  )
}
export default LibraryProvider
