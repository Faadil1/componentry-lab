import type { MotionDurationToken, MotionEasingToken } from "@/lib/foundations/types"

export function MotionTokenPreview({ durations, easings }: { durations: MotionDurationToken[]; easings: MotionEasingToken[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-stone-300 bg-[#fbfaf6]">
        <div className="border-b border-stone-300 bg-stone-100/70 px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-neutral-500">Duration Tokens</div>
        <div className="divide-y divide-stone-200">
          {durations.map((token) => (
            <div key={token.role} className="grid grid-cols-[0.8fr_0.7fr_1.3fr_1fr] px-4 py-4 text-sm">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">{token.role}</p>
              <p className="font-mono text-[11px] text-neutral-700">{token.value}</p>
              <p className="pr-4 leading-6 text-neutral-700">{token.usage}</p>
              <p className="text-xs leading-5 text-neutral-600">{token.limitations.join(" ")}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-stone-300 bg-[#fbfaf6]">
        <div className="border-b border-stone-300 bg-stone-100/70 px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-neutral-500">Easing Tokens</div>
        <div className="divide-y divide-stone-200">
          {easings.map((token) => (
            <div key={token.role} className="grid grid-cols-[0.8fr_1fr_1.3fr_1fr] px-4 py-4 text-sm">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">{token.role}</p>
              <p className="font-mono text-[11px] text-neutral-700">{token.value}</p>
              <p className="pr-4 leading-6 text-neutral-700">{token.usage}</p>
              <p className="text-xs leading-5 text-neutral-600">{token.limitations.join(" ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
