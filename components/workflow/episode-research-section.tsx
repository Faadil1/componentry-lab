"use client"

import { useState } from "react"
import type { CanonicalEpisodeResearch } from "@/lib/persistence/canonical-types"
import { EpisodeResearchDisplay } from "./episode-research-display"

interface EpisodeResearchSectionProps {
  research: CanonicalEpisodeResearch | null
}

export function EpisodeResearchSection({ research }: EpisodeResearchSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg border"
      >
        <div className="text-left">
          <h2 className="font-semibold text-base">Research Packet</h2>
          <p className="text-xs text-gray-500">
            {research ? `v${research.researchVersion}` : "No research"}
          </p>
        </div>
        <span className="text-xl">{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="px-4 py-4 border rounded-lg bg-gray-50">
          <EpisodeResearchDisplay research={research} />
        </div>
      )}
    </section>
  )
}
