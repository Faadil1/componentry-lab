// ─────────────────────────────────────────────────────────────
// /playbooks/[...slug] — Document Reader Page (Server Component)
// ─────────────────────────────────────────────────────────────

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { PlaybookReader } from "@/components/playbooks/playbook-reader"
import {
  readPlaybookDocument,
  allPlaybookSlugSegments,
} from "@/lib/playbooks/content.server"
import { getPlaybookBySlug } from "@/lib/playbooks"

// ── Static params ──────────────────────────────────────────────
export function generateStaticParams(): { slug: string[] }[] {
  return allPlaybookSlugSegments.map((segments) => ({
    slug: segments,
  }))
}

// ── Metadata ───────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const fullSlug = slug.join("/")
  const entry = getPlaybookBySlug(fullSlug)

  if (!entry) {
    return { title: "Not Found" }
  }

  return {
    title: entry.title,
    description: entry.summary,
    openGraph: {
      title: entry.title,
      description: entry.summary,
      type: "article",
    },
  }
}

// ── Page ───────────────────────────────────────────────────────
export default async function PlaybookDocumentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const doc = await readPlaybookDocument(slug)

  if (!doc) notFound()

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-3">
          <LabNavigation />
        </div>
      </div>

      {/* Reader */}
      <PlaybookReader document={doc} />
    </div>
  )
}

// Disable dynamic rendering — all 61 pages are static
export const dynamic = "force-static"
