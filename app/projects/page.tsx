import type { Metadata } from "next"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { ProjectHero } from "@/components/projects/project-hero"
import { ProjectWorkbench } from "@/components/projects/project-workbench"
import { ProjectProvider } from "@/components/projects/project-provider"
import { CANONICAL_DEFAULT_PROJECT_ID } from "@/lib/projects"

export const metadata: Metadata = {
  title: "Project Brain",
  description: "Project-aware memory for briefs, decisions, evidence, components, capture states, video plans, audits, and agent handoffs.",
}

export default function ProjectsIndexPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-left">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-3">
          <LabNavigation projectId={CANONICAL_DEFAULT_PROJECT_ID} />
        </div>
      </div>

      <ProjectProvider initialProjectId={CANONICAL_DEFAULT_PROJECT_ID} initialSection="overview" showRecommendations={true} showAudit={true}>
        <ProjectHero />
        <ProjectWorkbench />
      </ProjectProvider>
    </div>
  )
}
export const dynamic = "force-static"
