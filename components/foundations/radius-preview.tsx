import type { RadiusToken } from "@/lib/foundations/types"

export function RadiusPreview({ tokens }: { tokens: RadiusToken[] }) {
  const getAppliedExample = (role: string) => {
    switch (role) {
      case "radius-none":
        return (
          <button className="w-full bg-[#121110] text-stone-100 font-mono text-xs font-bold py-2.5 px-4 border border-stone-850 rounded-none shadow-xs">
            SHARP BUTTON
          </button>
        )
      case "radius-control":
        return (
          <input
            type="text"
            readOnly
            value="Control Input"
            className="w-full bg-stone-150 border border-stone-300 text-neutral-900 font-mono text-xs px-3 py-2 rounded-md focus:outline-none"
          />
        )
      case "radius-panel":
        return (
          <div className="bg-[#fbfaf6] border border-stone-300 p-4 rounded-xl shadow-xs space-y-2">
            <span className="font-mono text-[9px] text-neutral-400 block">PANEL HEADER</span>
            <p className="text-xs font-bold text-neutral-900">Control Panel Box</p>
          </div>
        )
      case "radius-feature":
        return (
          <div className="bg-[#121110] border border-stone-900 p-5 rounded-2xl text-stone-100 space-y-2">
            <span className="font-mono text-[9px] text-cyan-300 block">FEATURE CARD</span>
            <p className="text-sm font-bold text-white">Visual Specimen</p>
          </div>
        )
      case "radius-round":
        return (
          <div className="flex gap-2">
            <span className="h-8 w-8 rounded-full bg-cyan-700/20 border border-cyan-600 flex items-center justify-center font-mono text-[10px] text-cyan-800 font-bold">
              01
            </span>
            <span className="rounded-full bg-stone-900 text-stone-100 font-mono text-[10px] font-bold px-3 py-1.5 flex items-center">
              PILL BADGE
            </span>
          </div>
        )
      default:
        return <div className="p-3 bg-stone-100 rounded">Sample</div>
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 shadow-xs">
      {/* Specifications list */}
      <div className="space-y-4">
        <div className="border-b border-stone-300 pb-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Radius Specifications</span>
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

      {/* Applied Specimen Previews */}
      <div className="rounded-lg border border-stone-300 bg-[#eae6db] p-6 flex flex-col justify-between space-y-6">
        <div className="border-b border-stone-350 pb-2 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
          Applied Specimen Tests
        </div>

        <div className="space-y-4 my-auto">
          {tokens.map((token) => (
            <div key={token.role} className="grid grid-cols-[100px_1fr] gap-4 items-center">
              <span className="font-mono text-[10px] font-bold text-neutral-600 truncate" title={token.role}>
                {token.role.replace("radius-", "")}
              </span>
              <div className="flex items-center min-h-[56px] w-full">
                {getAppliedExample(token.role)}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-350 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span>Boundary Geometry</span>
          <span className="text-cyan-700 font-bold">ROUNDNESS SCALE</span>
        </div>
      </div>
    </div>
  )
}
