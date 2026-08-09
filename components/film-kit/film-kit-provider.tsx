"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { getFilmProjectById } from "@/lib/film-kit"
import type { FilmApprovalGate, FilmKitContextValue } from "@/lib/film-kit"

const FilmKitContext = React.createContext<FilmKitContextValue | null>(null)
const validSections = new Set(["overview", "brief", "narrative", "scenes", "shots", "capture", "production", "broll", "voice", "music", "assets", "manifest", "timeline", "subtitles", "providers", "budget", "qa", "export"])

function normalizeBool(value: string | null, fallback = false) {
  if (value === "1" || value === "true") return true
  if (value === "0" || value === "false") return false
  return fallback
}

export function FilmKitProvider({ children, initialProjectId }: { children: ReactNode; initialProjectId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [activeProjectId, setActiveProjectId] = React.useState(params.get("project") ?? initialProjectId)
  const [activeSection, setActiveSection] = React.useState(params.get("section") && validSections.has(params.get("section")!) ? params.get("section")! : "overview")
  const [activeSceneId, setActiveSceneId] = React.useState<string | null>(params.get("scene"))
  const [activeShotId, setActiveShotId] = React.useState<string | null>(params.get("shot"))
  const [activeAssetId, setActiveAssetId] = React.useState<string | null>(params.get("asset"))
  const [activeNarrationSegmentId, setActiveNarrationSegmentId] = React.useState<string | null>(params.get("narration"))
  const [inspectorVisible, setInspectorVisible] = React.useState(normalizeBool(params.get("inspector"), true))
  const [timelineVisible, setTimelineVisible] = React.useState(normalizeBool(params.get("timeline"), true))
  const [providerPanelVisible, setProviderPanelVisible] = React.useState(normalizeBool(params.get("provider"), false))
  const [exportPanelVisible, setExportPanelVisible] = React.useState(normalizeBool(params.get("export"), true))
  const [qaVisible, setQaVisible] = React.useState(normalizeBool(params.get("qa"), true))
  const [approvalGates, setApprovalGates] = React.useState<FilmApprovalGate[]>(getFilmProjectById(activeProjectId)?.approvalGates ?? [])

  const activeFilm = React.useMemo(() => getFilmProjectById(activeProjectId) ?? null, [activeProjectId])
  const validationReport = React.useMemo(() => (activeFilm ? { valid: true, errors: [], warnings: [] } : null), [activeFilm])
  const qaReport = React.useMemo(() => activeFilm?.qaReport ?? null, [activeFilm])
  const generationBudget = React.useMemo(() => activeFilm?.generationBudget ?? null, [activeFilm])

  const sync = React.useCallback((next: Record<string, string | null | undefined>) => {
    const search = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === undefined || value === "") search.delete(key)
      else search.set(key, value)
    }
    router.replace(`${pathname}?${search.toString()}`, { scroll: false })
  }, [params, pathname, router])

  const state = React.useMemo(() => ({
    activeProjectId,
    activeFilm,
    activeSection,
    activeSceneId,
    activeShotId,
    activeAssetId,
    activeNarrationSegmentId,
    inspectorVisible,
    timelineVisible,
    providerPanelVisible,
    exportPanelVisible,
    qaVisible,
    validationReport,
    qaReport,
    approvalGates,
    generationBudget,
  }), [activeProjectId, activeFilm, activeSection, activeSceneId, activeShotId, activeAssetId, activeNarrationSegmentId, inspectorVisible, timelineVisible, providerPanelVisible, exportPanelVisible, qaVisible, validationReport, qaReport, approvalGates, generationBudget])

  const actions: FilmKitContextValue["actions"] = {
    setProject(projectId) { setActiveProjectId(projectId); setApprovalGates(getFilmProjectById(projectId)?.approvalGates ?? []); sync({ project: projectId, scene: null, shot: null, asset: null, narration: null }) },
    setSection(section) { if (validSections.has(section)) { setActiveSection(section); sync({ section }) } },
    setScene(sceneId) { setActiveSceneId(sceneId); sync({ scene: sceneId }) },
    setShot(shotId) { setActiveShotId(shotId); sync({ shot: shotId }) },
    setAsset(assetId) { setActiveAssetId(assetId); sync({ asset: assetId }) },
    setNarrationSegment(segmentId) { setActiveNarrationSegmentId(segmentId); sync({ narration: segmentId }) },
    toggleInspector() { setInspectorVisible((v) => { const next = !v; sync({ inspector: next ? "1" : "0" }); return next }) },
    toggleTimeline() { setTimelineVisible((v) => { const next = !v; sync({ timeline: next ? "1" : "0" }); return next }) },
    toggleProviderPanel() { setProviderPanelVisible((v) => { const next = !v; sync({ provider: next ? "1" : "0" }); return next }) },
    toggleExportPanel() { setExportPanelVisible((v) => { const next = !v; sync({ export: next ? "1" : "0" }); return next }) },
    toggleQa() { setQaVisible((v) => { const next = !v; sync({ qa: next ? "1" : "0" }); return next }) },
    resetWorkspace() { setActiveSection("overview"); setActiveSceneId(null); setActiveShotId(null); setActiveAssetId(null); setActiveNarrationSegmentId(null); sync({ section: "overview", scene: null, shot: null, asset: null, narration: null }) },
    approveGate(gateId) { setApprovalGates((current) => current.map((gate) => gate.id === gateId ? { ...gate, status: "approved" } : gate)) },
    async copyPacket(packetId) { await navigator.clipboard.writeText(packetId) },
    async copyCurrentConfig() { await navigator.clipboard.writeText(JSON.stringify(state, null, 2)) },
  }

  return <FilmKitContext.Provider value={{ state, actions }}>{children}</FilmKitContext.Provider>
}

export function useFilmKit() {
  const ctx = React.useContext(FilmKitContext)
  if (!ctx) throw new Error("useFilmKit must be used within FilmKitProvider")
  return ctx
}