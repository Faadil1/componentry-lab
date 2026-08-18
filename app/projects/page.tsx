import type { Metadata } from "next"
import Link from "next/link"

import { LabNavigation } from "@/components/navigation/lab-navigation"
import { ProjectHero } from "@/components/projects/project-hero"
import { ProjectWorkbench } from "@/components/projects/project-workbench"
import { ProjectProvider } from "@/components/projects/project-provider"
import { listProjects } from "@/lib/projects/repository"
import { CANONICAL_DEFAULT_PROJECT_ID } from "@/lib/projects/selectors"

export const metadata: Metadata = {
  title: "Project Brain",
  description: "Project-aware memory for briefs, decisions, evidence, components, capture states, video plans, audits, and agent handoffs.",
}

export default async function ProjectsIndexPage() {
  const projects = await listProjects()

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-left text-neutral-950">
      <div className="border-b border-stone-300 bg-stone-50/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <LabNavigation projectId={CANONICAL_DEFAULT_PROJECT_ID} className="flex-1" />
          <Link
            href="/projects/new"
            className="inline-flex h-9 items-center justify-center border border-neutral-950 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-950 transition hover:bg-neutral-950 hover:text-white"
          >
            New project +
          </Link>
        </div>
      </div>

      <ProjectProvider initialProjectId={CANONICAL_DEFAULT_PROJECT_ID} initialProjects={projects} initialSection="overview" showRecommendations={true} showAudit={true}>
        <ProjectHero />
        <ProjectWorkbench />
      </ProjectProvider>
    </div>
  )
}

export const dynamic = "force-dynamic"
