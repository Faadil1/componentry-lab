import type { CanonicalEpisodeBrief } from "@/lib/persistence/canonical-types"

interface EpisodeBriefDisplayProps {
  brief: CanonicalEpisodeBrief
  onEdit: () => void
}

export function EpisodeBriefDisplay({ brief, onEdit }: EpisodeBriefDisplayProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">Editorial Brief</h3>
        <button
          onClick={onEdit}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Edit
        </button>
      </div>

      <dl className="space-y-4 text-sm">
        {brief.topic && (
          <div>
            <dt className="font-medium text-neutral-700">Topic</dt>
            <dd className="mt-1 text-neutral-600">{brief.topic}</dd>
          </div>
        )}

        {brief.angle && (
          <div>
            <dt className="font-medium text-neutral-700">Angle</dt>
            <dd className="mt-1 text-neutral-600">{brief.angle}</dd>
          </div>
        )}

        {brief.audience && (
          <div>
            <dt className="font-medium text-neutral-700">Audience</dt>
            <dd className="mt-1 text-neutral-600">{brief.audience}</dd>
          </div>
        )}

        {brief.coreQuestion && (
          <div>
            <dt className="font-medium text-neutral-700">Core Question</dt>
            <dd className="mt-1 whitespace-pre-wrap text-neutral-600">
              {brief.coreQuestion}
            </dd>
          </div>
        )}

        {brief.hook && (
          <div>
            <dt className="font-medium text-neutral-700">Hook</dt>
            <dd className="mt-1 whitespace-pre-wrap text-neutral-600">{brief.hook}</dd>
          </div>
        )}

        {brief.thesis && (
          <div>
            <dt className="font-medium text-neutral-700">Thesis</dt>
            <dd className="mt-1 whitespace-pre-wrap text-neutral-600">{brief.thesis}</dd>
          </div>
        )}

        {brief.researchQuestions && brief.researchQuestions.length > 0 && (
          <div>
            <dt className="font-medium text-neutral-700">Research Questions</dt>
            <dd className="mt-1">
              <ul className="space-y-1 text-neutral-600">
                {brief.researchQuestions.map((q, i) => (
                  <li key={i} className="flex gap-2">
                    <span>-</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {brief.editorialNotes && (
          <div>
            <dt className="font-medium text-neutral-700">Editorial Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-neutral-600">
              {brief.editorialNotes}
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
