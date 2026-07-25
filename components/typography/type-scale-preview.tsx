import type { TypographyScale } from "@/lib/typography/types"

const scaleRows: Array<{ key: keyof TypographyScale; label: string; sample: string }> = [
  { key: "display", label: "Display", sample: "Reveal consequence." },
  { key: "h1", label: "Editorial H1", sample: "Typography before animation." },
  { key: "h2", label: "Section Heading", sample: "Capture rules" },
  { key: "h3", label: "Support Heading", sample: "Deterministic preview" },
  { key: "body", label: "Body", sample: "Every component must remain legible before, during and after interaction." },
  { key: "small", label: "Small", sample: "Capture-ready notes" },
  { key: "label", label: "Label", sample: "Motion standard" },
]

export function TypeScalePreview({ scale }: { scale: TypographyScale }) {
  return (
    <div className="grid gap-4">
      {scaleRows.map((row) => (
        <article key={row.key} className="grid gap-5 rounded-xl border border-stone-300 bg-[#fbfaf6] p-5 md:grid-cols-[0.8fr_1.2fr] md:p-6">
          <div className="space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{row.label}</p>
            <p className="text-sm leading-6 text-neutral-600">{scale[row.key]}</p>
          </div>
          <div className="flex min-h-32 items-center rounded-lg border border-stone-200 bg-stone-100/50 p-5">
            <p className={`${scale[row.key]} text-balance`}>{row.sample}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
