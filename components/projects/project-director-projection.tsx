"use client"

import { useMemo } from "react"
import { useProjectBrain } from "./project-provider"
import {
  adaptProjectBrainToDirectorInput,
  adaptDirectorResult,
  getModeVisualTheme,
  getAuthorityLevelConfig,
  mapProjectKindToCreativeMode
} from "@/lib/director"
import { cn } from "@/lib/utils"
import type { ProjectPhase } from "@/lib/projects"

export function ProjectDirectorProjection() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  const projection = useMemo(() => {
    if (!activeProject) return null

    const mode = mapProjectKindToCreativeMode(activeProject.kind)
    const phaseContext = (activeProject.currentPhase || "intake") as ProjectPhase
    const input = adaptProjectBrainToDirectorInput(
      activeProject,
      mode,
      phaseContext,
      {
        authorityLevel: "suggest",
        requestedAction: "",
        target: activeProject.id,
        reversibility: "unknown",
        risk: "low",
        approvalRequirement: "none",
        grantedScope: [],
        status: "pending",
      }
    )

    const result = adaptDirectorResult({
      ...input,
      availableSkills: [],
      lockedDecisions: input.lockedDecisions,
      learningProposals: input.learningProposals,
    })

    return { input, result }
  }, [activeProject])

  if (!projection) return null

  const { result } = projection
  const modeTheme = getModeVisualTheme(result.mode)
  const actionAuthorityConfig = getAuthorityLevelConfig(result.nextAction.authorityRequirement)

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border-2 bg-white shadow-sm mb-6", modeTheme.borderAccent)}>
      {/* Top Banner */}
      <div className={cn("px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200", modeTheme.gradientHeader)}>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-neutral-950 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-white">
            CREATIVE DIRECTOR
          </span>
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase", modeTheme.badgeBg, modeTheme.badgeText)}>
            {modeTheme.label}
          </span>
          <span className="inline-flex items-center rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[9px] font-mono font-medium text-stone-600">
            Director Stage: {result.resolvedPhase}
          </span>
        </div>
        <div className="text-[10px] font-mono text-stone-500 uppercase">
          Read-Only Projection
        </div>
      </div>

      <div className="p-4 sm:p-5 grid gap-5 lg:grid-cols-2">
        {/* Left: Hero Demo Moment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500">
              Hero Demo Moment
            </h3>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold uppercase",
              result.heroDemoMoment.readinessStatus === "ready" ? "bg-emerald-100 text-emerald-900 border border-emerald-300" :
              result.heroDemoMoment.readinessStatus === "blocked" ? "bg-red-100 text-red-900 border border-red-300" :
              "bg-amber-100 text-amber-900 border border-amber-300"
            )}>
              {result.heroDemoMoment.readinessStatus}
            </span>
          </div>
          
          <div>
            <h4 className="text-lg font-bold tracking-tight text-neutral-950">
              {result.heroDemoMoment.title}
            </h4>
            <div className="mt-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs font-medium text-stone-900 leading-normal">
              <span className="font-mono font-bold uppercase tracking-wider text-[9px] text-stone-500 block mb-1">
                Visible Proof & Transformation
              </span>
              {result.heroDemoMoment.visibleTransformationOrProof}
            </div>
          </div>
        </div>

        {/* Right: Next Authorized Action */}
        <div className="rounded-xl border border-neutral-900 bg-neutral-950 text-white p-4 shadow-md space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
              NEXT AUTHORIZED ACTION
            </span>
            <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold border", actionAuthorityConfig.badgeClass)}>
              Authority: {actionAuthorityConfig.label}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-white leading-tight">
              {result.nextAction.title}
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {result.nextAction.rationale}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
