"use client"

import type { CanonicalEpisodeResearch } from "@/lib/persistence/canonical-types"

interface EpisodeResearchDisplayProps {
  research: CanonicalEpisodeResearch | null
}

export function EpisodeResearchDisplay({ research }: EpisodeResearchDisplayProps) {
  if (!research) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
        <p>No research packet yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {research.summary && (
        <div>
          <h3 className="font-semibold text-sm text-gray-600">Summary</h3>
          <p className="mt-1 text-sm">{research.summary}</p>
        </div>
      )}

      {research.keyFindings.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-600">Key Findings ({research.keyFindings.length})</h3>
          <ul className="mt-2 space-y-2">
            {research.keyFindings.map((finding) => (
              <li key={finding.id} className="flex gap-2 text-sm">
                <span className="text-gray-400">•</span>
                <span>{finding.statement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {research.sources.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-600">Sources ({research.sources.length})</h3>
          <ul className="mt-2 space-y-2">
            {research.sources.map((source) => (
              <li key={source.id} className="text-sm">
                <div className="font-medium">{source.title}</div>
                {source.url && <div className="text-xs text-blue-600">{source.url}</div>}
                {source.author && <div className="text-xs text-gray-600">by {source.author}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {research.openQuestions.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-600">Open Questions ({research.openQuestions.length})</h3>
          <ul className="mt-2 space-y-1">
            {research.openQuestions.map((question, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="text-gray-400">?</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {research.contradictions.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-600">Contradictions ({research.contradictions.length})</h3>
          <ul className="mt-2 space-y-2">
            {research.contradictions.map((contradiction) => (
              <li key={contradiction.id} className="flex gap-2 text-sm">
                <span className="text-gray-400">⚠</span>
                <span>{contradiction.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-xs text-gray-500 pt-2 border-t">
        <p>v{research.researchVersion} • Updated {new Date(research.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
