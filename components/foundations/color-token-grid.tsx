import type { ColorToken } from "@/lib/foundations/types"

export function ColorTokenGrid({ tokens }: { tokens: ColorToken[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-300 bg-[#fbfaf6]">
      <div className="grid grid-cols-[1.3fr_0.8fr_0.8fr_1.4fr] gap-0 border-b border-stone-300 bg-stone-100/70 px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-neutral-500 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.4fr_1.1fr_1.1fr]">
        <span>Role</span>
        <span>Light</span>
        <span>Dark</span>
        <span className="hidden md:block">Usage</span>
        <span className="hidden md:block">Combinations</span>
        <span className="hidden md:block">Limitations</span>
      </div>
      <div className="divide-y divide-stone-200">
        {tokens.map((token) => (
          <div key={token.role} className="grid grid-cols-[1.3fr_0.8fr_0.8fr_1.4fr] gap-0 px-4 py-4 text-sm md:grid-cols-[1.2fr_0.8fr_0.8fr_1.4fr_1.1fr_1.1fr]">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">{token.role}</p>
            </div>
            <div className="font-mono text-[11px] text-neutral-700">{token.light}</div>
            <div className="font-mono text-[11px] text-neutral-700">{token.dark}</div>
            <div className="hidden pr-4 text-sm leading-6 text-neutral-700 md:block">{token.usage}</div>
            <div className="hidden pr-4 text-xs leading-5 text-neutral-600 md:block">{token.recommendedCombinations.join(", ")}</div>
            <div className="hidden text-xs leading-5 text-neutral-600 md:block">{token.limitations.join(" ")}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
