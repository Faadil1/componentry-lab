import type { SurfaceToken } from "@/lib/foundations/types"

export function SurfacePreview({ tokens }: { tokens: SurfaceToken[] }) {
  // Let's create an architectural depth section on the right, and the specs list on the left.
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] rounded-xl border border-stone-300 bg-[#fbfaf6] p-6 shadow-xs">
      {/* Specifications list */}
      <div className="space-y-4">
        <div className="border-b border-stone-300 pb-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Surface Specifications</span>
        </div>
        <div className="divide-y divide-stone-200">
          {tokens.map((token) => (
            <div key={token.role} className="py-4 space-y-1">
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

      {/* Architectural Cutaway Preview */}
      <div className="rounded-lg border border-stone-300 bg-[#eae6db] p-6 flex flex-col justify-between space-y-6">
        <div className="border-b border-stone-350 pb-2 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
          Architectural Depth Cut
        </div>

        {/* Nested depth stack */}
        <div className="bg-[#f3efe6] border border-stone-350 p-6 rounded-lg space-y-4">
          <span className="font-mono text-[9px] text-neutral-400 block">01 // bg-canvas</span>

          {/* Base Layer */}
          <div className="bg-[#fbfaf6] border border-stone-300 p-4 rounded-md shadow-xs space-y-3">
            <span className="font-mono text-[9px] text-neutral-400 block">02 // bg-surface</span>

            {/* Raised Layer */}
            <div className="bg-[#eae6db] border border-stone-300 p-3 rounded shadow-sm">
              <span className="font-mono text-[9px] text-neutral-500 block">03 // bg-surface-raised</span>
              <p className="text-xs font-bold text-neutral-900 mt-1">Focal Content Area</p>
            </div>
          </div>
        </div>

        {/* Inverse contrast preview */}
        <div className="bg-[#121110] border border-stone-900 p-4 rounded-lg text-stone-100 flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] text-stone-400 block">04 // bg-surface-inverse</span>
            <p className="text-xs font-semibold mt-1">High Contrast Inverted</p>
          </div>
          <span className="rounded bg-stone-800 px-2 py-0.5 font-mono text-[10px] text-cyan-300 font-bold">
            INVERSE
          </span>
        </div>
      </div>
    </div>
  )
}
