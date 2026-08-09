"use client"

import { useState } from "react"
import type { CanonicalEpisodeBrief } from "@/lib/persistence/canonical-types"
import { EpisodeBriefDisplay } from "./episode-brief-display"
import { EpisodeBriefForm } from "./episode-brief-form"

interface EpisodeBriefSectionProps {
  episodeId: string
  brief?: CanonicalEpisodeBrief
  onBriefUpdated?: () => void
}

export function EpisodeBriefSection({
  episodeId,
  brief: initialBrief,
  onBriefUpdated,
}: EpisodeBriefSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [brief, setBrief] = useState(initialBrief)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSuccess = (updatedBrief: CanonicalEpisodeBrief) => {
    setBrief(updatedBrief)
    setIsEditing(false)
    onBriefUpdated?.()
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h3 className="mb-6 font-semibold text-neutral-900">
          {brief ? "Edit Editorial Brief" : "Add Editorial Brief"}
        </h3>
        <EpisodeBriefForm
          episodeId={episodeId}
          brief={brief}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </section>
    )
  }

  if (brief) {
    return <EpisodeBriefDisplay brief={brief} onEdit={handleEdit} />
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">Editorial Brief</h3>
      </div>
      <p className="mb-4 text-sm text-neutral-600">
        No editorial brief created yet.
      </p>
      <button
        onClick={handleEdit}
        className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
      >
        Add Editorial Brief
      </button>
    </section>
  )
}
