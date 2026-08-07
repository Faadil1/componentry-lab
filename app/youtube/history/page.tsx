import Link from "next/link"
import { listPublishedEpisodes } from "@/lib/youtube/get-published-episodes"

export const dynamic = "force-dynamic"

export default async function PublishedArchivePage() {
  const published = await listPublishedEpisodes()

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-neutral-900">
          Published Archive
        </h2>
        <p className="mt-2 text-neutral-600">
          Published Wealth Decoded episodes and production history.
        </p>
      </section>

      {published.length === 0 ? (
        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
          <p className="text-sm font-medium text-neutral-600">
            No published episodes yet.
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Published episodes will appear here once a canonical episode has
            both a YouTube video ID and publication timestamp.
          </p>
        </section>
      ) : (
        <section className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">
                  Episode
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">
                  Source Version
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {published.map((episode) => (
                <tr
                  key={episode.episodeId}
                  className="border-b border-neutral-200 transition hover:bg-neutral-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                    {episode.episodeNumber ? `#${episode.episodeNumber}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {episode.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(episode.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-neutral-600">
                    {episode.stateVersion}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/youtube/episodes/${episode.episodeId}`}
                        className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        View
                      </Link>
                      <a
                        href={`https://www.youtube.com/watch?v=${episode.youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        YouTube ↗
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <div className="flex items-center justify-between">
        <Link
          href="/youtube"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          ← Back to Episodes
        </Link>
      </div>
    </div>
  )
}
