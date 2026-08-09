import Link from "next/link"
import { notFound } from "next/navigation"
import { EpisodeStateCard } from "@/components/workflow/episode-state-card"
import { EpisodeHistoryTimeline } from "@/components/workflow/episode-history-timeline"
import { EpisodeControls } from "@/components/workflow/episode-controls"
import { EpisodeBriefSection } from "@/components/workflow/episode-brief-section"
import { EpisodeResearchSection } from "@/components/workflow/episode-research-section"
import {
  episodeStateSnapshotToCardProps,
} from "@/lib/adapters/episode-state-card-adapter"
import type { EpisodeStateCardProps } from "@/components/workflow/episode-state-card"
import { getEpisodeState } from "@/lib/youtube/get-episode-state"
import { getEpisodeHistory } from "@/lib/youtube/get-episode-history"
import { getEpisodeBrief } from "@/lib/youtube/get-episode-brief"
import { getEpisodeResearch } from "@/lib/youtube/get-episode-research"

interface PageProps {
  params: Promise<{ episodeId: string }>
}

export default async function EpisodeDetailPage({ params }: PageProps) {
  const { episodeId } = await params
  const snapshot = await getEpisodeState(episodeId)

  if (!snapshot) {
    notFound()
  }

  const cardProps: EpisodeStateCardProps =
    episodeStateSnapshotToCardProps(snapshot)

  const history = await getEpisodeHistory(episodeId)
  const brief = await getEpisodeBrief(episodeId)
  const research = await getEpisodeResearch(episodeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {cardProps.variant !== "unavailable" && (
            <>
              {cardProps.episodeNumber && (
                <p className="text-sm font-medium text-neutral-500">
                  Episode {cardProps.episodeNumber}
                </p>
              )}
              {cardProps.channelName && (
                <p className="mt-1 text-lg text-neutral-600">
                  {cardProps.channelName}
                </p>
              )}
            </>
          )}
        </div>
        <Link
          href="/youtube"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          ← Back
        </Link>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-8">
        <div className="flex justify-center">
          <EpisodeStateCard {...cardProps} className="shadow-sm" />
        </div>
      </section>

      {cardProps.variant !== "unavailable" && "workflowState" in cardProps && (
        <EpisodeControls episode={snapshot} />
      )}

      {cardProps.variant !== "unavailable" && "workflowState" in cardProps && (
        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="font-semibold text-neutral-900">Operational context</h3>
          <dl className="mt-4 space-y-3 text-sm">
            {cardProps.workflowState && (
              <div>
                <dt className="font-medium text-neutral-700">
                  Workflow state
                </dt>
                <dd className="mt-1 font-mono text-neutral-600">
                  {cardProps.workflowStateLabel || cardProps.workflowState}
                </dd>
              </div>
            )}
            {cardProps.nextAuthorizedAction && (
              <div>
                <dt className="font-medium text-neutral-700">
                  Next action
                </dt>
                <dd className="mt-1 text-neutral-600">
                  {cardProps.nextAuthorizedAction}
                </dd>
              </div>
            )}
            {cardProps.manifestVersion && (
              <div>
                <dt className="font-medium text-neutral-700">
                  Source version
                </dt>
                <dd className="mt-1 font-mono text-neutral-600">
                  {cardProps.manifestVersion}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {cardProps.variant !== "unavailable" && "workflowState" in cardProps && (
        <EpisodeBriefSection episodeId={episodeId} brief={brief || undefined} />
      )}

      {cardProps.variant !== "unavailable" && "workflowState" in cardProps && (
        <EpisodeResearchSection research={research} />
      )}

      <EpisodeHistoryTimeline history={history} />

      {process.env.YOUTUBE_EPISODE_SOURCE === "fixture" && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            <strong>Development notice:</strong> Episode state is fixture-backed.
            Adapter and component are production-ready; state source is development-only.
          </p>
        </section>
      )}
    </div>
  )
}
