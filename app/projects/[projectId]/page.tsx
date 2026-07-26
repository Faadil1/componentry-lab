// ─────────────────────────────────────────────────────────────
// /projects/[projectId] — Specific Project Dossier (Server Component)
// ─────────────────────────────────────────────────────────────

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { ProjectHero } from "@/components/projects/project-hero"
import { ProjectWorkbench } from "@/components/projects/project-workbench"
import { ProjectProvider } from "@/components/projects/project-provider"
import { getAllProjects, getProjectById } from "@/lib/projects"

// ── Static Params ──────────────────────────────────────────────
export function generateStaticParams(): Array<{ projectId: string }> {
  return getAllProjects().map((p) => ({
    projectId: p.id,
  }))
}

// ── Metadata ───────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>
}): Promise<Metadata> {
  const { projectId } = await params
  const project = getProjectById(projectId)

  if (!project) {
    return { title: "Not Found" }
  }

  return {
    title: project.title,
    description: project.description,
  }
}

// ── Page ───────────────────────────────────────────────────────
export default async function ProjectDossierPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = getProjectById(projectId)

  if (!project) notFound()

  return (
    <div className="min-h-screen bg-white font-sans text-left">
      {/* Shared Navigation */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-3">
          <LabNavigation />
        </div>
      </div>

      {/* Project Workbench */}
      <ProjectProvider initialProjectId={project.id} initialSection="overview" showRecommendations={true} showAudit={true}>
        <ProjectHero />
        <ProjectWorkbench />
      </ProjectProvider>
    </div>
  )
}

export const dynamic = "force-static"
