import type { TypographyRecipe } from "@/lib/typography/types"

export function PairingPreview({ recipe }: { recipe: TypographyRecipe }) {
  return (
    <article className="rounded-2xl border border-stone-300 bg-[#11100f] p-6 text-stone-100 shadow-2xl md:p-8">
      <div className="space-y-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{recipe.name}</p>
        <h3 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.04] tracking-normal text-[#fbfaf6] md:text-6xl">{recipe.display}</h3>
        <p className="max-w-2xl text-pretty text-base leading-7 text-stone-300">{recipe.body}</p>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {recipe.notes.map((note) => (
          <div key={note} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-stone-200">
            {note}
          </div>
        ))}
      </div>
    </article>
  )
}
