import type { ElevationToken } from "@/lib/foundations/types"

export function ElevationPreview({ tokens }: { tokens: ElevationToken[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-300 bg-[#fbfaf6]">
      <div className="grid grid-cols-[0.8fr_0.9fr_1.4fr_1fr] border-b border-stone-300 bg-stone-100/70 px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-neutral-500">
        <span>Role</span>
        <span>Shadow</span>
        <span>Usage</span>
        <span>Limits</span>
      </div>
      <div className="divide-y divide-stone-200">
        {tokens.map((token) => (
          <div key={token.role} className="grid grid-cols-[0.8fr_0.9fr_1.4fr_1fr] px-4 py-4 text-sm">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">{token.role}</p>
            <p className="font-mono text-[11px] text-neutral-700">{token.value}</p>
            <p className="pr-4 leading-6 text-neutral-700">{token.usage}</p>
            <p className="text-xs leading-5 text-neutral-600">{token.limitations.join(" ")}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
