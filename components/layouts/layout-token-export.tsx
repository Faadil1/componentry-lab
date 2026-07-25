"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

export function LayoutTokenExport({ css, ts }: { css: string; ts: string }) {
  const [tab, setTab] = React.useState<"ts" | "css">("ts")
  const [copied, setCopied] = React.useState(false)
  const value = tab === "ts" ? ts : css

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="rounded-xl border border-stone-850 bg-[#0e0d0c] p-6 text-stone-100 md:p-8 space-y-6">
      <div className="space-y-2 border-b border-stone-800 pb-4">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Layout Token Export</p>
        <h2 className="text-2xl font-bold text-white">Exported layout properties for immediate product usage.</h2>
        <p className="max-w-2xl text-xs leading-relaxed text-stone-400 font-sans">
          The layout tokens expose spatial container widths, column presets, gutters, and alignment rules.
        </p>
      </div>

      {/* Tab controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161513] p-1.5 rounded-lg border border-stone-800">
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-pressed={tab === "ts"}
            onClick={() => setTab("ts")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
              tab === "ts" ? "bg-stone-800 text-cyan-300" : "text-stone-400 hover:text-stone-100"
            }`}
          >
            typescript-tokens.ts
          </button>
          <button
            type="button"
            aria-pressed={tab === "css"}
            onClick={() => setTab("css")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
              tab === "css" ? "bg-stone-800 text-cyan-300" : "text-stone-400 hover:text-stone-100"
            }`}
          >
            layouts.css
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded bg-stone-800 border border-stone-700 hover:bg-stone-700 px-3 py-1.5 text-xs font-mono font-bold text-stone-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Code container */}
      <div className="relative">
        <pre className="max-h-[380px] overflow-auto rounded-lg border border-stone-850 bg-[#0a0a09] p-5 text-xs font-mono leading-relaxed text-[#c1bcae] select-text">
          {value}
        </pre>
      </div>
    </section>
  )
}
