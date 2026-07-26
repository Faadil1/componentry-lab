"use client"

import { createContext, useContext, useState, useMemo, useCallback } from "react"
import type { ReactNode } from "react"
import type { ProjectContext, ProjectId, ProjectPhase, ProjectSnapshot } from "@/lib/projects/types"
import {
  getAllProjects,
  getProjectById,
  validateProjectBrain,
  getAllRecommendations,
  parseProjectUrl,
  buildProjectUrl,
  formatProjectBrainMarkdown,
  formatAgentPacketMarkdown,
  formatDesignPacketMarkdown,
  formatBuildPacketMarkdown,
  formatCapturePacketMarkdown,
  formatVideoPacketMarkdown,
  formatSubmissionPacketMarkdown,
  getPhaseFromProjectStatus,
} from "@/lib/projects"

const ProjectCtx = createContext<ProjectContext | null>(null)

export function ProjectProvider({
  children,
  initialProjectId,
  initialSection = "overview",
  showInspector = false,
  showRecommendations = false,
  showAudit = false,
}: {
  children: ReactNode
  initialProjectId: ProjectId
  initialSection?: string
  showInspector?: boolean
  showRecommendations?: boolean
  showAudit?: boolean
}) {
  const allProjects = useMemo(() => getAllProjects(), [])
  const initialProject = useMemo(() => getProjectById(initialProjectId), [initialProjectId])
  const initialSnapshot = typeof window !== "undefined" ? parseProjectUrl(window.location.search) : {}

  const [activeProjectId, setActiveProjectId] = useState<ProjectId>(initialSnapshot.activeProjectId ?? initialProjectId)
  const [activeSection, setActiveSection] = useState<string>(initialSnapshot.activeSection ?? initialSection)
  const [activePhase, setActivePhase] = useState<ProjectPhase>(initialSnapshot.activePhase ?? initialProject?.currentPhase ?? "intake")
  const [activeItemId, setActiveItemId] = useState<string | null>(initialSnapshot.activeItemId ?? null)
  const [inspectorVisible, setInspectorVisible] = useState<boolean>(initialSnapshot.inspectorVisible ?? showInspector)
  const [recommendationsVisible, setRecommendationsVisible] = useState<boolean>(initialSnapshot.recommendationsVisible ?? showRecommendations)
  const [auditVisible, setAuditVisible] = useState<boolean>(initialSnapshot.auditVisible ?? showAudit)
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(initialSnapshot.selectedRecommendationId ?? null)
  const [exportFeedback, setExportFeedback] = useState<string | null>(null)

  const activeProject = useMemo(() => {
    return getProjectById(activeProjectId) || allProjects[0]
  }, [activeProjectId, allProjects])

  const syncUrl = useCallback(
    (nextState: Partial<ProjectSnapshot>) => {
      if (typeof window === "undefined") return
      const currentSnapshot: ProjectSnapshot = {
        activeProjectId: nextState.activeProjectId ?? activeProjectId,
        activeSection: nextState.activeSection ?? activeSection,
        activePhase: nextState.activePhase ?? activePhase,
        activeItemId: nextState.activeItemId !== undefined ? nextState.activeItemId : activeItemId,
        inspectorVisible: nextState.inspectorVisible ?? inspectorVisible,
        recommendationsVisible: nextState.recommendationsVisible ?? recommendationsVisible,
        auditVisible: nextState.auditVisible ?? auditVisible,
        selectedRecommendationId: nextState.selectedRecommendationId ?? selectedRecommendationId,
        timestamp: new Date().toISOString(),
      }
      const newUrl = buildProjectUrl(window.location.pathname, currentSnapshot)
      window.history.replaceState(null, "", newUrl)
    },
    [
      activeProjectId,
      activeSection,
      activePhase,
      activeItemId,
      inspectorVisible,
      recommendationsVisible,
      auditVisible,
      selectedRecommendationId,
    ]
  )

  const setProject = useCallback(
    (id: ProjectId) => {
      setActiveProjectId(id)
      setActiveItemId(null)
      const proj = getProjectById(id)
      if (proj) {
        const ph = getPhaseFromProjectStatus(proj.status, proj.currentPhase)
        setActivePhase(ph)
        syncUrl({ activeProjectId: id, activeItemId: null, activePhase: ph })
      } else {
        syncUrl({ activeProjectId: id, activeItemId: null })
      }
    },
    [syncUrl]
  )

  const setSection = useCallback(
    (section: string) => {
      setActiveSection(section)
      syncUrl({ activeSection: section })
    },
    [syncUrl]
  )

  const setPhase = useCallback(
    (phase: ProjectPhase) => {
      setActivePhase(phase)
      syncUrl({ activePhase: phase })
    },
    [syncUrl]
  )

  const selectItem = useCallback(
    (id: string | null) => {
      setActiveItemId(id)
      syncUrl({ activeItemId: id })
    },
    [syncUrl]
  )

  const toggleInspector = useCallback(() => {
    setInspectorVisible((prev) => {
      const next = !prev
      syncUrl({ inspectorVisible: next })
      return next
    })
  }, [syncUrl])

  const toggleRecommendations = useCallback(() => {
    setRecommendationsVisible((prev) => {
      const next = !prev
      syncUrl({ recommendationsVisible: next })
      return next
    })
  }, [syncUrl])

  const toggleAudit = useCallback(() => {
    setAuditVisible((prev) => {
      const next = !prev
      syncUrl({ auditVisible: next })
      return next
    })
  }, [syncUrl])

  const selectRecommendation = useCallback(
    (id: string | null) => {
      setSelectedRecommendationId(id)
      syncUrl({ selectedRecommendationId: id })
    },
    [syncUrl]
  )

  const clearSelection = useCallback(() => {
    setActiveItemId(null)
    setSelectedRecommendationId(null)
    syncUrl({ activeItemId: null, selectedRecommendationId: null })
  }, [syncUrl])

  const resetProject = useCallback(() => {
    setActiveSection("overview")
    if (activeProject) setActivePhase(activeProject.currentPhase)
    setActiveItemId(null)
    setInspectorVisible(false)
    setRecommendationsVisible(false)
    setAuditVisible(false)
    setSelectedRecommendationId(null)
    if (typeof window === "undefined") return
    window.history.replaceState(null, "", window.location.pathname)
  }, [activeProject])

  const validationReport = useMemo(() => {
    return activeProject ? validateProjectBrain(activeProject) : null
  }, [activeProject])

  const recommendations = useMemo(() => {
    return activeProject ? getAllRecommendations(activeProject) : []
  }, [activeProject])

  const snapshot = useMemo<ProjectSnapshot>(() => {
    return {
      activeProjectId,
      activeSection,
      activePhase,
      activeItemId,
      inspectorVisible,
      recommendationsVisible,
      auditVisible,
      selectedRecommendationId,
      timestamp: new Date().toISOString(),
    }
  }, [
    activeProjectId,
    activeSection,
    activePhase,
    activeItemId,
    inspectorVisible,
    recommendationsVisible,
    auditVisible,
    selectedRecommendationId,
  ])

  const triggerFeedback = (message: string) => {
    setExportFeedback(message)
    setTimeout(() => setExportFeedback(null), 2500)
  }

  const copySnapshot = async () => {
    const text = JSON.stringify(snapshot, null, 2)
    await navigator.clipboard.writeText(text)
    triggerFeedback("Snapshot State copied to clipboard!")
  }

  const copyProjectBrain = async () => {
    if (!activeProject) return
    const text = formatProjectBrainMarkdown(activeProject)
    await navigator.clipboard.writeText(text)
    triggerFeedback("Project Brain Packet copied!")
  }

  const copyAgentPacket = async () => {
    if (!activeProject) return
    const text = formatAgentPacketMarkdown(activeProject)
    await navigator.clipboard.writeText(text)
    triggerFeedback("Agent Packet copied!")
  }

  const copyDesignPacket = async () => {
    if (!activeProject) return
    const text = formatDesignPacketMarkdown(activeProject)
    await navigator.clipboard.writeText(text)
    triggerFeedback("Design Packet copied!")
  }

  const copyBuildPacket = async () => {
    if (!activeProject) return
    const text = formatBuildPacketMarkdown(activeProject)
    await navigator.clipboard.writeText(text)
    triggerFeedback("Build Packet copied!")
  }

  const copyCapturePacket = async () => {
    if (!activeProject) return
    const text = formatCapturePacketMarkdown(activeProject)
    await navigator.clipboard.writeText(text)
    triggerFeedback("Capture Packet copied!")
  }

  const copyVideoPacket = async () => {
    if (!activeProject) return
    const text = formatVideoPacketMarkdown(activeProject)
    await navigator.clipboard.writeText(text)
    triggerFeedback("Video Packet copied!")
  }

  const copySubmissionPacket = async () => {
    if (!activeProject) return
    const text = formatSubmissionPacketMarkdown(activeProject)
    await navigator.clipboard.writeText(text)
    triggerFeedback("Submission Packet copied!")
  }

  return (
    <ProjectCtx.Provider
      value={{
        state: {
          activeProjectId,
          activeProject,
          activeSection,
          activePhase,
          activeItemId,
          inspectorVisible,
          recommendationsVisible,
          auditVisible,
          selectedRecommendationId,
          snapshot,
          validationReport,
          recommendations,
          readiness: validationReport?.readinessScore ?? 0,
          allProjects,
        },
        actions: {
          setProject,
          setSection,
          setPhase,
          selectItem,
          toggleInspector,
          toggleRecommendations,
          toggleAudit,
          selectRecommendation,
          clearSelection,
          resetProject,
          copySnapshot,
          copyProjectBrain,
          copyAgentPacket,
          copyDesignPacket,
          copyBuildPacket,
          copyCapturePacket,
          copyVideoPacket,
          copySubmissionPacket,
        },
      }}
    >
      {children}
      {exportFeedback && (
        <div
          role="status"
          aria-live="assertive"
          className="fixed bottom-5 right-5 z-50 rounded border border-emerald-800/40 bg-emerald-950 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-emerald-300 shadow-md"
        >
          {exportFeedback}
        </div>
      )}
    </ProjectCtx.Provider>
  )
}

export function useProjectBrain() {
  const context = useContext(ProjectCtx)
  if (!context) {
    throw new Error("useProjectBrain must be used within a ProjectProvider")
  }
  return context
}

export default ProjectProvider
