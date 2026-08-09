"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

type ProjectCreateResult = {
  status: string
  error?: string
  project?: unknown
}

type CreateFormState = ProjectCreateResult & {
  requestedTitle: string
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\'\"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatProjectLabel(projectId: string) {
  return projectId
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

export function ProjectCreateForm({ action, kinds }: { action: (formData: FormData) => Promise<ProjectCreateResult>; kinds: Array<{ id: string; label: string }> }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(async (_prevState: CreateFormState, formData: FormData) => {
    const requestedTitle = String(formData.get("title") ?? "")
    const result = await action(formData)
    return { ...(result || { status: "VALIDATION_FAILED", error: "Unable to create project." }), requestedTitle }
  }, { status: "idle", requestedTitle: "" })

  const createdProjectId = state?.status === "CREATED" && state.project && typeof state.project === "object" && "id" in state.project
    ? (state.project as { id: string }).id
    : null
  const requestedId = slugify(state.requestedTitle)
  const duplicateSucceeded = Boolean(createdProjectId && requestedId && createdProjectId !== requestedId)

  useEffect(() => {
    if (createdProjectId && !duplicateSucceeded) {
      router.replace(`/projects/${createdProjectId}`)
      router.refresh()
    }
  }, [createdProjectId, duplicateSucceeded, router])

  return (
    <form action={formAction} className="space-y-5 rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Project name</span>
          <input name="title" required className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950" placeholder="Northstar" />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Project kind</span>
          <select name="kind" required className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950">
            {kinds.map((kind) => <option key={kind.id} value={kind.id}>{kind.label}</option>)}
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Short brief / problem</span>
        <textarea name="problem" required rows={4} className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950" placeholder="What problem is this project solving?" />
      </label>

      <label className="grid gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Primary goal</span>
        <textarea name="primaryGoal" required rows={3} className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950" placeholder="What should this project achieve?" />
      </label>

      <label className="grid gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Success definition</span>
        <input name="successDefinition" className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950" placeholder="Optional success criteria" />
      </label>

      <label className="grid gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">One-line brief</span>
        <input name="brief" className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950" placeholder="Optional one-line description" />
      </label>

      {duplicateSucceeded ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" aria-live="polite">
          <p>Project created as {formatProjectLabel(createdProjectId ?? "project")} because {formatProjectLabel(requestedId ?? "project")} already exists.</p>
          <Link href={`/projects/${createdProjectId}`} className="mt-3 inline-flex items-center justify-center rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-950/60">
            Open {formatProjectLabel(createdProjectId ?? "project")}
          </Link>
        </div>
      ) : state?.status === "CREATED" && state.project && typeof state.project === "object" && "id" in state.project ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" aria-live="polite">
          Project created as {formatProjectLabel(createdProjectId ?? "project")}.
        </p>
      ) : state?.status && state.status !== "idle" && state.status !== "CREATED" ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.error || state.status}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">Projects will preserve identity through refresh and restart.</p>
        <button type="submit" disabled={pending} aria-disabled={pending} className="rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Creating..." : "Create Project"}
        </button>
      </div>
    </form>
  )
}