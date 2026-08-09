"use client"

import { useState } from "react"
import { setEpisodeResearchAction } from "@/app/youtube/actions"
import type { CanonicalEpisodeResearch, ResearchFinding, ResearchSource, ResearchContradiction } from "@/lib/persistence/canonical-types"

interface EpisodeResearchFormProps {
  episodeId: string
  research: CanonicalEpisodeResearch | null
  onSave?: (research: CanonicalEpisodeResearch) => void
}

export function EpisodeResearchForm({ episodeId, research, onSave }: EpisodeResearchFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [summary, setSummary] = useState(research?.summary || "")
  const [sources, setSources] = useState<ResearchSource[]>(research?.sources || [])
  const [findings, setFindings] = useState<ResearchFinding[]>(research?.keyFindings || [])
  const [contradictions, setContradictions] = useState<ResearchContradiction[]>(research?.contradictions || [])
  const [openQuestions, setOpenQuestions] = useState<string[]>(research?.openQuestions || [])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await setEpisodeResearchAction(
        episodeId,
        research?.researchVersion ?? null,
        summary || undefined,
        findings.length > 0 ? findings : undefined,
        sources.length > 0 ? sources : undefined,
        openQuestions.length > 0 ? openQuestions : undefined,
        contradictions.length > 0 ? contradictions : undefined
      )

      if (result.success) {
        onSave?.(result.value as CanonicalEpisodeResearch)
        setIsEditing(false)
      } else {
        setError(result.message || "Failed to save research")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
      >
        {research ? "Edit Research" : "Add Research"}
      </button>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-300 bg-white p-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Summary */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Research Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Enter research summary"
          className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
          rows={2}
        />
      </div>

      {/* Sources */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Sources ({sources.length})</label>
        <div className="mt-2 space-y-2">
          {sources.map((source) => (
            <div key={source.id} className="flex items-center gap-2 rounded border border-gray-200 p-2">
              <div className="flex-1">
                <div className="text-sm font-medium">{source.title}</div>
                {source.url && <div className="text-xs text-blue-600">{source.url}</div>}
                {source.author && <div className="text-xs text-gray-600">{source.author}</div>}
              </div>
              <button
                onClick={() => setSources(sources.filter((s) => s.id !== source.id))}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const newId = `src-${Date.now()}`
            setSources([...sources, { id: newId, title: "" }])
          }}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Source
        </button>
      </div>

      {/* Findings */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Key Findings ({findings.length})</label>
        <div className="mt-2 space-y-2">
          {findings.map((finding) => (
            <div key={finding.id} className="rounded border border-gray-200 p-2">
              <div className="text-sm font-medium">{finding.statement}</div>
              {finding.sourceIds.length > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  Sources: {finding.sourceIds.join(", ")}
                </div>
              )}
              <button
                onClick={() => setFindings(findings.filter((f) => f.id !== finding.id))}
                className="mt-1 text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const newId = `find-${Date.now()}`
            setFindings([...findings, { id: newId, statement: "", sourceIds: [] }])
          }}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Finding
        </button>
      </div>

      {/* Contradictions */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Contradictions ({contradictions.length})</label>
        <div className="mt-2 space-y-2">
          {contradictions.map((contradiction) => (
            <div key={contradiction.id} className="rounded border border-gray-200 p-2">
              <div className="text-sm font-medium">{contradiction.description}</div>
              {contradiction.sourceIds.length > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  Sources: {contradiction.sourceIds.join(", ")}
                </div>
              )}
              <button
                onClick={() => setContradictions(contradictions.filter((c) => c.id !== contradiction.id))}
                className="mt-1 text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const newId = `contr-${Date.now()}`
            setContradictions([...contradictions, { id: newId, description: "", sourceIds: [] }])
          }}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Contradiction
        </button>
      </div>

      {/* Open Questions */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Open Questions ({openQuestions.length})</label>
        <div className="mt-2 space-y-2">
          {openQuestions.map((question, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => {
                  const updated = [...openQuestions]
                  updated[idx] = e.target.value
                  setOpenQuestions(updated)
                }}
                placeholder="Enter open question"
                className="flex-1 rounded border border-gray-300 p-2 text-sm"
              />
              <button
                onClick={() => setOpenQuestions(openQuestions.filter((_, i) => i !== idx))}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setOpenQuestions([...openQuestions, ""])}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Question
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
