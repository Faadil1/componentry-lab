import type { ColorToken } from "@/lib/foundations/types"

export function ColorTokenGrid({ tokens }: { tokens: ColorToken[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-300 bg-[#fbfaf6] shadow-xs">
      <div className="grid grid-cols-[1.3fr_0.8fr_0.8fr_1.4fr] gap-0 border-b border-stone-300 bg-stone-100/80 px-4 py-3.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-500 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.4fr_1.1fr_1.1fr]">
        <span>Role</span>
        <span>Light Value</span>
        <span>Dark Value</span>
        <span className="hidden md:block">Usage Intent</span>
        <span className="hidden md:block">Combinations</span>
        <span className="hidden md:block">Limitations</span>
      </div>
      <div className="divide-y divide-stone-200">
        {tokens.map((token) => (
          <div key={token.role} className="grid grid-cols-[1.3fr_0.8fr_0.8fr_1.4fr] gap-0 px-4 py-4 text-xs md:grid-cols-[1.2fr_0.8fr_0.8fr_1.4fr_1.1fr_1.1fr] items-center">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-neutral-900">{token.role}</p>
            </div>
            <div className="font-mono text-[11px] text-neutral-700 flex items-center gap-1.5">
              <span className="inline-block h-3.5 w-3.5 rounded-sm border border-stone-300" style={{ backgroundColor: token.light }} />
              {token.light}
            </div>
            <div className="font-mono text-[11px] text-neutral-700 flex items-center gap-1.5">
              <span className="inline-block h-3.5 w-3.5 rounded-sm border border-stone-700 bg-neutral-950" style={{ backgroundColor: token.dark }} />
              {token.dark}
            </div>
            <div className="hidden pr-4 leading-relaxed text-neutral-700 md:block">{token.usage}</div>
            <div className="hidden pr-4 text-[11px] leading-relaxed text-neutral-600 font-mono md:block">
              {token.recommendedCombinations.join(", ")}
            </div>
            <div className="hidden text-[11px] leading-relaxed text-neutral-600 md:block">
              {token.limitations.join(" ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
