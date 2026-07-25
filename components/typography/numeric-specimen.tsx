export function NumericSpecimen({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-stone-800 bg-[#0e0d0c] p-4 flex flex-col justify-between min-h-[92px] rounded-lg">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8a82]">
        {label}
      </p>
      <p className="mt-2 font-mono text-[15px] font-bold tabular-nums text-cyan-300">
        {value}
      </p>
    </div>
  )
}
