import { NextResponse } from "next/server"
import { getAi33ApiKey, getAi33BaseUrl } from "@/lib/film-kit/providers/ai33"
import {
  AI33_VOICE_PREFIXES,
  normalizeErrorMessage,
  readUpstreamBody,
} from "@/lib/film-kit/providers/ai33/shared"

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

function isValidVoiceId(voiceId: string) {
  return AI33_VOICE_PREFIXES.some((prefix) => voiceId.startsWith(prefix))
}

function parseControlledBody(request: Request) {
  return request.json().then(
    (payload) => {
      if (!payload || typeof payload !== "object") {
        return { ok: false as const, error: "Invalid request body." }
      }

      return { ok: true as const, body: payload as Record<string, unknown> }
    },
    () => ({ ok: false as const, error: "Invalid JSON body." }),
  )
}

export async function POST(request: Request) {
  const parsed = await parseControlledBody(request)
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400, headers: noStoreHeaders() })
  }

  const body = parsed.body
  const text = typeof body.text === "string" ? body.text.trim() : ""
  const voiceId = typeof body.voiceId === "string" ? body.voiceId.trim() : ""
  const speedValue = typeof body.speed === "number" ? body.speed : Number(body.speed)
  const withTranscript = body.withTranscript === true
  const approved = body.approved === true

  if (typeof body.receive_url !== "undefined" || typeof body.file_name !== "undefined" || typeof body.pronunciation_dictionary_id !== "undefined") {
    return NextResponse.json({ ok: false, error: "Unsupported request fields were supplied." }, { status: 400, headers: noStoreHeaders() })
  }

  if (!text) {
    return NextResponse.json({ ok: false, error: "Text is required." }, { status: 400, headers: noStoreHeaders() })
  }
  if (text.length > 500) {
    return NextResponse.json({ ok: false, error: "Text must be 500 characters or fewer." }, { status: 400, headers: noStoreHeaders() })
  }
  if (!voiceId) {
    return NextResponse.json({ ok: false, error: "Voice selection is required." }, { status: 400, headers: noStoreHeaders() })
  }
  if (!isValidVoiceId(voiceId)) {
    return NextResponse.json({ ok: false, error: "Unsupported voice identifier." }, { status: 400, headers: noStoreHeaders() })
  }
  if (!Number.isFinite(speedValue) || speedValue < 0.5 || speedValue > 1.5) {
    return NextResponse.json({ ok: false, error: "Speed must be between 0.5 and 1.5." }, { status: 400, headers: noStoreHeaders() })
  }
  if (!approved) {
    return NextResponse.json({ ok: false, error: "Paid-generation approval is required." }, { status: 400, headers: noStoreHeaders() })
  }

  const apiKey = getAi33ApiKey()
  if (!apiKey) {
    return missingConfig()
  }

  const formData = new FormData()
  formData.set("text", text)
  formData.set("voice_id", voiceId)
  formData.set("speed", String(speedValue))
  formData.set("with_transcript", String(withTranscript))

  const response = await fetch(new URL("/v3/text-to-speech", getAi33BaseUrl()), {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
    cache: "no-store",
  })

  const upstream = await readUpstreamBody(response)
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: normalizeErrorMessage(upstream) },
      { status: response.status, headers: noStoreHeaders() },
    )
  }

  const taskId =
    upstream && typeof upstream === "object" && typeof (upstream as Record<string, unknown>).task_id === "string"
      ? ((upstream as Record<string, unknown>).task_id as string)
      : ""

  if (!taskId) {
    return NextResponse.json(
      { ok: false, error: "AI33 did not return a task identifier." },
      { status: 502, headers: noStoreHeaders() },
    )
  }

  return NextResponse.json(
    {
      ok: true,
      taskId,
      status: "doing",
    },
    { headers: noStoreHeaders() },
  )
}