"use client"

// ─────────────────────────────────────────────────────────────
// Project Recommendations Section — Exposing pure-context logic
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function ProjectRecommendations() {
  const { state, actions } = useProjectBrain()
  const { recommendations, selectedRecommendationId } = state

  if (recommendations.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No context-based recommendations available. Add decisions or goals.
      </div>
    )
  }

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case "strong-match":
        return "border-emerald-800/30 bg-emerald-950/10 text-emerald-700 font-bold"
      case "useful-match":
        return "border-cyan-800/30 bg-cyan-950/10 text-cyan-700"
      default:
        return "border-stone-300 bg-stone-100 text-stone-500"
    }
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Smart Recommendations
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Deterministically resolved from the current active project context details.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {recommendations.map((rec) => {
          const isSelected = selectedRecommendationId === rec.id
          
          // Build appropriate links for items
          const linkPath = 
            rec.targetType === "playbook" 
              ? `/playbooks/${rec.targetId.replace("-system", "/07-typography-system")}` // fallback stub
              : rec.targetType === "registry"
              ? `/library?id=${rec.targetId}`
              : null

          return (
            <div
              key={rec.id}
              onClick={() => actions.selectRecommendation(isSelected ? null : rec.id)}
              className={cn(
                "rounded border p-4 space-y-3 cursor-pointer transition text-left",
                isSelected ? "border-neutral-950 bg-stone-50/50" : "border-stone-200 bg-white hover:border-stone-400"
              )}
            >
              {/* Header info */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-[8px] text-stone-400 uppercase block">
                    Target: {rec.targetType} · {rec.targetId}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-neutral-950 uppercase">
                    {rec.targetId.replace(/-/g, " ")}
                  </span>
                </div>
                <span className={cn(
                  "font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border",
                  getConfidenceColor(rec.confidence)
                )}>
                  {rec.confidence}
                </span>
              </div>

              {/* Reasons */}
              <div className="space-y-1.5">
                <span className="font-mono text-[8px] text-stone-400 uppercase block font-semibold">
                  Why this is recommended:
                </span>
                <ul className="list-disc pl-3 font-mono text-[10.5px] text-stone-600 space-y-1">
                  {rec.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Extra details when selected */}
              {isSelected && (
                <div className="border-t border-stone-200 pt-3 space-y-3 animate-fade-in">
                  {rec.matchedCriteria.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] text-stone-400 uppercase block font-semibold">
                        Matched Criteria
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {rec.matchedCriteria.map((c) => (
                          <span key={c} className="rounded-sm bg-stone-100 border border-stone-200 px-1.5 py-0.5 font-mono text-[9px] text-stone-500">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.limitations.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] text-amber-600 uppercase block font-semibold">
                        Limitations / Context warnings
                      </span>
                      <p className="font-mono text-[10px] text-amber-700 italic leading-relaxed">
                        {rec.limitations.join(" ")}
                      </p>
                    </div>
                  )}

                  {linkPath && (
                    <Link
                      href={linkPath}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex h-6 items-center gap-1 rounded border border-neutral-950 bg-neutral-950 px-2 font-mono text-[9px] text-white transition hover:bg-neutral-800"
                    >
                      Open Target View →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default ProjectRecommendations
