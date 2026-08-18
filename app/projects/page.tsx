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
    <div className="min-h-screen bg-white font-sans text-left">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3 px-6 py-3">
          <LabNavigation projectId={CANONICAL_DEFAULT_PROJECT_ID} />
          <Link
            href="/projects/new"
            className="rounded-full border border-stone-300 bg-stone-100 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            New Project
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
