import { NextResponse } from "next/server"
import { getAi33ApiKey, getAi33BaseUrl } from "@/lib/film-kit/providers/ai33"
import { isValidAi33TaskId, normalizeErrorMessage, readUpstreamBody } from "@/lib/film-kit/providers/ai33/shared"

export const dynamic = "force-dynamic"

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store",
  }
}

function missingConfig() {
  return NextResponse.json(
    { ok: false, error: "AI33 server configuration is missing." },
    { status: 503, headers: noStoreHeaders() },
  )
}

export async function GET(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params
  if (!isValidAi33TaskId(taskId)) {
    return NextResponse.json({ ok: false, error: "Invalid task identifier." }, { status: 400, headers: noStoreHeaders() })
  }

  const apiKey = getAi33ApiKey()
  if (!apiKey) {
    return missingConfig()
  }

  const response = await fetch(new URL(`/v1/task/${taskId}`, getAi33BaseUrl()), {
    headers: {
      "xi-api-key": apiKey,
    },
    cache: "no-store",
  })

  const body = await readUpstreamBody(response)
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: normalizeErrorMessage(body) },
      { status: response.status, headers: noStoreHeaders() },
    )
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null
  const metadata = record?.metadata && typeof record.metadata === "object" ? (record.metadata as Record<string, unknown>) : null
  const status = record && typeof record.status === "string" ? record.status : ""

  if (status !== "doing" && status !== "done" && status !== "error") {
    return NextResponse.json({ ok: false, error: "Unexpected task status." }, { status: 502, headers: noStoreHeaders() })
  }

  return NextResponse.json(
    {
      ok: true,
      task: {
        id: typeof record?.id === "string" ? record.id : taskId,
        status,
        progress: typeof record?.progress === "number" ? record.progress : 0,
        errorMessage: typeof record?.error_message === "string" ? record.error_message : null,
        creditCost: typeof record?.credit_cost === "number" ? record.credit_cost : null,
        type: typeof record?.type === "string" ? record.type : null,
        audioUrl: typeof metadata?.audio_url === "string" ? metadata.audio_url : null,
        srtUrl: typeof metadata?.srt_url === "string" ? metadata.srt_url : null,
        jsonUrl: typeof metadata?.json_url === "string" ? metadata.json_url : null,
      },
    },
    { headers: noStoreHeaders() },
  )
}