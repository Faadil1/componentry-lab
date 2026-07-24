import Link from "next/link"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { componentCategories, categoryDescriptions } from "@/lib/registry/categories"
import { getCaptureReadyComponents, registryComponents } from "@/lib/registry/components"
import type { ComponentMaturity } from "@/lib/registry/types"

const maturityOptions = ["Experimental", "Lab Ready", "Production Ready"] as const satisfies readonly ComponentMaturity[]

type LibrarySearchParams = {
  maturity?: string
  capture?: string
}

function isMaturity(value: string | undefined): value is ComponentMaturity {
  return maturityOptions.some((option) => option === value)
}

function Capability({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-300/80 bg-stone-100/70 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-950">{value}</p>
    </div>
  )
}

export default async function LibraryPage({ searchParams }: { searchParams: Promise<LibrarySearchParams> }) {
  const params = await searchParams
  const selectedMaturity = isMaturity(params.maturity) ? params.maturity : "all"
  const captureOnly = params.capture === "ready"
  const captureReady = getCaptureReadyComponents()

  const filteredComponents = registryComponents.filter((component) => {
    const maturityMatches = selectedMaturity === "all" || component.maturity === selectedMaturity
    const captureMatches = !captureOnly || (component.deterministicCapture && component.remotionReady)
    return maturityMatches && captureMatches
  })

  const activeCategories = componentCategories.filter((category) =>
    registryComponents.some((component) => component.category === category)
  )

  return (
    <main className="min-h-screen bg-[#f2eee5] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      <header className="border-b border-stone-300/80 bg-[#f2eee5] px-4 py-5 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-neutral-500">Componentry Proprietary Library</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">Capture-ready interaction catalogue.</h1>
          </div>
          <LabNavigation
            linkClassName="py-2 font-semibold"
            activeClassName="bg-neutral-950 text-white"
            inactiveClassName="border border-stone-300 bg-stone-100 text-neutral-700 hover:text-neutral-950"
          />
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <section className="grid gap-4 md:grid-cols-4">
          <Capability label="Total components" value={String(registryComponents.length)} />
          <Capability label="Active categories" value={String(activeCategories.length)} />
          <Capability label="Capture ready" value={String(captureReady.length)} />
          <Capability label="Maturity filter" value={selectedMaturity === "all" ? "All" : selectedMaturity} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-6 rounded-xl border border-stone-300 bg-[#e6dfd1] p-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">Filters</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className={`rounded-lg px-3 py-2 text-xs font-semibold ${selectedMaturity === "all" ? "bg-neutral-950 text-white" : "border border-stone-300 bg-stone-100 text-neutral-700"}`} href={captureOnly ? "/library?capture=ready" : "/library"}>
                  All maturity
                </Link>
                {maturityOptions.map((maturity) => {
                  const href = `/library?maturity=${encodeURIComponent(maturity)}${captureOnly ? "&capture=ready" : ""}`
                  return (
                    <Link key={maturity} className={`rounded-lg px-3 py-2 text-xs font-semibold ${selectedMaturity === maturity ? "bg-neutral-950 text-white" : "border border-stone-300 bg-stone-100 text-neutral-700"}`} href={href}>
                      {maturity}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className={`rounded-lg px-3 py-2 text-xs font-semibold ${captureOnly ? "bg-neutral-950 text-white" : "border border-stone-300 bg-stone-100 text-neutral-700"}`} href={selectedMaturity === "all" ? "/library?capture=ready" : `/library?maturity=${encodeURIComponent(selectedMaturity)}&capture=ready`}>
                  Capture Ready only
                </Link>
                <Link className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-semibold text-neutral-700" href={selectedMaturity === "all" ? "/library" : `/library?maturity=${encodeURIComponent(selectedMaturity)}`}>
                  Show all capture states
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">Categories</h2>
              <div className="mt-4 space-y-3">
                {componentCategories.map((category) => {
                  const count = registryComponents.filter((component) => component.category === category).length
                  return (
                    <div key={category} className="border-t border-stone-300 pt-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{category}</p>
                        <span className="font-mono text-xs text-neutral-500">{count}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-neutral-600">{categoryDescriptions[category]}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>

          <section className="space-y-5" aria-label="Registered components">
            {filteredComponents.map((component) => (
              <article key={component.id} className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">{component.category}</span>
                      <span className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-neutral-700">{component.maturity}</span>
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight">{component.name}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{component.description}</p>
                  </div>
                  <Link className="rounded-lg bg-neutral-950 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-neutral-800" href={component.route}>
                    Open lab
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <Capability label="Keyboard" value={component.keyboardSupport} />
                  <Capability label="Tactile" value={component.tactileSupport} />
                  <Capability label="Mobile" value={component.mobileSupport} />
                  <Capability label="Reduced motion" value={component.reducedMotion} />
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="space-y-3 text-sm leading-6 text-neutral-700">
                    <p><strong className="text-neutral-950">Interaction:</strong> {component.interactionModel}</p>
                    <p><strong className="text-neutral-950">Hero Demo Moment:</strong> {component.heroDemoMoment}</p>
                    <p><strong className="text-neutral-950">Initial:</strong> {component.initialState}</p>
                    <p><strong className="text-neutral-950">Final:</strong> {component.finalState}</p>
                  </div>
                  <div className="space-y-3 rounded-lg border border-stone-300 bg-stone-100/70 p-4 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Remotion</p>
                        <p className="font-semibold">{component.remotionReady ? "Ready" : "Needs work"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Playwright</p>
                        <p className="font-mono text-xs">{component.playwrightSelectors.root}</p>
                      </div>
                    </div>
                    <p><strong>Viewport:</strong> {component.recommendedViewport.label} ({component.recommendedViewport.width}x{component.recommendedViewport.height})</p>
                    <p><strong>Duration:</strong> {component.recommendedCaptureDuration}</p>
                    <p><strong>Dependencies:</strong> {component.dependencies.join(", ")}</p>
                    <div>
                      <p className="font-semibold">Known limitations</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-neutral-600">
                        {component.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </section>
      </div>
    </main>
  )
}
