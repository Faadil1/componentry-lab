import { buildLibraryV2ReadModel } from "../../../lib/creative-os/library-v2"

import { RegistryExplorer } from "./registry-explorer"
import { buildRegistryV2ViewModel } from "./registry-view-model"

export const metadata = {
  title: "Creative OS - Governed Resource Registry",
  description: "Read-only registry index for the Library V2 model, presented as grouped sections with inline detail expansion and local filtering."
}

export default function CreativeOSRegistryPage() {
  const viewModel = buildRegistryV2ViewModel(buildLibraryV2ReadModel())

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-4 border-b border-border pb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Creative OS</p>
          <div className="space-y-2">
            <h1 className="text-[32px] font-semibold tracking-tight md:text-[36px] xl:text-[40px]">Governed Resource Registry</h1>
            <p className="max-w-3xl text-[14px] leading-6 text-muted-foreground">
              Read-only registry index for the Library V2 model, presented as grouped sections with inline detail expansion and local filtering.
            </p>
          </div>
        </header>

        <RegistryExplorer viewModel={viewModel} />
      </div>
    </main>
  )
}
