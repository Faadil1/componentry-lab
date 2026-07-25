export function NumericSpecimen({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-stone-100/70 p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-neutral-950">{value}</p>
    </div>
  )
}
