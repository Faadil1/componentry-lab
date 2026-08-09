"use client"

import { useState } from "react"
import { setEpisodeResearchAction } from "@/app/youtube/actions"
import type { CanonicalEpisodeResearch, ResearchFinding, ResearchSource, ResearchContradiction } from "@/lib/persistence/canonical-types"

interface EpisodeResearchFormProps {
  episodeId: string
  research: CanonicalEpisodeResearch | null
  onSave?: (research: CanonicalEpisodeResearch) => void
  onCancel?: () => void
}

export function EpisodeResearchForm({ episodeId, research, onSave, onCancel }: EpisodeResearchFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [summary, setSummary] = useState(research?.summary || "")
  const [sources, setSources] = useState<ResearchSource[]>(research?.sources || [])
  const [findings, setFindings] = useState<ResearchFinding[]>(research?.keyFindings || [])
  const [contradictions, setContradictions] = useState<ResearchContradiction[]>(research?.contradictions || [])
  const [openQuestions, setOpenQuestions] = useState<string[]>(research?.openQuestions || [])

  const [editingSourceId, setEditingSourceId] = useState<string | null>(null)
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null)
  const [editingContradictionId, setEditingContradictionId] = useState<string | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await setEpisodeResearchAction(
        episodeId,
        research?.researchVersion ?? null,
        summary,
        findings,
        sources,
        openQuestions,
        contradictions
      )

      if (result.success) {
        onSave?.(result.value as CanonicalEpisodeResearch)
      } else {
        setError(result.message || "Failed to save research")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleAddSource = () => {
    const newId = `src-${Date.now()}`
    setSources([...sources, {
      id: newId,
      title: "",
      url: undefined,
      publisher: undefined,
      author: undefined,
      publishedAt: undefined,
      accessedAt: undefined,
      notes: undefined
    }])
    setEditingSourceId(newId)
  }

  const handleUpdateSource = (id: string, updates: Partial<ResearchSource>) => {
    setSources(sources.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const handleRemoveSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id))
    setFindings(findings.map(f => ({
      ...f,
      sourceIds: f.sourceIds.filter(sid => sid !== id)
    })))
    setContradictions(contradictions.map(c => ({
      ...c,
      sourceIds: c.sourceIds.filter(sid => sid !== id)
    })))
  }

  const handleAddFinding = () => {
    const newId = `find-${Date.now()}`
    setFindings([...findings, {
      id: newId,
      statement: "",
      sourceIds: [],
      notes: undefined
    }])
    setEditingFindingId(newId)
  }

  const handleUpdateFinding = (id: string, updates: Partial<ResearchFinding>) => {
    setFindings(findings.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const handleRemoveFinding = (id: string) => {
    setFindings(findings.filter(f => f.id !== id))
  }

  const handleAddContradiction = () => {
    const newId = `contr-${Date.now()}`
    setContradictions([...contradictions, {
      id: newId,
      description: "",
      sourceIds: []
    }])
    setEditingContradictionId(newId)
  }

  const handleUpdateContradiction = (id: string, updates: Partial<ResearchContradiction>) => {
    setContradictions(contradictions.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const handleRemoveContradiction = (id: string) => {
    setContradictions(contradictions.filter(c => c.id !== id))
  }

  const handleAddQuestion = () => {
    setOpenQuestions([...openQuestions, ""])
  }

  const handleUpdateQuestion = (idx: number, value: string) => {
    const updated = [...openQuestions]
    updated[idx] = value
    setOpenQuestions(updated)
  }

  const handleRemoveQuestion = (idx: number) => {
    setOpenQuestions(openQuestions.filter((_, i) => i !== idx))
  }

  const toggleSourceSelection = (findingId: string, sourceId: string) => {
    setFindings(findings.map(f => {
      if (f.id !== findingId) return f
      const isSelected = f.sourceIds.includes(sourceId)
      return {
        ...f,
        sourceIds: isSelected
          ? f.sourceIds.filter(id => id !== sourceId)
          : [...f.sourceIds, sourceId]
      }
    }))
  }

  const toggleContradictionSourceSelection = (contradictionId: string, sourceId: string) => {
    setContradictions(contradictions.map(c => {
      if (c.id !== contradictionId) return c
      const isSelected = c.sourceIds.includes(sourceId)
      return {
        ...c,
        sourceIds: isSelected
          ? c.sourceIds.filter(id => id !== sourceId)
          : [...c.sourceIds, sourceId]
      }
    }))
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
          rows={3}
        />
      </div>

      {/* Sources */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Sources ({sources.length})</label>
        <div className="mt-2 space-y-3">
          {sources.map((source) => (
            <div key={source.id} className="rounded border border-gray-200 p-3">
              {editingSourceId === source.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={source.title}
                    onChange={(e) => handleUpdateSource(source.id, { title: e.target.value })}
                    placeholder="Title (required)"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <input
                    type="text"
                    value={source.url || ""}
                    onChange={(e) => handleUpdateSource(source.id, { url: e.target.value || undefined })}
                    placeholder="URL"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <input
                    type="text"
                    value={source.publisher || ""}
                    onChange={(e) => handleUpdateSource(source.id, { publisher: e.target.value || undefined })}
                    placeholder="Publisher"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <input
                    type="text"
                    value={source.author || ""}
                    onChange={(e) => handleUpdateSource(source.id, { author: e.target.value || undefined })}
                    placeholder="Author"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <input
                    type="date"
                    value={source.publishedAt || ""}
                    onChange={(e) => handleUpdateSource(source.id, { publishedAt: e.target.value || undefined })}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <input
                    type="date"
                    value={source.accessedAt || ""}
                    onChange={(e) => handleUpdateSource(source.id, { accessedAt: e.target.value || undefined })}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <textarea
                    value={source.notes || ""}
                    onChange={(e) => handleUpdateSource(source.id, { notes: e.target.value || undefined })}
                    placeholder="Notes"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                    rows={2}
                  />
                  <button
                    onClick={() => setEditingSourceId(null)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{source.title || "(untitled)"}</div>
                    {source.url && <div className="text-xs text-blue-600">{source.url}</div>}
                    {source.author && <div className="text-xs text-gray-600">{source.author}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingSourceId(source.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveSource(source.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleAddSource}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Source
        </button>
      </div>

      {/* Findings */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Key Findings ({findings.length})</label>
        <div className="mt-2 space-y-3">
          {findings.map((finding) => (
            <div key={finding.id} className="rounded border border-gray-200 p-3">
              {editingFindingId === finding.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={finding.statement}
                    onChange={(e) => handleUpdateFinding(finding.id, { statement: e.target.value })}
                    placeholder="Statement (required)"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <textarea
                    value={finding.notes || ""}
                    onChange={(e) => handleUpdateFinding(finding.id, { notes: e.target.value || undefined })}
                    placeholder="Notes"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                    rows={2}
                  />
                  <div className="text-sm font-medium text-gray-700">Sources</div>
                  <div className="space-y-1">
                    {sources.map(source => (
                      <label key={source.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={finding.sourceIds.includes(source.id)}
                          onChange={() => toggleSourceSelection(finding.id, source.id)}
                        />
                        <span>{source.title || "(untitled)"}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => setEditingFindingId(null)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{finding.statement || "(empty)"}</div>
                    {finding.sourceIds.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        Sources: {finding.sourceIds.map(id =>
                          sources.find(s => s.id === id)?.title || id
                        ).join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingFindingId(finding.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveFinding(finding.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleAddFinding}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Finding
        </button>
      </div>

      {/* Contradictions */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Contradictions ({contradictions.length})</label>
        <div className="mt-2 space-y-3">
          {contradictions.map((contradiction) => (
            <div key={contradiction.id} className="rounded border border-gray-200 p-3">
              {editingContradictionId === contradiction.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={contradiction.description}
                    onChange={(e) => handleUpdateContradiction(contradiction.id, { description: e.target.value })}
                    placeholder="Description (required)"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <div className="text-sm font-medium text-gray-700">Sources</div>
                  <div className="space-y-1">
                    {sources.map(source => (
                      <label key={source.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={contradiction.sourceIds.includes(source.id)}
                          onChange={() => toggleContradictionSourceSelection(contradiction.id, source.id)}
                        />
                        <span>{source.title || "(untitled)"}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => setEditingContradictionId(null)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{contradiction.description || "(empty)"}</div>
                    {contradiction.sourceIds.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        Sources: {contradiction.sourceIds.map(id =>
                          sources.find(s => s.id === id)?.title || id
                        ).join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingContradictionId(contradiction.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveContradiction(contradiction.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleAddContradiction}
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
                onChange={(e) => handleUpdateQuestion(idx, e.target.value)}
                placeholder="Enter open question"
                className="flex-1 rounded border border-gray-300 p-2 text-sm"
              />
              <button
                onClick={() => handleRemoveQuestion(idx)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddQuestion}
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
          onClick={handleCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
