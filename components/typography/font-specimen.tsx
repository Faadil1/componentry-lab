import type { FontProfile } from "@/lib/typography/types"

export function FontSpecimen({ profile }: { profile: FontProfile }) {
  return (
    <article className="rounded-xl border border-stone-300 bg-[#fbfaf6] p-5 md:p-6">
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{profile.displayName}</p>
        <h3 className="text-balance text-2xl font-semibold tracking-tight text-neutral-950">{profile.family}</h3>
      </div>
      <p className="mt-3 text-pretty text-sm leading-6 text-neutral-700">{profile.recommendedUses.join(", ")}</p>
      <dl className="mt-5 grid gap-3 text-sm">
        <div className="border-t border-stone-300 pt-3">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Source</dt>
          <dd className="mt-1 text-pretty text-neutral-900">{profile.source}</dd>
        </div>
        <div className="border-t border-stone-300 pt-3">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">License</dt>
          <dd className="mt-1 text-pretty text-neutral-900">{profile.licenseName}</dd>
        </div>
        <div className="border-t border-stone-300 pt-3">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Limitations</dt>
          <dd className="mt-1 text-pretty text-neutral-700">{profile.limitations.join(", ")}</dd>
        </div>
      </dl>
    </article>
  )
}
