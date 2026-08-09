import Link from "next/link"
import { listEpisodes } from "@/lib/youtube/get-episode-state"

export const dynamic = "force-dynamic"

export default async function YouTubeOSPage() {
  const episodes = await listEpisodes()

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-neutral-900">
          Episode Operations
        </h2>
        <p className="mt-2 text-neutral-600">
          Workflow state visibility for Wealth Decoded episodes.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            Available episodes
          </h3>
          <div className="flex gap-2">
            <Link
              href="/youtube/intake"
              className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              + New Episode
            </Link>
            <Link
              href="/youtube/history"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Published Archive →
            </Link>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {episodes.map((episode) => (
            <Link
              key={episode.id}
              href={`/youtube/episodes/${episode.id}`}
              className="group rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {episode.episodeNumber && (
                    <p className="text-sm font-medium text-neutral-500">
                      Episode {episode.episodeNumber}
                    </p>
                  )}
                  <h4 className="font-semibold text-neutral-900 group-hover:text-neutral-700">
                    {episode.title}
                  </h4>
                </div>
                <span className="ml-2 text-neutral-400 transition group-hover:text-neutral-600">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {process.env.YOUTUBE_EPISODE_SOURCE === "fixture" && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            <strong>Development notice:</strong> This is a fixture-backed
            development surface. Future versions will connect to the canonical
            YouTube Operating System state source.
          </p>
        </section>
      )}
    </div>
  )
}
