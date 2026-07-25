"use client"

import * as React from "react"
import { useInteractionPlayer } from "./player-provider"
import { cn } from "@/lib/utils"

type ExportTab = "config" | "state" | "usage"

export function PlayerTokenExport({ className }: { className?: string }) {
  const { state, config, scenes, markers } = useInteractionPlayer()
  const [activeTab, setActiveTab] = React.useState<ExportTab>("usage")
  const [copied, setCopied] = React.useState(false)

  const configExport = React.useMemo(() => {
    const preset = {
      fps: config.fps,
      aspectRatio: config.aspectRatio,
      loop: config.loop,
      autoplay: config.autoplay,
      scenes: scenes.map((s) => ({
        id: s.id,
        label: s.label,
        start: s.start,
        duration: s.duration,
        description: s.description,
      })),
      markers: markers.map((m) => ({
        id: m.id,
        label: m.label,
        time: m.time,
        type: m.type,
        description: m.description,
      })),
    }
    return `export const playerConfig = ${JSON.stringify(preset, null, 2)} as const`
  }, [config, scenes, markers])

  const stateExport = React.useMemo(() => {
    return JSON.stringify(
      {
        status: state.status,
        mode: state.mode,
        currentTime: Number(state.currentTime.toFixed(3)),
        duration: state.duration,
        progress: Number(state.progress.toFixed(4)),
        frame: state.frame,
        fps: state.fps,
        playbackRate: state.playbackRate,
        activeScene: state.activeScene?.id ?? null,
        activeSceneProgress: Number(state.activeSceneProgress.toFixed(4)),
        selectedMarker: state.selectedMarker?.id ?? null,
      },
      null,
      2
    )
  }, [state])

  const usageExport = `import { InteractionPlayer } from "@/components/player/interaction-player"
import { playerPresets } from "@/lib/player/presets"

export function MyDemo() {
  return (
    <InteractionPlayer
      preset={playerPresets.evidenceToDecision}
      initialMode="interactive"
    />
  )
}`

  const contents: Record<ExportTab, string> = React.useMemo(() => ({
    config: configExport,
    state: stateExport,
    usage: usageExport,
  }), [configExport, stateExport, usageExport])

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
    { key: "config", label: "Config" },
    { key: "state", label: "State" },
  ]

  return (
    <div className={cn("rounded-xl border border-stone-800 bg-[#0e0d0c] overflow-hidden", className)}>
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-stone-800 px-3 py-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key)
                setCopied(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
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
            "flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
            copied
              ? "text-emerald-300"
              : "text-stone-500 hover:text-stone-300"
          )}
          aria-label={`Copy ${activeTab} code`}
        >
          {copied ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto p-4">
        <pre className="font-mono text-[11px] leading-relaxed text-stone-300 whitespace-pre select-all">
          {contents[activeTab]}
        </pre>
      </div>
    </div>
  )
}
