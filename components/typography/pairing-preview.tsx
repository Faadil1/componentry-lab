import type { TypographyRecipe } from "@/lib/typography/types"

export function PairingPreview({ recipe }: { recipe: TypographyRecipe }) {
  const isEditorial = recipe.id === "editorial-technology"
  const isCinematic = recipe.id === "cinematic-product"

  return (
    <article
      className={`border transition-all duration-300 ${
        isCinematic
          ? "border-stone-900 bg-[#121110] text-stone-100 p-6 md:p-8 rounded-xl shadow-2xl"
          : isEditorial
          ? "border-stone-300 bg-[#fbfaf6] text-neutral-900 p-6 md:p-8 rounded-xl shadow-sm"
          : "border-stone-300 bg-[#eae6db] text-neutral-950 p-6 md:p-8 rounded-xl"
      }`}
    >
      {/* Header Tag / Recipe Info */}
      <div className="flex items-center justify-between border-b pb-4 mb-5 border-stone-300/80 dark:border-stone-800">
        <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${isCinematic ? "text-cyan-400" : "text-neutral-500"}`}>
          {recipe.name}
        </span>
        <span className="font-mono text-[10px] text-stone-500">
          RECIPE ID: {recipe.id}
        </span>
      </div>

      {/* Main typographic content */}
      <div className="space-y-4">
        {/* Display headline */}
        <h3
          className={`font-semibold tracking-tight text-balance ${
            isCinematic
              ? "text-4xl md:text-5xl leading-[1.02] text-white"
              : isEditorial
              ? "text-3xl md:text-4xl leading-[1.08] text-neutral-900"
              : "text-2xl md:text-3xl leading-snug text-neutral-950"
          }`}
        >
          {recipe.display}
        </h3>

        {/* Paragraph body */}
        <p
          className={`text-pretty text-sm leading-relaxed ${
            isCinematic
              ? "text-stone-300 max-w-[66ch]"
              : isEditorial
              ? "max-w-[52ch] font-sans font-medium italic leading-[1.7] tracking-[-0.01em] text-neutral-700"
              : "text-neutral-800 font-mono text-[11px]"
          }`}
        >
          {recipe.body}
        </p>
      </div>

      {/* Guidelines / Implementation Notes */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3 pt-5 border-t border-stone-300/60 dark:border-stone-800">
        {recipe.notes.map((note) => (
          <div
            key={note}
            className={`rounded-lg p-3 text-xs leading-relaxed font-mono ${
              isCinematic
                ? "bg-white/[0.04] border border-white/10 text-stone-300"
                : "bg-stone-100 border border-stone-200 text-neutral-700"
            }`}
          >
            â€¢ {note}
          </div>
        ))}
      </div>
    </article>
  )
}
