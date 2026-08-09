"use client"

import { useState } from "react"
import type { CanonicalEpisodeBrief } from "@/lib/persistence/canonical-types"
import { setEpisodeBriefAction } from "@/app/youtube/actions"

interface EpisodeBriefFormProps {
  episodeId: string
  brief?: CanonicalEpisodeBrief
  onSuccess: (updatedBrief: CanonicalEpisodeBrief) => void
  onCancel: () => void
}

export function EpisodeBriefForm({
  episodeId,
  brief,
  onSuccess,
  onCancel,
}: EpisodeBriefFormProps) {
  const isCreating = !brief
  const [topic, setTopic] = useState(brief?.topic || "")
  const [angle, setAngle] = useState(brief?.angle || "")
  const [audience, setAudience] = useState(brief?.audience || "")
  const [coreQuestion, setCoreQuestion] = useState(brief?.coreQuestion || "")
  const [hook, setHook] = useState(brief?.hook || "")
  const [thesis, setThesis] = useState(brief?.thesis || "")
  const [editorialNotes, setEditorialNotes] = useState(brief?.editorialNotes || "")
  const [researchQuestions, setResearchQuestions] = useState(
    brief?.researchQuestions?.join("\n") || ""
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Parse research questions (one per line)
      const questions = researchQuestions
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q.length > 0)

      const result = await setEpisodeBriefAction(
        episodeId,
        isCreating ? null : brief!.briefVersion,
        topic || undefined,
        angle || undefined,
        audience || undefined,
        coreQuestion || undefined,
        hook || undefined,
        thesis || undefined,
        editorialNotes || undefined,
        questions.length > 0 ? questions : undefined
      )

      if (!result.success) {
        if (result.reason === "conflict") {
          setError("Brief was modified elsewhere. Please reload and try again.")
        } else {
          setError(result.message || "Failed to save brief")
        }
        return
      }

      if (result.value) {
        onSuccess(result.value)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-neutral-700">
          Topic <span className="text-red-500">*</span>
        </label>
        <input
          id="topic"
          type="text"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What is the video about?"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="angle" className="block text-sm font-medium text-neutral-700">
          Angle
        </label>
        <input
          id="angle"
          type="text"
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          placeholder="How are we approaching this topic?"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="audience" className="block text-sm font-medium text-neutral-700">
          Audience
        </label>
        <input
          id="audience"
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Who is this for?"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="coreQuestion" className="block text-sm font-medium text-neutral-700">
          Core Question
        </label>
        <textarea
          id="coreQuestion"
          value={coreQuestion}
          onChange={(e) => setCoreQuestion(e.target.value)}
          placeholder="What is the central question?"
          rows={2}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="hook" className="block text-sm font-medium text-neutral-700">
          Hook
        </label>
        <textarea
          id="hook"
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          placeholder="Opening moment / attention grab"
          rows={2}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="thesis" className="block text-sm font-medium text-neutral-700">
          Thesis
        </label>
        <textarea
          id="thesis"
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder="What claim/insight are we making?"
          rows={2}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="researchQuestions"
          className="block text-sm font-medium text-neutral-700"
        >
          Research Questions
        </label>
        <textarea
          id="researchQuestions"
          value={researchQuestions}
          onChange={(e) => setResearchQuestions(e.target.value)}
          placeholder="One question per line"
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="editorialNotes" className="block text-sm font-medium text-neutral-700">
          Editorial Notes
        </label>
        <textarea
          id="editorialNotes"
          value={editorialNotes}
          onChange={(e) => setEditorialNotes(e.target.value)}
          placeholder="Supplementary context, decisions, flags"
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:bg-neutral-300"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
