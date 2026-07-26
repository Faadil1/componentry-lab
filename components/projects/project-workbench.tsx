"use client"

import { useEffect } from "react"
import { useProjectBrain } from "./project-provider"
import { ProjectSelector } from "./project-selector"
import { ProjectSectionNav } from "./project-section-nav"
import { ProjectPhaseRail } from "./project-phase-rail"
import { ProjectOverview } from "./project-overview"
import { ProjectFacts } from "./project-facts"
import { ProjectAssumptions } from "./project-assumptions"
import { ProjectDecisions } from "./project-decisions"
import { ProjectRejections } from "./project-rejections"
import { ProjectEvidence } from "./project-evidence"
import { ProjectRisks } from "./project-risks"
import { ProjectOutputs } from "./project-outputs"
import { ProjectNextActions } from "./project-next-actions"
import { ProjectLearnings } from "./project-learnings"
import { ProjectRecommendations } from "./project-recommendations"
import { ProjectPlaybookMap } from "./project-playbook-map"
import { ProjectComponentMap } from "./project-component-map"
import { ProjectRecipeMap } from "./project-recipe-map"
import { ProjectCapturePlan } from "./project-capture-plan"
import { ProjectVideoPlan } from "./project-video-plan"
import { ProjectAuditPanel } from "./project-audit-panel"
import { ProjectExport } from "./project-export"
import { ProjectInspector } from "./project-inspector"
import { ProjectEmptyState } from "./project-empty-state"
import { WORKSPACE_SECTIONS } from "@/lib/projects/schema"
import { cn } from "@/lib/utils"

export function ProjectWorkbench() {
  const { state, actions } = useProjectBrain()
  const { activeProject, activeSection, inspectorVisible, auditVisible, recommendationsVisible, activeItemId } = state

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT" ||
        document.activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return
      }

      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 9) {
        const target = WORKSPACE_SECTIONS[num - 1]
        if (target) actions.setSection(target.id)
        return
      }
      if (e.key === "0") {
        const target = WORKSPACE_SECTIONS[9]
        if (target) actions.setSection(target.id)
        return
      }

      const currentIdx = WORKSPACE_SECTIONS.findIndex((s) => s.id === activeSection)
      if (e.key === "ArrowLeft") {
        const prevIdx = currentIdx > 0 ? currentIdx - 1 : WORKSPACE_SECTIONS.length - 1
        actions.setSection(WORKSPACE_SECTIONS[prevIdx].id)
        return
      }
      if (e.key === "ArrowRight") {
        const nextIdx = currentIdx < WORKSPACE_SECTIONS.length - 1 ? currentIdx + 1 : 0
        actions.setSection(WORKSPACE_SECTIONS[nextIdx].id)
        return
      }

      if (e.key === "p" || e.key === "P") {
        actions.setSection("build")
      }
      if (e.key === "c" || e.key === "C") {
        actions.setSection("build")
      }
      if (e.key === "r" || e.key === "R") {
        actions.toggleRecommendations()
      }
      if (e.key === "a" || e.key === "A") {
        actions.toggleAudit()
      }
      if (e.key === "i" || e.key === "I") {
        actions.toggleInspector()
      }
      if (e.key === "Escape") {
        actions.clearSelection()
        if (inspectorVisible) actions.toggleInspector()
        if (recommendationsVisible) actions.toggleRecommendations()
        if (auditVisible) actions.toggleAudit()
      }
      if (e.key === "Home") {
        actions.setSection("overview")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeSection, inspectorVisible, recommendationsVisible, auditVisible, actions])

  if (!activeProject) {
    return <ProjectEmptyState />
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case "overview":
        return <ProjectOverview />
      case "context":
        return (
          <div className="space-y-4 text-left">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">Context & Brief</h2>
            <div className="rounded border border-stone-250 p-4 bg-white font-mono text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">
              {activeProject.problem}
            </div>
            <ProjectFacts />
            <ProjectAssumptions />
          </div>
        )
      case "positioning":
        return (
          <div className="space-y-5 text-left font-mono text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950">Positioning & Tension</h2>
            <div className="rounded border border-stone-250 p-4 bg-white space-y-3">
              <div>
                <span className="text-[9px] text-stone-400 uppercase font-semibold block">Positioning Statement</span>
                <p className="text-stone-700 leading-relaxed">{activeProject.positioningStatement}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-stone-100 pt-3">
                <div>
                  <span className="text-[9px] text-stone-400 uppercase font-semibold block">Tension</span>
                  <p className="text-stone-600">{activeProject.tension}</p>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 uppercase font-semibold block">Differentiation</span>
                  <p className="text-stone-600">{activeProject.differentiation}</p>
                </div>
              </div>
            </div>
            <ProjectRejections />
          </div>
        )
      case "design":
        return (
          <div className="space-y-4 text-left font-mono text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950">Design Direction</h2>
            <div className="rounded border border-stone-255 p-4 bg-white space-y-3">
              {[
                { label: "Visual Vibe", val: activeProject.visualDirection },
                { label: "Typography Direction", val: activeProject.typographyDirection },
                { label: "Color Palette Notes", val: activeProject.colorDirection },
                { label: "Responsive Strategy", val: activeProject.responsiveStrategy },
                { label: "Accessibility Strategy", val: activeProject.accessibilityStrategy },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[9px] text-stone-400 uppercase font-semibold block">{item.label}</span>
                  <p className="text-stone-700 leading-relaxed">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case "proof":
        return (
          <div className="space-y-4 text-left font-mono text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950">Verifiable Claims & Proof</h2>
            <div className="rounded border border-stone-250 p-4 bg-white space-y-2">
              <div>
                <span className="text-[9px] text-stone-400 uppercase font-semibold block">Primary claim</span>
                <p className="text-stone-700 font-semibold leading-relaxed">{activeProject.primaryClaim}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-stone-100 pt-3">
                <div>
                  <span className="text-[9px] text-stone-400 uppercase font-semibold block">Proof Moment</span>
                  <p className="text-stone-600">{activeProject.proofMoment}</p>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 uppercase font-semibold block">Technical Proof</span>
                  <p className="text-stone-600">{activeProject.technicalProof}</p>
                </div>
              </div>
            </div>
            <ProjectEvidence />
          </div>
        )
      case "build":
        return (
          <div className="space-y-5 text-left">
            <ProjectPlaybookMap />
            <ProjectComponentMap />
            <ProjectRecipeMap />
          </div>
        )
      case "capture":
        return <ProjectCapturePlan />
      case "video":
        return <ProjectVideoPlan />
      case "presentation":
        return (
          <div className="space-y-4 text-left font-mono text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950">Presentation & Launch</h2>
            <div className="rounded border border-stone-250 p-4 bg-white space-y-2">
              <div>
                <span className="text-[9px] text-stone-400 uppercase font-semibold block">Presentation Title</span>
                <p className="text-stone-700 font-semibold">{activeProject.presentationTitle || activeProject.title}</p>
              </div>
              <div>
                <span className="text-[9px] text-stone-400 uppercase font-semibold block">One line summary</span>
                <p className="text-stone-600">{activeProject.oneLineSummary || activeProject.description}</p>
              </div>
            </div>
            <ProjectExport />
          </div>
        )
      case "decisions":
        return <ProjectDecisions />
      case "risks":
        return <ProjectRisks />
      case "outputs":
        return (
          <div className="space-y-5 text-left">
            <ProjectOutputs />
            <ProjectNextActions />
          </div>
        )
      case "audit":
        return <ProjectAuditPanel />
      case "learnings":
        return <ProjectLearnings />
      default:
        return <ProjectOverview />
    }
  }

  const showSidebar = inspectorVisible && activeItemId

  return (
    <div className="mx-auto max-w-screen-xl px-6 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-6">
          <ProjectSelector />
          <ProjectSectionNav />
        </aside>

        <div className="flex flex-col gap-6">
          <ProjectPhaseRail />
          <div className={cn("grid gap-8", showSidebar ? "grid-cols-1 lg:grid-cols-[1fr_280px]" : "grid-cols-1")}>
            <main className="space-y-6">{renderSectionContent()}</main>
            {showSidebar && (
              <aside className="flex flex-col gap-6 lg:sticky lg:top-20">
                <ProjectInspector />
              </aside>
            )}
          </div>
          {(recommendationsVisible || auditVisible) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-stone-200 pt-6">
              {recommendationsVisible && <ProjectRecommendations />}
              {auditVisible && <ProjectAuditPanel />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectWorkbench
