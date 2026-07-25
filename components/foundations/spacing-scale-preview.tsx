import type { SpacingToken } from "@/lib/foundations/types"

export function SpacingScalePreview({ tokens }: { tokens: SpacingToken[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 shadow-xs">
      {/* Specifications list */}
      <div className="space-y-4">
        <div className="border-b border-stone-300 pb-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Spacing Specifications</span>
        </div>
        <div className="divide-y divide-stone-200">
          {tokens.map((token) => (
            <div key={token.role} className="py-3 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-900">{token.role}</span>
                <code className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">{token.value}</code>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">{token.usage}</p>
              <div className="font-mono text-[9px] text-stone-500">
                LIMITS: {token.limitations.join(" ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Ruler & Measurement Guides */}
      <div className="rounded-lg border border-stone-300 bg-[#eae6db] p-6 flex flex-col justify-between space-y-6">
        <div className="border-b border-stone-350 pb-2 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
          Spacing Scale Measurement Tool
        </div>

        {/* Visual ruler block */}
        <div className="space-y-5 my-auto">
          {tokens.map((token) => {
            // Map value like '0.25rem' / '1rem' / '4rem' to a visual width bar
            const numericVal = parseFloat(token.value)
            const unit = token.value.replace(/[0-9.]/g, "")

            // Calculate a clean width percentage for the preview bar
            let percentWidth = 10
            if (unit === "rem") {
              percentWidth = Math.min(100, numericVal * 16)
            } else if (unit === "px") {
              percentWidth = Math.min(100, (numericVal / 64) * 100)
            }

            return (
              <div key={token.role} className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-neutral-700">
                  <span className="font-bold">{token.role}</span>
                  <span>{token.value}</span>
                </div>

                {/* Visual bar with ticks */}
                <div className="h-6 w-full bg-stone-100/50 rounded border border-stone-250 relative overflow-hidden flex items-center">
                  <div
                    className="h-full bg-cyan-700/20 border-r-2 border-cyan-600 transition-all duration-300"
                    style={{ width: `${percentWidth}%` }}
                  />
                  <span className="absolute left-3 font-mono text-[9px] text-neutral-600">
                    {percentWidth.toFixed(0)}px equivalent
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-3 border-t border-stone-350 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span>Continuous Scale</span>
          <span className="text-cyan-700 font-bold">1:1 SYSTEM METRICS</span>
        </div>
      </div>
    </div>
  )
}
