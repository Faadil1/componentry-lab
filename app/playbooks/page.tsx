// ─────────────────────────────────────────────────────────────
// /playbooks — Knowledge Index Page (Server Component)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { PlaybookHero } from "@/components/playbooks/playbook-hero"
import { PlaybookWorkbench } from "@/components/playbooks/playbook-workbench"
import { PlaybookProvider } from "@/components/playbooks/playbook-provider"
import { playbookManifestStats } from "@/lib/playbooks"

export const metadata: Metadata = {
  title: "Knowledge Index",
  description: `${playbookManifestStats.total} canonical playbooks covering UI/UX, positioning, evidence, demo video, and hackathon operating templates.`,
}

export default function PlaybooksPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-3">
          <LabNavigation />
        </div>
      </div>

      {/* Hero */}
      <PlaybookHero />

      {/* Workbench */}
      <PlaybookProvider>
        <PlaybookWorkbench />
      </PlaybookProvider>
    </div>
  )
}
