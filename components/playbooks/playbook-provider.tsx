"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Provider & Context
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  PlaybookCollectionId,
  PlaybookSource,
  PlaybookFormat,
  PlaybookPhase,
  PlaybookAudience,
  PlaybookOutcome,
  PlaybookEcosystemTarget,
  PlaybookFilterState,
  PlaybookId,
  PlaybookEntry,
  PlaybookCounts,
  PlaybookSnapshot,
  PlaybookContext,
} from "@/lib/playbooks/types"
import {
  playbookCatalog,
  queryPlaybooks,
  computePlaybookCounts,
} from "@/lib/playbooks"

// ── Initial State ─────────────────────────────────────────────
const initialFilterState: PlaybookFilterState = {
  query: "",
  selectedCollections: [],
  selectedSources: [],
  selectedFormats: [],
  selectedPhases: [],
  selectedAudiences: [],
  selectedOutcomes: [],
  selectedEcosystemTargets: [],
}

// ── Context ────────────────────────────────────────────────────
const PlaybookCtx = createContext<PlaybookContext | null>(null)

// ── URL State Sync ────────────────────────────────────────────
function syncToUrl(state: Partial<PlaybookFilterState> & { view?: string }) {
  if (typeof window === "undefined") return
  const params = new URLSearchParams(window.location.search)

  const set = (key: string, value: string | string[]) => {
    const str = Array.isArray(value) ? value.join(",") : value
    if (str) {
      params.set(key, str)
    } else {
      params.delete(key)
    }
  }

  if (state.query !== undefined) set("q", state.query)
  if (state.selectedCollections !== undefined) set("collection", state.selectedCollections)
  if (state.selectedSources !== undefined) set("source", state.selectedSources)
  if (state.selectedFormats !== undefined) set("format", state.selectedFormats)
  if (state.selectedPhases !== undefined) set("phase", state.selectedPhases)
  if (state.selectedAudiences !== undefined) set("audience", state.selectedAudiences)
  if (state.selectedOutcomes !== undefined) set("outcome", state.selectedOutcomes)
  if (state.selectedEcosystemTargets !== undefined) set("ecosystem", state.selectedEcosystemTargets)
  if (state.view !== undefined) set("view", state.view)

  const newSearch = params.toString()
  const newUrl = newSearch
    ? `${window.location.pathname}?${newSearch}`
    : window.location.pathname
  window.history.replaceState(null, "", newUrl)
}

// ── Provider ───────────────────────────────────────────────────
export function PlaybookProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<PlaybookFilterState>(() => {
    if (typeof window === "undefined") return initialFilterState
    const params = new URLSearchParams(window.location.search)
    const parseList = (key: string): string[] => {
      const v = params.get(key)
      return v ? v.split(",").filter(Boolean) : []
    }
    return {
      query: params.get("q") ?? "",
      selectedCollections: parseList("collection") as PlaybookCollectionId[],
      selectedSources: parseList("source") as PlaybookSource[],
      selectedFormats: parseList("format") as PlaybookFormat[],
      selectedPhases: parseList("phase") as PlaybookPhase[],
      selectedAudiences: parseList("audience") as PlaybookAudience[],
      selectedOutcomes: parseList("outcome") as PlaybookOutcome[],
      selectedEcosystemTargets: parseList("ecosystem") as PlaybookEcosystemTarget[],
    }
  })

  const [viewMode, setViewModeState] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid"
    const view = new URLSearchParams(window.location.search).get("view")
    return view === "list" || view === "grid" ? view : "grid"
  })

  const [activePlaybookId, setActivePlaybookId] = useState<PlaybookId | null>(() => {
    if (typeof window === "undefined") return null
    return new URLSearchParams(window.location.search).get("item")
  })

  const [filtersVisible, setFiltersVisible] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(() => {
    if (typeof window === "undefined") return false
    return new URLSearchParams(window.location.search).get("item") !== null
  })

  const [selectedReadingPathId, setSelectedReadingPathId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return new URLSearchParams(window.location.search).get("path")
  })

  // Computed results
  const results = useMemo<PlaybookEntry[]>(() => queryPlaybooks(filters), [filters])
  const counts = useMemo<PlaybookCounts>(
    () => computePlaybookCounts(results),
    [results]
  )

  const snapshot = useMemo<PlaybookSnapshot>(
    () => ({
      ...filters,
      viewMode,
      activePlaybookId,
      resultCount: results.length,
      timestamp: new Date().toISOString(),
    }),
    [filters, viewMode, activePlaybookId, results.length]
  )

  // ── Actions ────────────────────────────────────────────────
  const setQuery = useCallback((q: string) => {
    setFilters((f) => ({ ...f, query: q }))
    syncToUrl({ query: q })
  }, [])

  const toggleCollection = useCallback((value: PlaybookCollectionId) => {
    setFilters((f) => {
      const updated = f.selectedCollections.includes(value)
        ? f.selectedCollections.filter((v) => v !== value)
        : [...f.selectedCollections, value]
      syncToUrl({ selectedCollections: updated })
      return { ...f, selectedCollections: updated }
    })
  }, [])

  const toggleSource = useCallback((value: PlaybookSource) => {
    setFilters((f) => {
      const updated = f.selectedSources.includes(value)
        ? f.selectedSources.filter((v) => v !== value)
        : [...f.selectedSources, value]
      syncToUrl({ selectedSources: updated })
      return { ...f, selectedSources: updated }
    })
  }, [])

  const toggleFormat = useCallback((value: PlaybookFormat) => {
    setFilters((f) => {
      const updated = f.selectedFormats.includes(value)
        ? f.selectedFormats.filter((v) => v !== value)
        : [...f.selectedFormats, value]
      syncToUrl({ selectedFormats: updated })
      return { ...f, selectedFormats: updated }
    })
  }, [])

  const togglePhase = useCallback((value: PlaybookPhase) => {
    setFilters((f) => {
      const updated = f.selectedPhases.includes(value)
        ? f.selectedPhases.filter((v) => v !== value)
        : [...f.selectedPhases, value]
      syncToUrl({ selectedPhases: updated })
      return { ...f, selectedPhases: updated }
    })
  }, [])

  const toggleAudience = useCallback((value: PlaybookAudience) => {
    setFilters((f) => {
      const updated = f.selectedAudiences.includes(value)
        ? f.selectedAudiences.filter((v) => v !== value)
        : [...f.selectedAudiences, value]
      syncToUrl({ selectedAudiences: updated })
      return { ...f, selectedAudiences: updated }
    })
  }, [])

  const toggleOutcome = useCallback((value: PlaybookOutcome) => {
    setFilters((f) => {
      const updated = f.selectedOutcomes.includes(value)
        ? f.selectedOutcomes.filter((v) => v !== value)
        : [...f.selectedOutcomes, value]
      syncToUrl({ selectedOutcomes: updated })
      return { ...f, selectedOutcomes: updated }
    })
  }, [])

  const toggleEcosystemTarget = useCallback((value: PlaybookEcosystemTarget) => {
    setFilters((f) => {
      const updated = f.selectedEcosystemTargets.includes(value)
        ? f.selectedEcosystemTargets.filter((v) => v !== value)
        : [...f.selectedEcosystemTargets, value]
      syncToUrl({ selectedEcosystemTargets: updated })
      return { ...f, selectedEcosystemTargets: updated }
    })
  }, [])

  const setViewMode = useCallback((mode: "grid" | "list") => {
    setViewModeState(mode)
    syncToUrl({ view: mode })
  }, [])

  const selectPlaybook = useCallback((id: PlaybookId | null) => {
    setActivePlaybookId(id)
    setPreviewVisible(id !== null)
    const params = new URLSearchParams(window.location.search)
    if (id) {
      params.set("item", id)
    } else {
      params.delete("item")
    }
    const newSearch = params.toString()
    window.history.replaceState(
      null,
      "",
      newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname
    )
  }, [])

  const closePreview = useCallback(() => {
    setPreviewVisible(false)
    setActivePlaybookId(null)
    const params = new URLSearchParams(window.location.search)
    params.delete("item")
    const newSearch = params.toString()
    window.history.replaceState(
      null,
      "",
      newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname
    )
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(initialFilterState)
    syncToUrl({
      query: "",
      selectedCollections: [],
      selectedSources: [],
      selectedFormats: [],
      selectedPhases: [],
      selectedAudiences: [],
      selectedOutcomes: [],
      selectedEcosystemTargets: [],
    })
  }, [])

  const resetPlaybooks = useCallback(() => {
    clearFilters()
    setViewModeState("grid")
    setActivePlaybookId(null)
    setFiltersVisible(false)
    setPreviewVisible(false)
    setSelectedReadingPathId(null)
    window.history.replaceState(null, "", window.location.pathname)
  }, [clearFilters])

  const selectReadingPath = useCallback((id: string | null) => {
    setSelectedReadingPathId(id)
    const params = new URLSearchParams(window.location.search)
    if (id) {
      params.set("path", id)
    } else {
      params.delete("path")
    }
    const newSearch = params.toString()
    window.history.replaceState(
      null,
      "",
      newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname
    )
  }, [])

  const toggleFiltersVisible = useCallback(() => {
    setFiltersVisible((v) => !v)
  }, [])

  const copySnapshot = useCallback(async () => {
    const text = JSON.stringify(snapshot, null, 2)
    await navigator.clipboard.writeText(text)
  }, [snapshot])

  const copyPlaybookMetadata = useCallback(async (id: PlaybookId) => {
    const entry = playbookCatalog.find((e) => e.id === id)
    if (!entry) return
    const text = JSON.stringify(
      {
        id: entry.id,
        title: entry.title,
        slug: entry.slug,
        collectionId: entry.collectionId,
        source: entry.source,
        format: entry.format,
        phases: entry.phases,
        audiences: entry.audiences,
        outcomes: entry.outcomes,
        tags: entry.tags,
        summary: entry.summary,
        sha256: entry.sha256,
        publicTargetPath: entry.publicTargetPath,
        wordCount: entry.wordCount,
        estimatedReadMinutes: entry.estimatedReadMinutes,
      },
      null,
      2
    )
    await navigator.clipboard.writeText(text)
  }, [])

  const copyReadingPath = useCallback(async (id: string) => {
    const { playbookReadingPaths } = await import("@/lib/playbooks")
    const path = playbookReadingPaths.find((p) => p.id === id)
    if (!path) return
    const text = JSON.stringify(path, null, 2)
    await navigator.clipboard.writeText(text)
  }, [])

  const ctx: PlaybookContext = {
    state: {
      ...filters,
      viewMode,
      activePlaybookId,
      filtersVisible,
      previewVisible,
      selectedReadingPathId,
      results,
      resultCount: results.length,
      counts,
      snapshot,
    },
    actions: {
      setQuery,
      toggleCollection,
      toggleSource,
      toggleFormat,
      togglePhase,
      toggleAudience,
      toggleOutcome,
      toggleEcosystemTarget,
      setViewMode,
      selectPlaybook,
      closePreview,
      clearFilters,
      resetPlaybooks,
      selectReadingPath,
      toggleFiltersVisible,
      copySnapshot,
      copyPlaybookMetadata,
      copyReadingPath,
    },
  }

  return <PlaybookCtx.Provider value={ctx}>{children}</PlaybookCtx.Provider>
}

export function usePlaybooks(): PlaybookContext {
  const ctx = useContext(PlaybookCtx)
  if (!ctx) {
    throw new Error("usePlaybooks must be used inside <PlaybookProvider>")
  }
  return ctx
}
