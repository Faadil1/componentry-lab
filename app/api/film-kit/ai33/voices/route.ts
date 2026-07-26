import { NextResponse } from "next/server"
import { getAi33ApiKey, getAi33BaseUrl } from "@/lib/film-kit/providers/ai33"
import {
  isAi33VoiceProvider,
  normalizeErrorMessage,
  readUpstreamBody,
} from "@/lib/film-kit/providers/ai33/shared"

export const dynamic = "force-dynamic"

const SAFE_FILTERS = new Set(["provider", "q", "language", "gender", "page", "page_size"])

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

function parsePositiveInteger(value: string | null, label: string) {
  if (value == null || value === "") {
    return { ok: true as const, value: null as number | null }
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return { ok: false as const, error: `Invalid ${label}.` }
  }

  return { ok: true as const, value: Math.floor(parsed) }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get("provider")
  const page = parsePositiveInteger(searchParams.get("page"), "page")
  if (!page.ok) {
    return NextResponse.json({ ok: false, error: page.error }, { status: 400, headers: noStoreHeaders() })
  }

  const pageSizeRaw = searchParams.get("page_size") ?? searchParams.get("limit")
  const pageSize = parsePositiveInteger(pageSizeRaw, "page size")
  if (!pageSize.ok) {
    return NextResponse.json({ ok: false, error: pageSize.error }, { status: 400, headers: noStoreHeaders() })
  }

  if (!isAi33VoiceProvider(provider)) {
    return NextResponse.json(
      { ok: false, error: "Invalid or missing provider." },
      { status: 400, headers: noStoreHeaders() },
    )
  }

  const apiKey = getAi33ApiKey()
  if (!apiKey) {
    return missingConfig()
  }

  const upstreamUrl = new URL("/v3/voices", getAi33BaseUrl())
  upstreamUrl.searchParams.set("provider", provider)

  for (const key of SAFE_FILTERS) {
    if (key === "provider" || key === "page_size") continue
    const value = searchParams.get(key)
    if (value) upstreamUrl.searchParams.set(key, value)
  }

  if (page.value != null) {
    upstreamUrl.searchParams.set("page", String(page.value))
  }
  if (pageSize.value != null) {
    upstreamUrl.searchParams.set("page_size", String(Math.min(100, pageSize.value)))
  }

  const response = await fetch(upstreamUrl, {
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

  const data = body as
    | {
        success?: unknown
        format_version?: unknown
        data?: unknown
        pagination?: unknown
      }
    | null

  const voices = Array.isArray(data?.data)
    ? data.data
        .map((voice) => {
          if (!voice || typeof voice !== "object") return null
          const record = voice as Record<string, unknown>
          const voiceId = typeof record.voice_id === "string" ? record.voice_id : ""
          const name = typeof record.name === "string" ? record.name : voiceId
          if (!voiceId) return null
          return {
            voiceId,
            name,
            language: typeof record.language === "string" ? record.language : null,
            gender: typeof record.gender === "string" ? record.gender : null,
            tags: Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === "string") : [],
            previewUrl: typeof record.preview_url === "string" ? record.preview_url : null,
          }
        })
        .filter((voice): voice is NonNullable<typeof voice> => !!voice)
    : []

  const pagination = data?.pagination && typeof data.pagination === "object" ? data.pagination as Record<string, unknown> : null

  return NextResponse.json(
    {
      ok: true,
      formatVersion: typeof data?.format_version === "string" ? data.format_version : null,
      voices,
      pagination: pagination
        ? {
            page: typeof pagination.page === "number" ? pagination.page : null,
            pageSize: typeof pagination.page_size === "number" ? pagination.page_size : null,
            total: typeof pagination.total === "number" ? pagination.total : null,
            hasMore: typeof pagination.has_more === "boolean" ? pagination.has_more : null,
          }
        : null,
    },
    { headers: noStoreHeaders() },
  )
}