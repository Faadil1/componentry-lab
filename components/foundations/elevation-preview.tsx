import type { ElevationToken } from "@/lib/foundations/types"

export function ElevationPreview({ tokens }: { tokens: ElevationToken[] }) {
  // Map value to actual style classes
  const getElevationShadow = (role: string) => {
    switch (role) {
      case "elevation-flat":
        return "shadow-none border border-stone-300"
      case "elevation-raised":
        return "shadow-xs border border-stone-300/80"
      case "elevation-floating":
        return "shadow-sm border border-stone-250"
      case "elevation-overlay":
        return "shadow-md border border-stone-200"
      case "elevation-cinematic":
        return "shadow-2xl border border-stone-900 bg-[#121110] text-stone-100"
      default:
        return "shadow"
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 shadow-xs">
      {/* Specifications list */}
      <div className="space-y-4">
        <div className="border-b border-stone-300 pb-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Elevation Specifications</span>
        </div>
        <div className="divide-y divide-stone-200">
          {tokens.map((token) => (
            <div key={token.role} className="py-3.5 space-y-1">
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

      {/* Layer Depth Preview Box */}
      <div className="rounded-lg border border-stone-300 bg-[#eae6db] p-6 flex flex-col justify-between space-y-6">
        <div className="border-b border-stone-350 pb-2 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
          Layer Depth Preview
        </div>

        {/* Stack showing real shadows */}
        <div className="space-y-5 my-auto">
          {tokens.map((token) => {
            const isCinematic = token.role === "elevation-cinematic"
            return (
              <div
                key={token.role}
                className={`p-4 rounded-lg flex items-center justify-between transition-all duration-300 ${
                  isCinematic ? "bg-[#121110] text-stone-100" : "bg-[#fbfaf6] text-neutral-900"
                } ${getElevationShadow(token.role)}`}
              >
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                    {token.role}
                  </span>
                  <p className="text-xs opacity-85">{token.value}</p>
                </div>
                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${isCinematic ? "bg-cyan-950 text-cyan-300 border border-cyan-800" : "bg-stone-100 border border-stone-200"}`}>
                  {isCinematic ? "PREMIUM" : "CORE"}
                </span>
              </div>
            )
          })}
        </div>

        <div className="pt-3 border-t border-stone-350 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span>Depth Layout</span>
          <span className="text-cyan-700 font-bold">SHADOW &amp; BORDER SCALE</span>
        </div>
      </div>
    </div>
  )
}
