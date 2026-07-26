"use client"

// ─────────────────────────────────────────────────────────────
// Project Audit Panel — Real validation scoring and gates
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import { cn } from "@/lib/utils"

export function ProjectAuditPanel() {
  const { state } = useProjectBrain()
  const { activeProject, validationReport } = state

  if (!activeProject || !validationReport) return null

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600"
    if (score >= 60) return "text-amber-500"
    return "text-red-600"
  }

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Validation & Audit Gates
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Readiness checks computed dynamically from active dossier specifications.
        </p>
      </div>

      {/* Score gauge */}
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded border border-stone-250 bg-stone-50 p-5">
        <div className="flex flex-col items-center justify-center h-20 w-20 rounded-full border border-stone-200 bg-white">
          <span className={cn("font-mono text-2xl font-bold tabular-nums", getScoreColor(validationReport.readinessScore))}>
            {validationReport.readinessScore}
          </span>
          <span className="font-mono text-[8px] text-stone-400 uppercase">Readiness</span>
        </div>

        <div className="space-y-2 flex-1">
          <h3 className="font-mono text-[10.5px] font-bold text-neutral-950 uppercase">
            Validation Gate Status
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className={cn(
              "font-mono text-[9px] uppercase tracking-wide px-2 py-1 rounded border",
              activeProject.publicationGate 
                ? "border-emerald-800/30 bg-emerald-950/15 text-emerald-700 font-bold" 
                : "border-stone-300 bg-stone-100 text-stone-500"
            )}>
              Publication: {activeProject.publicationGate ? "APPROVED" : "HOLD"}
            </span>

            <span className={cn(
              "font-mono text-[9px] uppercase tracking-wide px-2 py-1 rounded border",
              activeProject.submissionGate 
                ? "border-emerald-800/30 bg-emerald-950/15 text-emerald-700 font-bold" 
                : "border-stone-300 bg-stone-100 text-stone-500"
            )}>
              Submission: {activeProject.submissionGate ? "APPROVED" : "HOLD"}
            </span>
          </div>
        </div>
      </div>

      {/* Errors / Blockers (Red limit only) */}
      {validationReport.errors.length > 0 && (
        <div className="rounded border border-red-800/30 bg-red-950/5 p-4 space-y-2">
          <span className="font-mono text-[9px] text-red-700 uppercase block font-bold tracking-wider">
            Critical Build Blockers ({validationReport.errors.length})
          </span>
          <ul className="list-disc pl-4 font-mono text-[10px] text-red-650 space-y-1">
            {validationReport.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings (Amber limit only) */}
      {validationReport.warnings.length > 0 && (
        <div className="rounded border border-amber-800/30 bg-amber-950/5 p-4 space-y-2">
          <span className="font-mono text-[9px] text-amber-700 uppercase block font-bold tracking-wider">
            Active Gaps & Warnings ({validationReport.warnings.length})
          </span>
          <ul className="list-disc pl-4 font-mono text-[10px] text-amber-650 space-y-1">
            {validationReport.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {validationReport.errors.length === 0 && validationReport.warnings.length === 0 && (
        <div className="py-6 text-center text-emerald-700 font-mono text-xs border border-emerald-800/10 rounded bg-emerald-950/5">
          ✓ All audit checkpoints have passed with 100% integrity.
        </div>
      )}
    </div>
  )
}
export default ProjectAuditPanel
