import type { Metadata } from "next"

import { ProjectCreateForm } from "@/components/projects/project-create-form"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { createProject } from "@/lib/projects/repository"
import { PROJECT_KINDS } from "@/lib/projects/schema"
import type { AuthorityContext } from "@/lib/director/types"
import { requireCanonicalWriteAccess } from "@/lib/security/canonical-write-access"

type ProjectCreateResult = {
  status: string
  error?: string
  project?: unknown
}

export const metadata: Metadata = {
  title: "Create Project",
  description: "Create a governed Project Brain without editing source code.",
}

const LOCAL_CREATE_AUTHORITY: AuthorityContext = {
  authorityLevel: "local-reversible-execution",
  requestedAction: "Create project",
  target: "project-repository",
  reversibility: "reversible",
  risk: "low",
  approvalRequirement: "explicit",
  grantedScope: ["project:create"],
  grantedBy: "system",
  grantedAt: new Date().toISOString(),
  expiration: null,
  status: "granted",
}

async function createProjectAction(formData: FormData): Promise<ProjectCreateResult> {
  "use server"

  const access = await requireCanonicalWriteAccess()
  if (!access.ok) {
    return { status: "UNAUTHORIZED", error: "Canonical write access is required." }
  }

  const title = String(formData.get("title") ?? "")
  const kind = String(formData.get("kind") ?? "")
  const problem = String(formData.get("problem") ?? "")
  const primaryGoal = String(formData.get("primaryGoal") ?? "")
  const successDefinition = String(formData.get("successDefinition") ?? "")
  const brief = String(formData.get("brief") ?? "")

  return await createProject(
    {
      title,
      kind: kind as (typeof PROJECT_KINDS)[number]["id"],
      problem,
      primaryGoal,
      successDefinition,
      brief,
    },
    LOCAL_CREATE_AUTHORITY,
  )
}

export default function ProjectCreatePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-3">
          <LabNavigation projectId="stated" />
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 space-y-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Projects</p>
          <h1 className="text-3xl font-black tracking-tight">Create Project</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-700">
            Start a new governed project with a stable project identity, a brief problem statement, and a clear primary goal.
          </p>
        </div>
        <ProjectCreateForm action={createProjectAction} kinds={PROJECT_KINDS} />
      </section>
    </main>
  )
}
