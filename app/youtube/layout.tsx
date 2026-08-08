import { LabNavigation } from "@/components/navigation/lab-navigation"

export default function YouTubeOSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-slate-100">
      <LabNavigation />

      <section className="border-b border-neutral-200 bg-white/50 px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            YouTube OS
          </h1>
          <p className="mt-2 text-lg text-neutral-600">
            Wealth Decoded episode production operations
          </p>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </section>
    </main>
  )
}
