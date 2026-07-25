"use client"

import * as React from "react"
import { useCaptureBridge } from "./capture-provider"
import { buildCaptureUrl } from "@/lib/capture/serializer"
import { cn } from "@/lib/utils"

export interface CaptureUrlPanelProps {
  className?: string
}

export function CaptureUrlPanel({ className }: CaptureUrlPanelProps) {
  const { state, actions } = useCaptureBridge()
  const { snapshot, cleanView } = state
  const [copied, setCopied] = React.useState(false)

  const restoreUrl = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return buildCaptureUrl(window.location.href, snapshot)
    }
    return ""
  }, [snapshot])

  const handleCopy = async () => {
    await actions.copyRestoreUrl()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (cleanView) return null

  return (
    <div className={cn("rounded-lg border border-stone-850 bg-[#0e0d0c] p-4 space-y-3", className)}>
      <div className="flex justify-between items-center border-b border-stone-900 pb-1.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Shareable Restore URL
        </span>
        <span className="font-mono text-[8px] text-stone-600">URL state synchronization</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={restoreUrl}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="flex-1 rounded bg-stone-900 border border-stone-850 text-stone-300 font-mono text-[10px] px-2.5 py-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
          aria-label="Shareable restore URL"
        />
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "px-3 py-1.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 shrink-0",
            copied
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
              : "border-stone-800 text-stone-400 hover:text-stone-200"
          )}
        >
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
      <p className="text-[10px] text-stone-500 font-mono">
        This URL encodes scene, state frame index, viewport size, chrome variables, and panel visibilities.
      </p>
    </div>
  )
}
export default CaptureUrlPanel
