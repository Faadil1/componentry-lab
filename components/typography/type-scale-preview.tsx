import type { TypographyScale } from "@/lib/typography/types"

const scaleRows: Array<{ key: keyof TypographyScale; label: string; size: string; lh: string; tr: string; sample: string }> = [
  { key: "display", label: "Display", size: "text-5xl md:text-7xl", lh: "0.98", tr: "normal", sample: "Reveal consequence." },
  { key: "h1", label: "Editorial H1", size: "text-4xl md:text-6xl", lh: "1.04", tr: "normal", sample: "Typography before animation." },
  { key: "h2", label: "Section Heading", size: "text-2xl md:text-3xl", lh: "1.15", tr: "normal", sample: "Useful constraints for 40+ future demos." },
  { key: "h3", label: "Support Heading", size: "text-xl md:text-2xl", lh: "1.2", tr: "normal", sample: "Deterministic preview" },
  { key: "body", label: "Body Copy", size: "text-base", lh: "1.75", tr: "normal", sample: "Every component must remain legible before, during and after interaction." },
  { key: "small", label: "Small / Captions", size: "text-sm", lh: "1.6", tr: "normal", sample: "Capture-ready notes closed by default." },
  { key: "label", label: "Label / Mono", size: "text-xs", lh: "1.4", tr: "0.18em", sample: "MOTION STANDARD" },
  { key: "numeric", label: "Numeric / Tabular", size: "font-mono", lh: "1.0", tr: "normal", sample: "08:43s / 99.9% / $1,284.00" },
]

export function TypeScalePreview({ scale }: { scale: TypographyScale }) {
  return (
    <div className="border border-stone-300 bg-[#fbfaf6] divide-y divide-stone-200 rounded-xl overflow-hidden shadow-xs">
      {scaleRows.map((row) => (
        <article key={row.key} className="grid md:grid-cols-[250px_1fr] p-5 md:p-6 gap-4 items-center">
          {/* Metadata Specs */}
          <div className="space-y-1">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-neutral-900">
              {row.label}
            </p>
            <div className="font-mono text-[10px] text-neutral-500 space-y-0.5">
              <p>CLASS: <code className="bg-stone-100 px-1 py-0.5 rounded text-neutral-800">{scale[row.key]}</code></p>
              <p>SIZE: {row.size} {"//"} L-H: {row.lh} {"//"} TRACKING: {row.tr}</p>
            </div>
          </div>

          {/* Sample Area */}
          <div className="py-4 border-t md:border-t-0 md:pl-6 border-stone-100 flex items-center min-h-[92px]">
            <p className={`${scale[row.key]} text-balance text-neutral-950`}>
              {row.sample}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
