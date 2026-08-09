import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LabNavigation } from "@/components/navigation/lab-navigation"
import { ProjectHero } from "@/components/projects/project-hero"
import { ProjectWorkbench } from "@/components/projects/project-workbench"
import { ProjectProvider } from "@/components/projects/project-provider"
import { getProjectById, listProjects } from "@/lib/projects/repository"

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }): Promise<Metadata> {
  const { projectId } = await params
  const project = await getProjectById(projectId)

  if (!project) {
    return { title: "Not Found" }
  }

  return {
    title: project.title,
    description: project.description,
  }
}

export default async function ProjectDossierPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await getProjectById(projectId)
  if (!project) notFound()

  const projects = await listProjects()

  return (
    <div className="min-h-screen bg-white font-sans text-left">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-3">
          <LabNavigation projectId={project.id} />
        </div>
      </div>

      <ProjectProvider initialProjectId={project.id} initialProjects={projects} initialSection="overview" showRecommendations={true} showAudit={true}>
        <ProjectHero />
        <ProjectWorkbench />
      </ProjectProvider>
    </div>
  )
}

export const dynamic = "force-dynamic"
