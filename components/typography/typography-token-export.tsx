import { typographyTokens, typographyTokensCss } from "@/lib/typography/tokens"

export function TypographyTokenExport() {
  return (
    <section className="rounded-2xl border border-neutral-950 bg-neutral-950 p-6 text-stone-100 md:p-8">
      <div className="space-y-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Token export</p>
        <h2 className="text-3xl font-semibold tracking-tight">CSS and TypeScript outputs stay in sync.</h2>
        <p className="max-w-2xl text-sm leading-6 text-stone-300">
          The foundation exposes reusable semantic tokens for scale, line heights, tracking, paragraph measures and fallback stacks.
        </p>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <pre className="overflow-auto rounded-lg border border-white/10 bg-white/[0.04] p-4 text-xs leading-6 text-stone-200">
          {JSON.stringify(typographyTokens, null, 2)}
        </pre>
        <pre className="overflow-auto rounded-lg border border-white/10 bg-white/[0.04] p-4 text-xs leading-6 text-stone-200">{typographyTokensCss}</pre>
      </div>
    </section>
  )
}
