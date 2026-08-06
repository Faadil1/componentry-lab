"use client"

import { useState } from "react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { EpisodeStateCard } from "@/components/workflow/episode-state-card"
import type { EpisodeStateCardProps } from "@/components/workflow/episode-state-card"
import { episode14EditorialDevelopment, episode14Blocked, episode13HumanReview, episode13Approved, episode13Published, episodeUnavailable } from "@/lib/fixtures/episode-state-card-fixtures"
import { ChevronDown, Copy, Check } from "lucide-react"

export default function Page() {
  const [variant, setVariant] = useState<"default" | "blocked" | "human-review-required" | "approved" | "published" | "unavailable">("default")
  const [reduced, setReduced] = useState(false)
  const [copied, setCopied] = useState(false)

  const all = { default: episode14EditorialDevelopment, blocked: episode14Blocked, "human-review-required": episode13HumanReview, approved: episode13Approved, published: episode13Published, unavailable: episodeUnavailable }
  const current = all[variant]

  return (<main className="min-h-screen bg-gradient-to-b from-neutral-50 to-slate-100"><LabNavigation /><section className="border-b px-4 py-16 md:px-8"><div className="mx-auto max-w-6xl"><h1 className="text-5xl font-bold">Episode State Card</h1><p className="mt-3 text-lg text-neutral-600">Read-only workflow component</p><div className="mt-6 flex gap-3"><div className="inline-block px-4 py-2 bg-violet-100 text-violet-900 rounded-full text-sm font-semibold">EXPERIMENTAL</div></div></div></section><section className="px-4 py-20 md:px-8 border-b"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-bold mb-10">Hero Demo</h2><div className="flex justify-center"><EpisodeStateCard channelName={current.channelName} episodeId={current.episodeId} episodeNumber={current.episodeNumber} title={current.title} workflowState={current.workflowState} variant={current.variant} humanReviewStatus={current.humanReviewStatus} lastDecision={current.lastDecision} blockers={current.blockers} nextExpectedState={current.nextExpectedState} nextAuthorizedAction={current.nextAuthorizedAction} canonicalSource={current.canonicalSource} manifestVersion={current.manifestVersion} updatedAt={current.updatedAt} youtubeVideoId={current.youtubeVideoId} publishedAt={current.publishedAt} unavailableReason={current.unavailableReason} className="shadow-2xl" reduceMotion={reduced} /></div></div></section><section className="px-4 py-12 md:px-8 border-b bg-white/50"><div className="mx-auto max-w-6xl"><select value={variant} onChange={(e) => setVariant(e.target.value as any)} className="px-4 py-2 border rounded mr-4"><option value="default">Default</option><option value="blocked">Blocked</option><option value="human-review-required">Human Review</option><option value="approved">Approved</option><option value="published">Published</option><option value="unavailable">Unavailable</option></select><button onClick={() => setReduced(!reduced)} className="px-4 py-2 border rounded">{reduced ? "Reduced" : "Normal"}</button></div></section><section className="px-4 py-20 md:px-8"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-bold mb-10">All Variants</h2><div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{Object.values(all).map((fix) => (<div key={fix.variant} className="border rounded-lg p-6 bg-white"><p className="text-sm font-bold uppercase mb-4">{fix.variant}</p><EpisodeStateCard {...fix} reduceMotion={reduced} /></div>))}</div></div></section></main>)
}
