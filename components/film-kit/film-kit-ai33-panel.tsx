"use client"

import * as React from "react"
import type { FilmKitAi33Packet } from "@/lib/film-kit"
import { AI33_VOICE_PROVIDERS } from "@/lib/film-kit/providers/ai33/shared"

type VoiceOption = {
  voiceId: string
  name: string
  language: string | null
  gender: string | null
  tags: string[]
  previewUrl: string | null
}

type VoicesResponse =
  | {
      ok: true
      formatVersion: string | null
      voices: VoiceOption[]
      pagination: {
        page: number | null
        pageSize: number | null
        total: number | null
        hasMore: boolean | null
      } | null
    }
  | { ok: false; error: string }

type NarrationResponse =
  | { ok: true; taskId: string; status: "doing" }
  | { ok: false; error: string }

type Ai33Task = {
  id: string
  status: "doing" | "done" | "error"
  progress: number
  errorMessage: string | null
  creditCost: number | null
  type: string | null
  audioUrl: string | null
  srtUrl: string | null
  jsonUrl: string | null
}

type TaskResponse =
  | {
      ok: true
      task: Ai33Task
    }
  | { ok: false; error: string }

const DEFAULT_TEXT = "Commit before you know."
const TASK_TIMEOUT_MS = 2 * 60 * 1000
const TEMPORARY_STATUSES = new Set([429, 502, 503, 504])
const INITIAL_POLL_DELAY_MS = 4000
const MAX_POLL_DELAY_MS = 15000
const MAX_TEMPORARY_FAILURES = 6

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-1 break-words text-sm leading-relaxed text-neutral-950 [overflow-wrap:anywhere]">{value}</p>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">{children}</p>
}

function parseResponseBody(text: string) {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export function FilmKitAi33Panel({ packet }: { packet: FilmKitAi33Packet }) {
  const [provider, setProvider] = React.useState<string>("")
  const [voiceQuery, setVoiceQuery] = React.useState("")
  const [language, setLanguage] = React.useState("")
  const [gender, setGender] = React.useState("")
  const [pageSize, setPageSize] = React.useState(30)
  const [loadStatus, setLoadStatus] = React.useState<string | null>(null)
  const [voices, setVoices] = React.useState<VoiceOption[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = React.useState("")
  const [text, setText] = React.useState(DEFAULT_TEXT)
  const [speed, setSpeed] = React.useState(1)
  const [withTranscript, setWithTranscript] = React.useState(false)
  const [approved, setApproved] = React.useState(false)
  const [generateStatus, setGenerateStatus] = React.useState<string | null>(null)
  const [taskId, setTaskId] = React.useState("")
  const [task, setTask] = React.useState<Ai33Task | null>(null)
  const [isLoadingVoices, setIsLoadingVoices] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isPolling, setIsPolling] = React.useState(false)
  const [taskError, setTaskError] = React.useState<string | null>(null)
  const [taskNotice, setTaskNotice] = React.useState<string | null>(null)
  const [voicesError, setVoicesError] = React.useState<string | null>(null)
  const [ai33BoundaryState, setAi33BoundaryState] = React.useState<"ready" | "not-configured" | "connected">("ready")

  const mountedRef = React.useRef(true)
  const inFlightRef = React.useRef(false)
  const pollTimerRef = React.useRef<number | null>(null)
  const timeoutTimerRef = React.useRef<number | null>(null)
  const pollingAbortRef = React.useRef<AbortController | null>(null)
  const pollingInFlightRef = React.useRef(false)
  const temporaryFailureCountRef = React.useRef(0)
  const nextDelayRef = React.useRef(INITIAL_POLL_DELAY_MS)
  const pollingSessionRef = React.useRef(0)
  const taskIdRef = React.useRef("")

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current)
      if (timeoutTimerRef.current) window.clearTimeout(timeoutTimerRef.current)
      pollingAbortRef.current?.abort()
    }
  }, [])

  function clearPollingTimers() {
    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
    if (timeoutTimerRef.current) {
      window.clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
  }

  function stopPolling() {
    clearPollingTimers()
    pollingAbortRef.current?.abort()
    pollingAbortRef.current = null
    pollingInFlightRef.current = false
    setIsPolling(false)
  }

  function scheduleNextPoll(sessionId: number, delayMs: number) {
    clearPollingTimers()
    pollTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current || pollingSessionRef.current !== sessionId) return
      void runTaskPoll()
    }, delayMs)
  }

  async function runTaskPoll() {
    const currentTaskId = taskIdRef.current
    if (!currentTaskId || !mountedRef.current) return
    if (pollingInFlightRef.current) return

    pollingInFlightRef.current = true
    pollingAbortRef.current?.abort()
    const controller = new AbortController()
    pollingAbortRef.current = controller
    const sessionId = pollingSessionRef.current

    try {
      const response = await fetch(`/api/film-kit/ai33/tasks/${encodeURIComponent(currentTaskId)}`, {
        cache: "no-store",
        signal: controller.signal,
      })
      const rawText = await response.text()
      if (!mountedRef.current || controller.signal.aborted) return

      const parsed = parseResponseBody(rawText) as TaskResponse

      if (response.ok && parsed.ok) {
        const nextTask = parsed.task
        temporaryFailureCountRef.current = 0
        nextDelayRef.current = INITIAL_POLL_DELAY_MS
        setTask(nextTask)
        setTaskError(null)
        setTaskNotice(null)
        setGenerateStatus(nextTask.status === "done" ? `Task complete: ${nextTask.id}` : `Task queued: ${nextTask.id}`)
        if (nextTask.status === "done") {
          stopPolling()
          return
        }
        if (nextTask.status === "error") {
          stopPolling()
          setTaskError(nextTask.errorMessage ?? "AI33 returned an error.")
          return
        }

        setIsPolling(true)
        scheduleNextPoll(sessionId, INITIAL_POLL_DELAY_MS)
        return
      }

      const status = response.status
      const message = !response.ok && parsed && typeof parsed === "object" && !Array.isArray(parsed) && "error" in parsed && typeof (parsed as { error?: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : rawText.trim() || `Task request failed (${status}).`

      if (TEMPORARY_STATUSES.has(status)) {
        temporaryFailureCountRef.current += 1
        const backoff = Math.min(MAX_POLL_DELAY_MS, INITIAL_POLL_DELAY_MS * (temporaryFailureCountRef.current + 1))
        nextDelayRef.current = backoff
        setTaskNotice("Task status temporarily unavailable. Retrying?")
        setTaskError(null)
        setGenerateStatus("doing")
        setIsPolling(true)
        if (temporaryFailureCountRef.current >= MAX_TEMPORARY_FAILURES) {
          stopPolling()
          setTaskError("Task polling stopped after repeated temporary failures.")
          return
        }
        scheduleNextPoll(sessionId, backoff)
        return
      }

      stopPolling()
      setTaskError(message)
      setTaskNotice(null)
      return
    } catch (error) {
      if (!mountedRef.current || controller.signal.aborted) return
      const isAbort = error instanceof DOMException && error.name === "AbortError"
      if (isAbort) return
      stopPolling()
      setTaskError(error instanceof Error ? error.message : "AI33 task polling failed.")
      setTaskNotice(null)
      return
    } finally {
      pollingInFlightRef.current = false
      if (controller.signal.aborted) {
        pollingAbortRef.current = null
      }
    }
  }

  // The polling bootstrap intentionally runs once per taskId change.
  React.useEffect(() => {
    if (!taskId || !mountedRef.current) return

    taskIdRef.current = taskId
    pollingSessionRef.current += 1
    temporaryFailureCountRef.current = 0
    nextDelayRef.current = INITIAL_POLL_DELAY_MS
    setTaskError(null)
    setTaskNotice(null)
    setIsPolling(true)
    clearPollingTimers()

    timeoutTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return
      stopPolling()
      setTaskError("AI33 task polling timed out. You can try again manually.")
    }, TASK_TIMEOUT_MS)

    void runTaskPoll()

    return () => {
      stopPolling()
    }
  }, [taskId]) // eslint-disable-line react-hooks/exhaustive-deps

  const textIsValid = text.trim().length > 0 && text.trim().length <= 500
  const canGenerate = Boolean(selectedVoiceId && textIsValid && approved && !isGenerating)
  const canCheckTaskAgain = Boolean(taskId && !isPolling && task && task.status === "doing")

  async function loadVoices() {
    if (!provider) {
      setVoicesError("Choose a provider first.")
      return
    }

    setIsLoadingVoices(true)
    setVoicesError(null)
    setLoadStatus(null)

    try {
      const searchParams = new URLSearchParams({ provider })
      if (voiceQuery.trim()) searchParams.set("q", voiceQuery.trim())
      if (language.trim()) searchParams.set("language", language.trim())
      if (gender.trim()) searchParams.set("gender", gender.trim())
      searchParams.set("page", "1")
      searchParams.set("page_size", String(Math.min(Math.max(pageSize || 30, 1), 100)))

      const response = await fetch(`/api/film-kit/ai33/voices?${searchParams.toString()}`, { cache: "no-store" })
      const data = (await response.json()) as VoicesResponse

      if (!response.ok || !data.ok) {
        throw new Error((data as { error?: string }).error ?? `Voice loading failed (${response.status}).`)
      }

      setVoices(data.voices)
      setLoadStatus(`${data.voices.length} voices loaded.`)
      setSelectedVoiceId(data.voices[0]?.voiceId ?? "")
      setAi33BoundaryState("connected")
    } catch (error) {
      setVoices([])
      setSelectedVoiceId("")
      const message = error instanceof Error ? error.message : "Voice loading failed."
      setVoicesError(message)
      if (message === "AI33 server configuration is missing.") {
        setAi33BoundaryState("not-configured")
      }
    } finally {
      setIsLoadingVoices(false)
    }
  }

  async function generateNarration() {
    if (!canGenerate || inFlightRef.current || !selectedVoiceId) return

    inFlightRef.current = true
    setIsGenerating(true)
    setGenerateStatus(null)
    setTaskError(null)
    setTaskNotice(null)
    setTask(null)

    try {
      const response = await fetch("/api/film-kit/ai33/narration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          text: text.trim(),
          voiceId: selectedVoiceId,
          speed,
          withTranscript,
          approved: true,
        }),
      })
      const data = (await response.json()) as NarrationResponse

      if (!response.ok || !data.ok) {
        throw new Error((data as { error?: string }).error ?? `Narration request failed (${response.status}).`)
      }

      setTaskId(data.taskId)
      setGenerateStatus(`Task queued: ${data.taskId}`)
      setTask({
        id: data.taskId,
        status: data.status,
        progress: 0,
        errorMessage: null,
        creditCost: null,
        type: "tts",
        audioUrl: null,
        srtUrl: null,
        jsonUrl: null,
      })
    } catch (error) {
      setGenerateStatus(error instanceof Error ? error.message : "Narration request failed.")
    } finally {
      inFlightRef.current = false
      setIsGenerating(false)
    }
  }

  function resetTask() {
    setTaskId("")
    setTask(null)
    setTaskError(null)
    setTaskNotice(null)
    setGenerateStatus(null)
    pollingSessionRef.current += 1
    temporaryFailureCountRef.current = 0
    nextDelayRef.current = INITIAL_POLL_DELAY_MS
    stopPolling()
  }

  function checkTaskAgain() {
    if (!canCheckTaskAgain) return
    pollingSessionRef.current += 1
    temporaryFailureCountRef.current = 0
    nextDelayRef.current = INITIAL_POLL_DELAY_MS
    setTaskError(null)
    setTaskNotice(null)
    setIsPolling(true)
    clearPollingTimers()
    void runTaskPoll()
  }

  return (
    <section className="space-y-4" data-film-kit-section="ai33">
      <div className="border-b border-stone-300 pb-3">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">AI33 integration</p>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Controlled narration boundary</h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 space-y-4 rounded-2xl border border-stone-300 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${ai33BoundaryState === "connected" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : ai33BoundaryState === "not-configured" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-stone-200 bg-stone-50 text-stone-600"}`}>{ai33BoundaryState === "connected" ? "AI33 CONNECTED" : ai33BoundaryState === "not-configured" ? "AI33 NOT CONFIGURED" : "SERVER BOUNDARY READY"}</span>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">No automatic request</span>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <FieldLabel>Provider</FieldLabel>
              <select
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70"
              >
                <option value="">Select provider</option>
                {AI33_VOICE_PROVIDERS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0 space-y-2">
              <FieldLabel>Search</FieldLabel>
              <input
                value={voiceQuery}
                onChange={(event) => setVoiceQuery(event.target.value)}
                placeholder="Optional voice search"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <FieldLabel>Language</FieldLabel>
              <input
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                placeholder="e.g. vi-VN"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <FieldLabel>Gender</FieldLabel>
              <input
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadVoices()}
              disabled={!provider || isLoadingVoices}
              className="rounded-full border border-neutral-950 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingVoices ? "Loading voices..." : "Load voices"}
            </button>
            <div className="min-w-0 space-y-1">
              <FieldLabel>Page size</FieldLabel>
              <input
                type="number"
                min={1}
                max={100}
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value) || 30)}
                className="w-28 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70"
              />
            </div>
          </div>

          {voicesError ? <p className="text-sm text-rose-700">{voicesError}</p> : null}
          {loadStatus ? <p className="text-sm text-emerald-800">{loadStatus}</p> : null}

          <div className="min-w-0 space-y-2 rounded-2xl border border-stone-200 bg-stone-50 p-3">
            <FieldLabel>Voice options</FieldLabel>
            {voices.length ? (
              <div className="grid min-w-0 gap-2">
                {voices.map((voice) => {
                  const isSelected = voice.voiceId === selectedVoiceId
                  return (
                    <button
                      key={voice.voiceId}
                      type="button"
                      onClick={() => setSelectedVoiceId(voice.voiceId)}
                      className={`min-w-0 w-full rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70 ${isSelected ? "border-neutral-950 bg-white" : "border-stone-200 bg-white/70 hover:border-stone-400"}`}
                    >
                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 break-words text-sm font-semibold text-neutral-950 [overflow-wrap:anywhere]">{voice.name}</p>
                        <span className="min-w-0 max-w-full break-all font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400 [overflow-wrap:anywhere]">{voice.voiceId}</span>
                      </div>
                      <div className="mt-2 flex min-w-0 flex-wrap gap-2 text-xs text-stone-600">
                        <span className="min-w-0 break-words [overflow-wrap:anywhere]">{voice.language ?? "Language unavailable"}</span>
                        <span className="min-w-0 break-words [overflow-wrap:anywhere]">{voice.gender ?? "Gender unavailable"}</span>
                        <span>{voice.tags.length ? voice.tags.join(" · ") : "No tags"}</span>
                      </div>
                      {voice.previewUrl ? <p className="mt-2 text-xs text-stone-500">Preview available after explicit play.</p> : null}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-stone-600">Load voices after selecting a provider.</p>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-4 rounded-2xl border border-stone-300 bg-stone-950 p-4 text-stone-100">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Server safety note</p>
            <p className="text-sm leading-relaxed text-stone-300">The API key stays server-only. This panel only calls local Film Kit routes and never auto-generates narration.</p>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <StatusRow label="Title" value={packet.title} />
            <StatusRow label="Audience" value={packet.audience} />
            <StatusRow label="Delivery mode" value={packet.deliveryMode} />
            <StatusRow label="Approval" value={approved ? "Approved" : "Awaiting approval"} />
          </div>

          <div className="min-w-0 space-y-2 rounded-2xl border border-stone-800 bg-stone-900/70 p-3">
            <FieldLabel>Test text</FieldLabel>
            <textarea
              value={text}
              maxLength={500}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-100/70"
            />
            <div className="flex min-w-0 items-center justify-between gap-3 text-xs text-stone-400">
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">{text.length}/500</span>
              <span>{textIsValid ? "Text valid" : "Text required"}</span>
            </div>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-2 rounded-2xl border border-stone-800 bg-stone-900/70 p-3">
              <FieldLabel>Speed</FieldLabel>
              <input
                type="number"
                min={0.5}
                max={1.5}
                step={0.1}
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value) || 1)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-100/70"
              />
            </div>
            <label className="flex min-w-0 items-start gap-3 rounded-2xl border border-stone-800 bg-stone-900/70 p-3 text-sm text-stone-200">
              <input type="checkbox" checked={withTranscript} onChange={(event) => setWithTranscript(event.target.checked)} className="mt-1 h-4 w-4 rounded border-stone-600 bg-stone-950 text-stone-100" />
              <span>Include transcript</span>
            </label>
          </div>

          <label className="flex min-w-0 items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-50">
            <input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} className="mt-1 h-4 w-4 rounded border-amber-300 bg-stone-950 text-amber-300" />
            <span>I approve one potentially paid AI33 narration request.</span>
          </label>

          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void generateNarration()}
              disabled={!canGenerate}
              className="rounded-full border border-stone-100 bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate test narration"}
            </button>
            <button
              type="button"
              onClick={resetTask}
              className="rounded-full border border-stone-700 bg-stone-900 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-stone-500 hover:text-white"
            >
              Reset
            </button>
          </div>

          <div className="min-w-0 grid gap-3 rounded-2xl border border-stone-800 bg-stone-900/60 p-3 text-sm text-stone-200">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <span>Selected voice</span>
              <span className="min-w-0 max-w-full break-all font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400 [overflow-wrap:anywhere]">{selectedVoiceId || "None"}</span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <span>Generation status</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">{isPolling ? "Polling" : task?.status ?? "Idle"}</span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <span>Task id</span>
              <span className="min-w-0 max-w-full break-all font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400 [overflow-wrap:anywhere]">{taskId || "None"}</span>
            </div>
            {taskNotice ? <p className="text-sm text-amber-200">{taskNotice}</p> : null}
          </div>

          {generateStatus ? <p className="text-sm text-stone-300">{generateStatus}</p> : null}
          {taskError ? <p className="text-sm text-rose-300">{taskError}</p> : null}

          {canCheckTaskAgain ? (
            <button
              type="button"
              onClick={() => void checkTaskAgain()}
              className="rounded-full border border-stone-700 bg-stone-900 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-stone-500 hover:text-white"
            >
              Check task again
            </button>
          ) : null}

          {task ? (
            <div className="min-w-0 space-y-3 rounded-2xl border border-stone-800 bg-stone-900/70 p-3">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <StatusRow label="Task status" value={task.status} />
                <StatusRow label="Progress" value={`${task.progress}%`} />
                <StatusRow label="Credit cost" value={task.creditCost == null ? "Unavailable" : String(task.creditCost)} />
                <StatusRow label="Type" value={task.type ?? "Unavailable"} />
              </div>
              {task.status === "done" ? (
                <div className="min-w-0 space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-50">
                  <p className="text-sm font-medium">Narration complete.</p>
                  {task.audioUrl ? <audio controls src={task.audioUrl} className="w-full" /> : null}
                  <div className="flex min-w-0 flex-wrap gap-3 text-sm">
                    {task.audioUrl ? (
                      <a className="max-w-full break-all underline [overflow-wrap:anywhere]" href={task.audioUrl} target="_blank" rel="noreferrer">
                        Open audio
                      </a>
                    ) : null}
                    {task.srtUrl ? (
                      <a className="max-w-full break-all underline [overflow-wrap:anywhere]" href={task.srtUrl} target="_blank" rel="noreferrer">
                        Download transcript
                      </a>
                    ) : null}
                    {task.jsonUrl ? (
                      <a className="max-w-full break-all underline [overflow-wrap:anywhere]" href={task.jsonUrl} target="_blank" rel="noreferrer">
                        Open JSON
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {task.status === "error" ? <p className="text-sm text-rose-300">{task.errorMessage ?? "AI33 returned an error."}</p> : null}
            </div>
          ) : null}

          <details className="min-w-0 rounded-2xl border border-stone-800 bg-stone-900/60 px-3 py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-100/70">
              Developer packet
            </summary>
            <pre className="mt-3 max-h-[24rem] overflow-x-auto overflow-y-auto rounded-xl border border-stone-800 bg-stone-950 p-3 text-[11px] leading-relaxed text-stone-200">{JSON.stringify(packet, null, 2)}</pre>
          </details>
        </div>
      </div>
    </section>
  )
}