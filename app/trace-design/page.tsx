import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/auth"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { TraceRuntimeConsole } from "@/components/trace-design/trace-runtime-console"
import { TraceDesignStudio } from "@/components/trace-design/trace-design-studio"
import { buildTraceDesignCatalog } from "@/lib/creative-os/trace-design-catalog"
import { listProjects } from "@/lib/projects/repository"

export const metadata: Metadata = {
  title: "TRACE Design Runtime",
  description: "Executable TRACE Design control surface for skills, agents, governed mutations, references, components and durable evidence.",
}

export const dynamic = "force-dynamic"

export default async function TraceDesignPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = searchParams ? await searchParams : {}
  const requestedProjectId = typeof params.project === "string" ? params.project : undefined
  const [catalog, session, projects] = await Promise.all([
    buildTraceDesignCatalog(),
    getServerSession(authOptions),
    listProjects(),
  ])
  const projectId = requestedProjectId ?? projects[0]?.id
  const projectOptions = projects.map((project) => ({
    id: project.id,
    title: project.title,
    kind: project.kind,
    phase: project.currentPhase,
  }))

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-neutral-900 selection:bg-neutral-950 selection:text-white">
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f5f4f0]/92 px-4 py-3 backdrop-blur-xl md:px-8">
        <div className="mx-auto max-w-[1500px]">
          <LabNavigation
            projectId={projectId}
            activeClassName="bg-neutral-950 text-white"
            inactiveClassName="border border-stone-300 bg-white/70 text-neutral-700 transition-all hover:border-neutral-500 hover:text-neutral-950"
          />
        </div>
      </header>
      <TraceRuntimeConsole
        authenticated={Boolean(session?.user)}
        defaultProjectId={projectId}
        projectOptions={projectOptions}
      />
      <TraceDesignStudio assets={catalog.assets} sync={catalog.sync} projectId={projectId} />
    </main>
  )
}
