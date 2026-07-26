"use client"

// ─────────────────────────────────────────────────────────────
// Project Section Navigation — Sidebar tab controls
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"
import { WORKSPACE_SECTIONS } from "@/lib/projects/schema"
import { cn } from "@/lib/utils"

export function ProjectSectionNav() {
  const { state, actions } = useProjectBrain()
  const { activeSection } = state

  // Hotkey mapping labels
  const getHotkeyLabel = (idx: number) => {
    if (idx < 9) return String(idx + 1)
    if (idx === 9) return "0"
    return null
  }

  return (
    <nav className="flex flex-col gap-2 text-left" aria-label="Dossier section navigation">
      <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
        Sections dossier
      </span>
      <div className="flex flex-col gap-0.5">
        {WORKSPACE_SECTIONS.map((section, idx) => {
          const isActive = section.id === activeSection
          const keyLabel = getHotkeyLabel(idx)

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => actions.setSection(section.id)}
              className={cn(
                "flex items-center justify-between rounded px-3 py-2 font-mono text-[11px] uppercase tracking-wide transition text-left",
                isActive
                  ? "bg-stone-100 font-semibold text-neutral-950 border-l-2 border-neutral-950 pl-2.5"
                  : "text-stone-600 hover:bg-stone-50 hover:text-neutral-950"
              )}
            >
              <span>{section.label}</span>
              {keyLabel && (
                <kbd className="hidden sm:inline-block border border-stone-250 bg-white px-1.5 py-px text-[9px] text-stone-400 font-bold rounded-sm">
                  {keyLabel}
                </kbd>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
export default ProjectSectionNav
