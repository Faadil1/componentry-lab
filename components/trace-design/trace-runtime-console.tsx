"use client"

import * as React from "react"
import { AuthControls } from "@/components/auth/auth-controls"
import {
  TRACE_DESIGN_CONCERNS,
  TRACE_DESIGN_MODES,
  TRACE_DESIGN_SURFACES,
  type TraceDesignConcern,
  type TraceDesignSurface,
} from "@/lib/creative-os/trace-design-studio"
import type { CreativeProjectMode } from "@/lib/director/types"
import { TRACE_RUNTIME_TARGETS } from "@/lib/trace-runtime/catalog"
import type {
  TraceRuntimeAction,
  TraceRuntimeRun,
  TraceRuntimeRunListItem,
  TraceRuntimeTargetKind,
} from "@/lib/trace-runtime/types"

const SURFACE_LABELS: Record<TraceDesignSurface, string> = {
  WEB_PRODUCT: "Web / Product",
  MOBILE_NATIVE: "Mobile native",
  DASHBOARD: "Dashboard",
  EDITORIAL: "Editorial",
  PRESENTATION: "Presentation",
  MOTION_VIDEO: "Motion / Video",
}

const CONCERN_LABELS: Record<TraceDesignConcern, string> = {
  ANTI_SLOP: "Anti-slop",
  AESTHETIC_LINEAGE: "Aesthetic lineage",
  COMPONENT_COMPOSITION: "Component composition",
  MOBILE_NATIVE_UX: "Mobile-native UX",
  MOTION: "Motion",
  CHARACTER: "Character / Mascot",
  TEXTURE: "Texture / Raster",
  COPY_PERSUASION: "Copy / Persuasion",
  BRAND_SYSTEM: "Brand system",
  ACCESSIBILITY: "Accessibility",
  RUNTIME_ASSURANCE: "Runtime assurance",
  EVIDENCE: "Evidence",
}

function clean(value: string) {
  return value.replace(/_/g, " ")
}

function authorityClass(authority: string) {
  if (authority === "EXPLICIT_EXTERNAL") return "border-rose-300 bg-rose-50 text-rose-800"
  if (authority === "LOCAL_REVERSIBLE") return "border-emerald-300 bg-emerald-50 text-emerald-800"
  if (authority === "PREPARE") return "border-indigo-300 bg-indigo-50 text-indigo-800"
  return "border-stone-300 bg-stone-50 text-stone-700"
}

export interface TraceRuntimeConsoleProps {
  authenticated: boolean
  defaultProjectId?: string
  projectOptions: Array<{ id: string; title: string; kind: string; phase: string }>
}

export function TraceRuntimeConsole({ authenticated, defaultProjectId, projectOptions }: TraceRuntimeConsoleProps) {
  const initialProjectId = defaultProjectId ?? projectOptions[0]?.id ?? ""
  const [projectId, setProjectId] = React.useState(initialProjectId)
  const [targetKind, setTargetKind] = React.useState<TraceRuntimeTargetKind>("SKILL")
  const [targetId, setTargetId] = React.useState("trace-design")
  const [mode, setMode] = React.useState<CreativeProjectMode>("HACKATHON")
  const [surface, setSurface] = React.useState<TraceDesignSurface>("WEB_PRODUCT")
  const [concerns, setConcerns] = React.useState<TraceDesignConcern[]>(["ANTI_SLOP", "COMPONENT_COMPOSITION", "RUNTIME_ASSURANCE"])
  const [instruction, setInstruction] = React.useState("")
  const [running, setRunning] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [lastRun, setLastRun] = React.useState<TraceRuntimeRun | null>(null)
  const [recentRuns, setRecentRuns] = React.useState<TraceRuntimeRunListItem[]>([])

  const targets = React.useMemo(() => TRACE_RUNTIME_TARGETS.filter((target) => target.kind === targetKind), [targetKind])
  const selectedTarget = targets.find((target) => target.id === targetId) ?? targets[0]

  React.useEffect(() => {
    if (!selectedTarget && targets[0]) setTargetId(targets[0].id)
    if (selectedTarget && selectedTarget.kind !== targetKind && targets[0]) setTargetId(targets[0].id)
  }, [selectedTarget, targetKind, targets])

  const refreshRuns = React.useCallback(async () => {
    if (!authenticated) return
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""
    const response = await fetch(`/api/trace-design/run${query}`, { cache: "no-store" })
    if (!response.ok) return
    const body = await response.json() as { runs?: TraceRuntimeRunListItem[] }
    setRecentRuns(body.runs ?? [])
  }, [authenticated, projectId])

  React.useEffect(() => {
    void refreshRuns()
  }, [refreshRuns])

  const toggleConcern = (concern: TraceDesignConcern) => {
    setConcerns((current) => current.includes(concern) ? current.filter((item) => item !== concern) : [...current, concern])
  }

  const runTarget = async () => {
    if (!authenticated || !selectedTarget) return
    setRunning(true)
    setMessage(null)
    try {
      const response = await fetch("/api/trace-design/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId || undefined,
          targetKind,
          targetId: selectedTarget.id,
          mode,
          surface,
          concerns,
          instruction,
        }),
      })
      const body = await response.json() as { run?: TraceRuntimeRun; error?: string }
      if (!response.ok || !body.run) throw new Error(body.error ?? "TRACE runtime execution failed.")
      setLastRun(body.run)
      setMessage(`Run ${body.run.runId} completed.`)
      await refreshRuns()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setRunning(false)
    }
  }

  const mutateAction = async (action: TraceRuntimeAction, operation: "execute" | "undo") => {
    if (!authenticated || !lastRun) return
    setMessage(null)
    try {
      const response = await fetch(`/api/trace-design/actions/${encodeURIComponent(action.actionId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, approved: true }),
      })
      const body = await response.json() as { action?: TraceRuntimeAction; message?: string; error?: string }
      if (!response.ok || !body.action) throw new Error(body.error ?? "TRACE action failed.")
      setLastRun({
        ...lastRun,
        actions: lastRun.actions.map((item) => item.actionId === body.action?.actionId ? body.action : item),
      })
      setMessage(body.message ?? `${operation} completed.`)
      await refreshRuns()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 pt-8 md:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-neutral-950 bg-neutral-950 text-white shadow-[0_20px_60px_rgba(0,0,0,0.14)]">
        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="border-b border-white/15 p-6 md:p-8 lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">Executable Runtime</span>
              <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-stone-300">Durable ledger</span>
            </div>
            <h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.04em] md:text-5xl">Run TRACE Design, don’t just inspect it.</h2>
            <p className="mt-4 text-sm leading-6 text-stone-300">Skills and agents execute on the server, persist evidence and artifacts, and can prepare reversible Project Brain mutations. External GitHub writes stay behind an explicit approval gate and are restricted to dedicated evidence branches.</p>

            <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Owner authority</p>
              <div className="mt-2 text-stone-100">
                <AuthControls authenticated={authenticated} callbackUrl={projectId ? `/trace-design?project=${encodeURIComponent(projectId)}` : "/trace-design"} />
              </div>
              {!authenticated ? <p className="mt-3 text-xs leading-5 text-amber-200">Routing remains visible without authentication, but server execution and mutations require the authorized GitHub owner session.</p> : null}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
              {[
                ["Suggest", "analysis only"],
                ["Prepare", "persist artifacts"],
                ["Local reversible", "write + undo"],
                ["Explicit external", "GitHub branch + undo"],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="font-semibold">{label}</p>
                  <p className="mt-1 text-stone-400">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f7f6f1] p-5 text-neutral-950 md:p-8">
            <div className="grid gap-5 xl:grid-cols-2">
              <div>
                <label className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">Project Brain</label>
                <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold outline-none focus:border-neutral-950">
                  <option value="">Unscoped run</option>
                  {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.title} · {project.phase}</option>)}
                </select>
              </div>

              <div>
                <label className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">Runtime target</label>
                <div className="mt-2 flex gap-2">
                  {(["SKILL", "AGENT"] as TraceRuntimeTargetKind[]).map((kind) => (
                    <button key={kind} type="button" onClick={() => { setTargetKind(kind); const first = TRACE_RUNTIME_TARGETS.find((target) => target.kind === kind); if (first) setTargetId(first.id) }} className={`rounded-xl border px-3 py-2 text-xs font-bold ${targetKind === kind ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-stone-600"}`}>{kind}</button>
                  ))}
                  <select value={targetId} onChange={(event) => setTargetId(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 text-xs font-semibold outline-none focus:border-neutral-950">
                    {targets.map((target) => <option key={target.id} value={target.id}>{target.label}</option>)}
                  </select>
                </div>
                {selectedTarget ? <div className="mt-2 flex items-start justify-between gap-3"><p className="text-xs leading-5 text-stone-600">{selectedTarget.description}</p><span className={`shrink-0 rounded-full border px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] ${authorityClass(selectedTarget.authority)}`}>{clean(selectedTarget.authority)}</span></div> : null}
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">Mode</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TRACE_DESIGN_MODES.map((item) => <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-full border px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] ${mode === item ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-stone-600"}`}>{clean(item)}</button>)}
                </div>
              </div>
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">Surface</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TRACE_DESIGN_SURFACES.map((item) => <button key={item} type="button" onClick={() => setSurface(item)} className={`rounded-full border px-3 py-2 text-[10px] font-semibold ${surface === item ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-stone-300 bg-white text-stone-600"}`}>{SURFACE_LABELS[item]}</button>)}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">Concerns / gates to activate</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TRACE_DESIGN_CONCERNS.map((item) => {
                  const selected = concerns.includes(item)
                  return <button key={item} type="button" aria-pressed={selected} onClick={() => toggleConcern(item)} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${selected ? "border-[#e66b43] bg-[#fff0e9] text-[#8e3219]" : "border-stone-300 bg-white text-stone-500"}`}>{CONCERN_LABELS[item]}</button>
                })}
              </div>
            </div>

            <div className="mt-5">
              <label className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">Optional run instruction</label>
              <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} rows={3} placeholder="Example: focus on judge-facing differentiation and proof above the fold" className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-neutral-950" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => void runTarget()} disabled={!authenticated || running || !selectedTarget} className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">{running ? "Executing…" : `Execute ${targetKind.toLowerCase()}`}</button>
              <p className="text-xs text-stone-500">Execution writes the run ledger. Mutations remain separate actions requiring another explicit click.</p>
            </div>
            {message ? <p className="mt-4 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700">{message}</p> : null}
          </div>
        </div>

        {lastRun ? (
          <div className="border-t border-white/15 bg-[#111] p-5 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">Last execution · {lastRun.runId}</p>
                <h3 className="mt-2 max-w-4xl text-2xl font-black tracking-tight text-white">{lastRun.summary}</h3>
              </div>
              <span className={`rounded-full border px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${lastRun.status === "SUCCEEDED" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-rose-400/40 bg-rose-400/10 text-rose-300"}`}>{lastRun.status}</span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">Findings</p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-stone-300">{lastRun.findings.map((finding, index) => <p key={`${index}-${finding}`}>{finding}</p>)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">Artifacts · {lastRun.artifacts.length}</p>
                <div className="mt-3 space-y-2">{lastRun.artifacts.map((artifact) => <details key={artifact.artifactId} className="rounded-xl border border-white/10 bg-black/20 p-3"><summary className="cursor-pointer text-sm font-semibold text-white">{artifact.title}</summary><p className="mt-2 text-xs leading-5 text-stone-400">{artifact.summary}</p><pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/30 p-3 font-mono text-[9px] text-stone-400">{JSON.stringify(artifact.payload, null, 2)}</pre></details>)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">Prepared actions · {lastRun.actions.length}</p>
                <div className="mt-3 space-y-3">
                  {lastRun.actions.length === 0 ? <p className="text-sm text-stone-400">No mutation prepared by this run.</p> : lastRun.actions.map((action) => (
                    <div key={action.actionId} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-white">{action.title}</p><span className={`rounded-full border px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] ${authorityClass(action.authority)}`}>{clean(action.authority)}</span></div>
                      <p className="mt-2 text-xs leading-5 text-stone-400">{action.description}</p>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-stone-500">{action.status} · {action.reversible ? "reversible" : "non-reversible"}</p>
                      <div className="mt-3 flex gap-2">
                        {action.status === "PREPARED" ? <button type="button" onClick={() => void mutateAction(action, "execute")} className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">Approve & execute</button> : null}
                        {action.status === "EXECUTED" && action.reversible ? <button type="button" onClick={() => void mutateAction(action, "undo")} className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300">Undo</button> : null}
                      </div>
                      {action.result ? <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/30 p-3 font-mono text-[9px] text-stone-400">{JSON.stringify(action.result, null, 2)}</pre> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="border-t border-white/15 bg-[#171717] p-5 md:px-8">
          <div className="flex items-center justify-between gap-3"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">Recent durable runs</p><span className="font-mono text-[9px] text-stone-600">{recentRuns.length}</span></div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {recentRuns.slice(0, 8).map((run) => <div key={run.runId} className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-semibold text-white">{run.targetId}</p><span className="font-mono text-[8px] uppercase text-stone-500">{run.status}</span></div><p className="mt-2 line-clamp-2 text-[11px] leading-4 text-stone-400">{run.summary}</p><p className="mt-2 font-mono text-[8px] text-stone-600">{new Date(run.createdAt).toLocaleString()}</p></div>)}
            {recentRuns.length === 0 ? <p className="text-xs text-stone-500">No durable runtime execution recorded yet for this scope.</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
