"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Reader — full document reader layout (client shell)
// ─────────────────────────────────────────────────────────────

import type { PlaybookDocument } from "@/lib/playbooks"
import { PlaybookDocumentHeader } from "./playbook-document-header"
import { PlaybookMarkdownRenderer } from "./playbook-markdown"
import { PlaybookTableOfContents } from "./playbook-table-of-contents"
import { PlaybookRelatedItems } from "./playbook-related-items"
import { PlaybookComponentryLinks } from "./playbook-componentry-links"
import { PlaybookProvenance } from "./playbook-provenance"
import { PlaybookCopyControls } from "./playbook-copy-controls"
import { PlaybookNavigation } from "./playbook-navigation"

interface PlaybookReaderProps {
  document: PlaybookDocument
}

export function PlaybookReader({ document }: PlaybookReaderProps) {
  const { entry, nodes, headings, prevEntry, nextEntry } = document

  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
        {/* Main content */}
        <main>
          <PlaybookDocumentHeader entry={entry} className="mb-8" />

          <article aria-label={`Document: ${entry.title}`}>
            <PlaybookMarkdownRenderer nodes={nodes} />
          </article>

          <PlaybookNavigation prev={prevEntry} next={nextEntry} className="mt-12" />
        </main>

        {/* Sidebar */}
        <aside className="flex flex-col gap-8 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pb-6">
          <PlaybookTableOfContents headings={headings} />
          <PlaybookComponentryLinks entry={entry} />
          <PlaybookRelatedItems entry={entry} />
          <PlaybookCopyControls entry={entry} />
          <PlaybookProvenance entry={entry} />
        </aside>
      </div>
    </div>
  )
}
