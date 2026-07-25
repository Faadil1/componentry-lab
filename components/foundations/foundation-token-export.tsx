import * as React from "react"
import { Check, Copy } from "lucide-react"

export function FoundationTokenExport({ css, ts }: { css: string; ts: string }) {
  const [tab, setTab] = React.useState<"ts" | "css">("ts")
  const [copied, setCopied] = React.useState(false)
  const value = tab === "ts" ? ts : css

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="rounded-2xl border border-stone-900 bg-[#121110] p-6 text-stone-100 md:p-8 space-y-6">
      <div className="space-y-2 border-b border-stone-800 pb-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Export</p>
        <h2 className="text-2xl font-semibold text-white">CSS custom properties and TypeScript stay in sync.</h2>
        <p className="max-w-2xl text-sm leading-6 text-stone-300">The export is intentionally plain text so the content remains selectable, copyable, and readable in tight viewports.</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-800 bg-[#161513] p-1.5">
        <div className="flex gap-1.5">
          <button type="button" aria-pressed={tab === "ts"} onClick={() => setTab("ts")} className={`rounded px-3 py-1.5 text-xs font-mono font-semibold ${tab === "ts" ? "bg-stone-800 text-cyan-300" : "text-stone-400 hover:text-stone-100"}`}>typescript-tokens.ts</button>
          <button type="button" aria-pressed={tab === "css"} onClick={() => setTab("css")} className={`rounded px-3 py-1.5 text-xs font-mono font-semibold ${tab === "css" ? "bg-stone-800 text-cyan-300" : "text-stone-400 hover:text-stone-100"}`}>foundations.css</button>
        </div>
        <button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 rounded border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-mono font-semibold text-stone-200 hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy Code</>}
        </button>
      </div>
      <div className="relative">
        <pre className="max-h-[420px] overflow-auto rounded-xl border border-stone-800 bg-[#0a0a09] p-5 text-xs font-mono leading-relaxed text-[#c1bcae] select-text">{value}</pre>
      </div>
    </section>
  )
}
