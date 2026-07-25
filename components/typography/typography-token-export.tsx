"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { typographyTokens, typographyTokensCss } from "@/lib/typography/tokens"

export function TypographyTokenExport() {
  const [activeTab, setActiveTab] = React.useState<"ts" | "css">("ts")
  const [copied, setCopied] = React.useState(false)

  const codeContent = activeTab === "ts"
    ? JSON.stringify(typographyTokens, null, 2)
    : typographyTokensCss.trim()

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="rounded-xl border border-stone-800 bg-[#0e0d0c] p-6 text-stone-100 md:p-8 space-y-6">
      <div className="space-y-2 border-b border-stone-800 pb-4">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Token Export</p>
        <h2 className="text-2xl font-bold text-white">CSS and TypeScript outputs stay in sync.</h2>
        <p className="max-w-2xl text-xs leading-relaxed text-stone-400 font-sans">
          The foundation exposes reusable semantic tokens for scale, line heights, tracking, paragraph measures and fallback stacks.
        </p>
      </div>

      {/* Tabs and Copy Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161513] p-1.5 rounded-lg border border-stone-800">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("ts")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
              activeTab === "ts" ? "bg-stone-800 text-cyan-300" : "text-stone-400 hover:text-stone-100"
            }`}
          >
            typescript-tokens.json
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("css")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
              activeTab === "css" ? "bg-stone-800 text-cyan-300" : "text-stone-400 hover:text-stone-100"
            }`}
          >
            typography-tokens.css
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

      {/* Scrollable code block */}
      <div className="relative">
        <pre className="max-h-[380px] overflow-auto rounded-lg border border-stone-800 bg-[#0a0a09] p-5 text-xs font-mono leading-relaxed text-[#c1bcae] select-text">
          {codeContent}
        </pre>
      </div>
    </section>
  )
}
