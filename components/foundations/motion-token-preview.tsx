"use client"

import * as React from "react"
import type { MotionDurationToken, MotionEasingToken } from "@/lib/foundations/types"

export function MotionTokenPreview({ durations, easings }: { durations: MotionDurationToken[]; easings: MotionEasingToken[] }) {
  const [playTransition, setPlayTransition] = React.useState(false)

  const triggerTransition = () => {
    setPlayTransition(true)
    setTimeout(() => setPlayTransition(false), 800)
  }

  // Visual SVG paths for easing curves
  const curves: Record<string, string> = {
    "easing-standard": "M 0,100 C 30,100 20,0 100,0",
    "easing-decelerate": "M 0,100 C 0,100 0,0 100,0",
    "easing-accelerate": "M 0,100 C 30,100 100,100 100,0",
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Duration Tokens */}
      <div className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 shadow-xs space-y-6">
        <div className="border-b border-stone-200 pb-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Duration Tokens</span>
        </div>
        <div className="divide-y divide-stone-200">
          {durations.map((token) => (
            <div key={token.role} className="py-4 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-900">{token.role}</span>
                <code className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">{token.value}</code>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">{token.usage}</p>
              <div className="font-mono text-[9px] text-stone-500">
                LIMITS: {token.limitations.join(" ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Easing Curves & Sandbox Demo */}
      <div className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 shadow-xs space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Easing Tokens &amp; Curve Diagram</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {easings.map((token) => {
              const curvePath = curves[token.role] || "M 0,100 L 100,0"
              return (
                 <div key={token.role} className="rounded-lg border border-stone-200 bg-stone-100/50 p-4 space-y-3">
                  <span className="font-mono text-[9px] font-bold text-neutral-600 block">{token.role.replace("easing-", "")}</span>

                  {/* SVG Easing curve graph */}
                  <svg className="w-full h-16 border border-stone-200 bg-[#fbfaf6] rounded" viewBox="0 0 100 100">
                    <path d={curvePath} fill="none" stroke="#0f766e" strokeWidth="3" />
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="2 2" />
                  </svg>

                  <span className="font-mono text-[9px] text-neutral-500 block truncate" title={token.value}>
                    {token.value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Easing sandbox interactive preview */}
        <div className="rounded-lg border border-stone-300 bg-[#eae6db] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              Motion Transition Sandbox
            </span>
            <button
              type="button"
              onClick={triggerTransition}
              className="rounded bg-stone-900 text-stone-100 hover:bg-neutral-900 px-3 py-1.5 font-mono text-[10px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Trigger Easing Test
            </button>
          </div>

          {/* Sandbox arena */}
          <div className="h-12 w-full bg-[#fbfaf6] rounded border border-stone-250 relative overflow-hidden flex items-center px-4">
            <div
              className={`h-4 w-4 rounded-full bg-cyan-700 transition-all duration-300`}
              style={{
                transform: playTransition ? "translateX(calc(100% + 220px))" : "translateX(0px)",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span>Easing Interpolation</span>
          <span className="text-cyan-700 font-bold">DETERMINISTIC CURVES</span>
        </div>
      </div>
    </div>
  )
}
