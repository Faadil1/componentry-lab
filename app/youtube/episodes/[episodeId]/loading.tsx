export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-48 rounded-lg bg-neutral-200 animate-pulse" />
          <div className="mt-2 h-5 w-64 rounded-lg bg-neutral-200 animate-pulse" />
        </div>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-8">
        <div className="flex justify-center">
          <div className="h-40 w-full max-w-md rounded-lg bg-neutral-100 animate-pulse" />
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <div className="h-5 w-32 rounded-lg bg-neutral-200 animate-pulse" />
        <div className="mt-4 space-y-3">
          <div className="h-4 w-full rounded-lg bg-neutral-200 animate-pulse" />
          <div className="h-4 w-3/4 rounded-lg bg-neutral-200 animate-pulse" />
        </div>
      </section>
    </div>
  )
}
