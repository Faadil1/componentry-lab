import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/auth"
import { TRACE_DESIGN_CONCERNS, TRACE_DESIGN_MODES, TRACE_DESIGN_SURFACES } from "@/lib/creative-os/trace-design-studio"
import { TRACE_RUNTIME_TARGETS, getTraceRuntimeTarget } from "@/lib/trace-runtime/catalog"
import { executeTraceRuntime } from "@/lib/trace-runtime/engine"
import { listTraceRuns } from "@/lib/trace-runtime/storage"
import type { TraceRuntimeInput } from "@/lib/trace-runtime/types"

export const dynamic = "force-dynamic"

async function requireOwnerSession() {
  const session = await getServerSession(authOptions)
  return session?.user ? session : null
}

function parseInput(body: Record<string, unknown>): TraceRuntimeInput {
  const targetKind = body.targetKind === "AGENT" ? "AGENT" : body.targetKind === "SKILL" ? "SKILL" : null
  const targetId = typeof body.targetId === "string" ? body.targetId.trim() : ""
  const mode = typeof body.mode === "string" && TRACE_DESIGN_MODES.includes(body.mode as never) ? body.mode as TraceRuntimeInput["mode"] : null
  const surface = typeof body.surface === "string" && TRACE_DESIGN_SURFACES.includes(body.surface as never) ? body.surface as TraceRuntimeInput["surface"] : null
  const concernValues = Array.isArray(body.concerns) ? body.concerns.filter((value): value is string => typeof value === "string") : []
  const concerns = concernValues.filter((value) => TRACE_DESIGN_CONCERNS.includes(value as never)) as TraceRuntimeInput["concerns"]
  const projectId = typeof body.projectId === "string" && body.projectId.trim() ? body.projectId.trim() : undefined
  const instruction = typeof body.instruction === "string" && body.instruction.trim() ? body.instruction.trim().slice(0, 4000) : undefined

  if (!targetKind || !targetId || !mode || !surface) throw new Error("targetKind, targetId, mode and surface are required.")
  if (!getTraceRuntimeTarget(targetKind, targetId)) throw new Error(`Unknown TRACE runtime target: ${targetKind} ${targetId}`)

  return { projectId, targetKind, targetId, mode, surface, concerns, instruction }
}

export async function GET(request: Request) {
  if (!(await requireOwnerSession())) return NextResponse.json({ error: "Owner GitHub authentication is required." }, { status: 401 })
  const url = new URL(request.url)
  const projectId = url.searchParams.get("projectId")?.trim() || undefined
  const runs = await listTraceRuns(projectId, 16)
  return NextResponse.json({ runs, targets: TRACE_RUNTIME_TARGETS })
}

export async function POST(request: Request) {
  if (!(await requireOwnerSession())) return NextResponse.json({ error: "Owner GitHub authentication is required to execute TRACE Design." }, { status: 401 })

  try {
    const body = await request.json() as Record<string, unknown>
    const input = parseInput(body)
    const run = await executeTraceRuntime(input)
    return NextResponse.json({ run }, { status: run.status === "SUCCEEDED" ? 200 : 500 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}
