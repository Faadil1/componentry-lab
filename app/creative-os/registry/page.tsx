import { buildLiveLibraryV2ReadModel } from "../../../lib/creative-os/library-v2"

import { RegistryExplorer } from "./registry-explorer"
import { buildRegistryV2ViewModel } from "./registry-view-model"

export const metadata = {
  title: "Creative OS - Governed Resource Registry",
  description: "Read-only cumulative registry index for the Library V2 model, including governed entities and qualified external findings."
}

export default function CreativeOSRegistryPage() {
  const viewModel = buildRegistryV2ViewModel(buildLiveLibraryV2ReadModel())

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-4 border-b border-border pb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Creative OS</p>
          <div className="space-y-2">
            <h1 className="text-[32px] font-semibold tracking-tight md:text-[36px] xl:text-[40px]">Governed Resource Registry</h1>
            <p className="max-w-3xl text-[14px] leading-6 text-muted-foreground">
              Cumulative read-only Library V2 index: existing governed entities plus qualified external findings, grouped by role with local filtering and inline detail expansion.
            </p>
          </div>
        </header>

        <RegistryExplorer viewModel={viewModel} />
      </div>
    </main>
  )
}
