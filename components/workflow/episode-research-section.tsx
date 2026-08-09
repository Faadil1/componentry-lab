"use client"

import { useState } from "react"
import type { CanonicalEpisodeResearch } from "@/lib/persistence/canonical-types"
import { EpisodeResearchDisplay } from "./episode-research-display"
import { EpisodeResearchForm } from "./episode-research-form"

interface EpisodeResearchSectionProps {
  episodeId: string
  research: CanonicalEpisodeResearch | null
}

export function EpisodeResearchSection({ episodeId, research }: EpisodeResearchSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentResearch, setCurrentResearch] = useState(research)

  const handleSave = (updatedResearch: CanonicalEpisodeResearch) => {
    setCurrentResearch(updatedResearch)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <section className="space-y-2">
        <EpisodeResearchForm
          episodeId={episodeId}
          research={currentResearch || null}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg border"
      >
        <div className="text-left">
          <h2 className="font-semibold text-base">Research Packet</h2>
          <p className="text-xs text-gray-500">
            {currentResearch ? `v${currentResearch.researchVersion}` : "No research"}
          </p>
        </div>
        <span className="text-xl">{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="px-4 py-4 border rounded-lg bg-gray-50 space-y-4">
          {currentResearch ? (
            <>
              <EpisodeResearchDisplay research={currentResearch} />
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                Edit Research
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">No research packet yet</p>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                Add Research
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
