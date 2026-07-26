// ─────────────────────────────────────────────────────────────
// /projects — Project Brain Index (Server Component)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { ProjectHero } from "@/components/projects/project-hero"
import { ProjectWorkbench } from "@/components/projects/project-workbench"
import { ProjectProvider } from "@/components/projects/project-provider"

export const metadata: Metadata = {
  title: "Project Brain",
  description: "Project-aware memory for briefs, decisions, evidence, components, capture states, video plans, audits, and agent handoffs.",
}

export default function ProjectsIndexPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-left">
      {/* Shared Navigation */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-3">
          <LabNavigation />
        </div>
      </div>

      {/* Project Provider and Workspace */}
      <ProjectProvider initialProjectId="stated" initialSection="overview" showRecommendations={true} showAudit={true}>
        <ProjectHero />
        <ProjectWorkbench />
      </ProjectProvider>
    </div>
  )
}
export const dynamic = "force-static"
