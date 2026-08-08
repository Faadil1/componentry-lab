"use client"

// ─────────────────────────────────────────────────────────────
// Registry V2 — Client Library Provider
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import type {
  RegistryContext,
  RegistryEntryKind,
  RegistryCategoryId,
  RegistryMaturity,
  RegistryCapability,
  RegistryViewport,
  RegistryRuntime,
} from "@/lib/registry/types"
import type { LibraryProjectionItem } from "@/lib/library/types"
import { getLibraryProjection } from "@/lib/library/types"

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
  onEntrySelect?: (entry: LibraryProjectionItem | null) => void
}

export function LibraryProvider({
  initialQuery = "",
  initialViewMode = "grid",
  children,
  onEntrySelect,
}: LibraryProviderProps) {
  const [query, setQuery] = React.useState(initialQuery)
  const [selectedSourceKinds, setSelectedSourceKinds] = React.useState<string[]>([])
  const [selectedResourceTypes, setSelectedResourceTypes] = React.useState<string[]>([])
  const [selectedLifecycles, setSelectedLifecycles] = React.useState<string[]>([])
  const [selectedKinds, setSelectedKinds] = React.useState<RegistryEntryKind[]>([])
  const [selectedCategories, setSelectedCategories] = React.useState<RegistryCategoryId[]>([])
  const [selectedMaturities, setSelectedMaturities] = React.useState<RegistryMaturity[]>([])
  const [selectedCapabilities, setSelectedCapabilities] = React.useState<RegistryCapability[]>([])
  const [selectedViewports, setSelectedViewports] = React.useState<RegistryViewport[]>([])
  const [selectedRuntime, setSelectedRuntime] = React.useState<RegistryRuntime | "all">("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">(initialViewMode)
  const [activeEntryId, setActiveEntryId] = React.useState<string | null>(null)
  const [filtersVisible, setFiltersVisible] = React.useState(true)
  const [detailVisible, setDetailVisible] = React.useState(false)

  // Notify parent ref
  const onEntrySelectRef = React.useRef(onEntrySelect)
  React.useEffect(() => {
    onEntrySelectRef.current = onEntrySelect
  }, [onEntrySelect])

  const allItems = React.useMemo(() => getLibraryProjection(), [])

  // Sync state parameters from URL search params on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const qParam = params.get("q")
      const skParam = params.get("sourceKind")
      const rtParam = params.get("resourceType")
      const lcParam = params.get("lifecycle")
      const kindParam = params.get("kind")
      const catParam = params.get("category")
      const matParam = params.get("maturity")
      const capParam = params.get("capability")
      const vpParam = params.get("viewport")
      const runParam = params.get("runtime")
      const viewParam = params.get("view")
      const itemParam = params.get("item")

      setTimeout(() => {
        if (qParam) setQuery(qParam)
        if (skParam) setSelectedSourceKinds(skParam.split(","))
        if (rtParam) setSelectedResourceTypes(rtParam.split(","))
        if (lcParam) setSelectedLifecycles(lcParam.split(","))
        if (kindParam) setSelectedKinds(kindParam.split(",") as RegistryEntryKind[])
        if (catParam) setSelectedCategories(catParam.split(",") as RegistryCategoryId[])
        if (matParam) setSelectedMaturities(matParam.split(",") as RegistryMaturity[])
        if (capParam) setSelectedCapabilities(capParam.split(",") as RegistryCapability[])
        if (vpParam) setSelectedViewports(vpParam.split(",") as RegistryViewport[])
        if (runParam) setSelectedRuntime(runParam as RegistryRuntime | "all")
        if (viewParam === "list" || viewParam === "grid") setViewMode(viewParam)
        if (itemParam && allItems.some(e => e.projectionId === itemParam)) {
          setActiveEntryId(itemParam)
          setDetailVisible(true)
        }
      }, 0)
    }
  }, [allItems])

  // Filter and Search evaluations
  const results = React.useMemo(() => {
    let filtered = allItems

    if (selectedSourceKinds.length > 0) {
      filtered = filtered.filter(item => selectedSourceKinds.includes(item.sourceKind))
    }
    if (selectedResourceTypes.length > 0) {
      filtered = filtered.filter(item => item.resourceDetails && selectedResourceTypes.includes(item.resourceDetails.resourceType))
    }
    if (selectedLifecycles.length > 0) {
      filtered = filtered.filter(item => selectedLifecycles.includes(item.status.value))
    }
    if (selectedKinds.length > 0) {
      filtered = filtered.filter(item => item.componentDetails && selectedKinds.includes(item.componentDetails.kind))
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => item.category && selectedCategories.includes(item.category as RegistryCategoryId))
    }
    if (selectedMaturities.length > 0) {
      filtered = filtered.filter(item => item.componentDetails && selectedMaturities.includes(item.componentDetails.maturity))
    }
    if (selectedCapabilities.length > 0) {
      filtered = filtered.filter(item => selectedCapabilities.some(c => item.capabilityRefs.includes(c)))
    }
    if (selectedViewports.length > 0) {
      filtered = filtered.filter(item => item.componentDetails && selectedViewports.some(vp => item.componentDetails!.viewports.includes(vp)))
    }
    if (selectedRuntime !== "all") {
      filtered = filtered.filter(item => item.componentDetails && item.componentDetails.runtimes.includes(selectedRuntime))
    }

    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(item => item.searchText.includes(lowerQuery))
    }

    return filtered
  }, [allItems, query, selectedSourceKinds, selectedResourceTypes, selectedLifecycles, selectedKinds, selectedCategories, selectedMaturities, selectedCapabilities, selectedViewports, selectedRuntime])

  const counts = React.useMemo(() => {
    const counts = {
      total: results.length,
      components: 0,
      resources: 0,
      kinds: {} as Record<RegistryEntryKind, number>,
      categories: {} as Record<RegistryCategoryId, number>,
      maturities: {} as Record<RegistryMaturity, number>,
      capabilities: {} as Record<RegistryCapability, number>,
      viewports: {} as Record<RegistryViewport, number>,
    }

    for (const item of results) {
      if (item.sourceKind === "COMPONENT") counts.components++
      if (item.sourceKind === "CREATIVE_RESOURCE") counts.resources++

      if (item.componentDetails) {
        counts.kinds[item.componentDetails.kind] = (counts.kinds[item.componentDetails.kind] || 0) + 1
        counts.maturities[item.componentDetails.maturity] = (counts.maturities[item.componentDetails.maturity] || 0) + 1
        for (const vp of item.componentDetails.viewports) {
          counts.viewports[vp] = (counts.viewports[vp] || 0) + 1
        }
      }
      if (item.category) {
        counts.categories[item.category as RegistryCategoryId] = (counts.categories[item.category as RegistryCategoryId] || 0) + 1
      }
      for (const cap of item.capabilityRefs) {
        counts.capabilities[cap as RegistryCapability] = (counts.capabilities[cap as RegistryCapability] || 0) + 1
      }
    }
    return counts
  }, [results])

  const activeEntry = React.useMemo(() => {
    return activeEntryId ? allItems.find(e => e.projectionId === activeEntryId) || null : null
  }, [activeEntryId, allItems])

  // Fire callback on active entry change
  React.useEffect(() => {
    onEntrySelectRef.current?.(activeEntry)
  }, [activeEntry])

  const snapshot = React.useMemo(() => {
    return {
      query,
      selectedSourceKinds,
      selectedResourceTypes,
      selectedLifecycles,
      selectedKinds,
      selectedCategories,
      selectedMaturities,
      selectedCapabilities,
      selectedViewports,
      selectedRuntime,
      viewMode,
      activeEntryId,
    }
  }, [query, selectedSourceKinds, selectedResourceTypes, selectedLifecycles, selectedKinds, selectedCategories, selectedMaturities, selectedCapabilities, selectedViewports, selectedRuntime, viewMode, activeEntryId])

  // Update URL search parameters when snapshot updates
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams()
      if (snapshot.query) q.set("q", snapshot.query)
      if (snapshot.selectedSourceKinds.length > 0) q.set("sourceKind", snapshot.selectedSourceKinds.join(","))
      if (snapshot.selectedResourceTypes.length > 0) q.set("resourceType", snapshot.selectedResourceTypes.join(","))
      if (snapshot.selectedLifecycles.length > 0) q.set("lifecycle", snapshot.selectedLifecycles.join(","))
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
    toggleSourceKind: (kind: string) => {
      setSelectedSourceKinds(prev => prev.includes(kind) ? prev.filter(k => k !== kind) : [...prev, kind])
    },
    toggleResourceType: (type: string) => {
      setSelectedResourceTypes(prev => prev.includes(type) ? prev.filter(k => k !== type) : [...prev, type])
    },
    toggleLifecycle: (lc: string) => {
      setSelectedLifecycles(prev => prev.includes(lc) ? prev.filter(k => k !== lc) : [...prev, lc])
    },
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
    selectEntry: (id: string | null) => {
      setActiveEntryId(id)
      setDetailVisible(!!id)
    },
    closeDetail: () => {
      setActiveEntryId(null)
      setDetailVisible(false)
    },
    clearFilters: () => {
      setSelectedSourceKinds([])
      setSelectedResourceTypes([])
      setSelectedLifecycles([])
      setSelectedKinds([])
      setSelectedCategories([])
      setSelectedMaturities([])
      setSelectedCapabilities([])
      setSelectedViewports([])
      setSelectedRuntime("all")
      setQuery("")
    },
    resetLibrary: () => {
      setSelectedSourceKinds([])
      setSelectedResourceTypes([])
      setSelectedLifecycles([])
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
    copyEntry: async (id: string) => {
      const target = allItems.find(e => e.projectionId === id)
      if (target) {
        await navigator.clipboard.writeText(JSON.stringify(target, null, 2))
      }
    },
    copyUsageExample: async (id: string) => {
      const target = allItems.find(e => e.projectionId === id)
      if (target?.componentDetails?.entry.usageExamples && target.componentDetails.entry.usageExamples.length > 0) {
        await navigator.clipboard.writeText(target.componentDetails.entry.usageExamples[0].code)
      }
    },
    toggleFiltersVisible: () => setFiltersVisible(v => !v),
  }), [snapshot, allItems])

  const contextValue = React.useMemo<RegistryContext>(() => {
    return {
      state: {
        query,
        selectedSourceKinds,
        selectedResourceTypes,
        selectedLifecycles,
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
    selectedSourceKinds,
    selectedResourceTypes,
    selectedLifecycles,
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
