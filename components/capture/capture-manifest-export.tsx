"use client"

import * as React from "react"
import { useCaptureBridge } from "./capture-provider"
import { buildCaptureUrl } from "@/lib/capture/serializer"
import { cn } from "@/lib/utils"

type ExportTab = "manifest_ts" | "manifest_json" | "snapshot" | "restore" | "usage"

export interface CaptureManifestExportProps {
  className?: string
}

export function CaptureManifestExport({ className }: CaptureManifestExportProps) {
  const { state } = useCaptureBridge()
  const { activeScene, manifest, snapshot, cleanView } = state
  const [activeTab, setActiveTab] = React.useState<ExportTab>("usage")
  const [copied, setCopied] = React.useState(false)

  const manifestTsExport = React.useMemo(() => {
    const minConfig = {
      id: activeScene.id,
      label: activeScene.label,
      route: activeScene.route,
      viewport: activeScene.viewport,
      aspectRatio: activeScene.aspectRatio,
      fps: activeScene.fps,
      duration: activeScene.duration,
      signatureStateId: activeScene.signatureStateId,
      states: activeScene.states.map(s => ({
        id: s.id,
        label: s.label,
        time: s.time,
        frame: s.frame,
        stateType: s.stateType,
        isCapturePoint: s.isCapturePoint,
      })),
      steps: activeScene.steps.map(st => ({
        id: st.id,
        order: st.order,
        action: st.action,
        target: st.target,
        resultingStateId: st.resultingStateId,
      })),
    }
    return `export const captureManifest = ${JSON.stringify(minConfig, null, 2)} as const`
  }, [activeScene])

  const manifestJsonExport = React.useMemo(() => {
    return JSON.stringify(manifest, null, 2)
  }, [manifest])

  const snapshotExport = React.useMemo(() => {
    return JSON.stringify(snapshot, null, 2)
  }, [snapshot])

  const restoreUrlExport = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return buildCaptureUrl(window.location.href, snapshot)
    }
    return ""
  }, [snapshot])

  const usageExport = `import { CaptureWorkbench } from "@/components/capture/capture-workbench"
import { capturePresets } from "@/lib/capture/presets"

export function MyDemo() {
  return (
    <CaptureWorkbench
      scene={capturePresets.evidenceDecision}
      initialStateId="decision-hold"
      initialViewport="desktop"
      initialChromeMode="full"
    />
  )
}`

  const contents: Record<ExportTab, string> = React.useMemo(() => ({
    manifest_ts: manifestTsExport,
    manifest_json: manifestJsonExport,
    snapshot: snapshotExport,
    restore: restoreUrlExport,
    usage: usageExport,
  }), [manifestTsExport, manifestJsonExport, snapshotExport, restoreUrlExport, usageExport])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contents[activeTab])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent
    }
  }, [activeTab, contents])

  const tabs: Array<{ key: ExportTab; label: string }> = [
    { key: "usage", label: "Usage" },
    { key: "manifest_ts", label: "TS Config" },
    { key: "manifest_json", label: "JSON Manifest" },
    { key: "snapshot", label: "Snapshot" },
    { key: "restore", label: "Restore URL" },
  ]

  if (cleanView) return null

  return (
    <div className={cn("rounded-xl border border-stone-850 bg-[#0e0d0c] overflow-hidden text-xs", className)}>
      <div className="flex items-center justify-between border-b border-stone-850 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key)
                setCopied(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[9px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
                activeTab === tab.key
                  ? "bg-stone-800 text-stone-200"
                  : "text-stone-500 hover:text-stone-300"
              )}
              aria-pressed={activeTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[9.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
            copied ? "text-emerald-300" : "text-stone-500 hover:text-stone-300"
          )}
          aria-label={`Copy ${activeTab} data`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="overflow-x-auto p-4 max-h-[300px]">
        <pre className="font-mono text-[10.5px] leading-relaxed text-stone-300 whitespace-pre select-all">
          {contents[activeTab]}
        </pre>
      </div>
    </div>
  )
}
export default CaptureManifestExport
