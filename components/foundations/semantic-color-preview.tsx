import type { ColorMode, ColorToken } from "@/lib/foundations/types"

export function SemanticColorPreview({ tokens, mode, onModeChange }: { tokens: ColorToken[]; mode: ColorMode; onModeChange: (mode: ColorMode) => void }) {
  const activeBackground = mode === "light" ? "#f3efe6" : "#121110"
  const surface = mode === "light" ? "#fbfaf6" : "#1a1816"
  const raised = mode === "light" ? "#eae6db" : "#22201d"
  const text = mode === "light" ? "#181716" : "#f5f3ee"
  const muted = mode === "light" ? "#7a756c" : "#a8a195"
  const accent = mode === "light" ? "#0f766e" : "#47d6c7"

  const lookup = (role: ColorToken["role"]) => tokens.find((token) => token.role === role)

  return (
    <section className="rounded-2xl border border-stone-300 bg-[#fbfaf6] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 bg-stone-100/70 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Semantic Colors</p>
          <h3 className="text-lg font-semibold text-neutral-950">Light / dark system</h3>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-pressed={mode === "light"} onClick={() => onModeChange("light")} className={`rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold ${mode === "light" ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700"}`}>Light</button>
          <button type="button" aria-pressed={mode === "dark"} onClick={() => onModeChange("dark")} className={`rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold ${mode === "dark" ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-white text-neutral-700"}`}>Dark</button>
        </div>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-[0.9fr_1.1fr]" style={{ backgroundColor: activeBackground, color: text }}>
        <div className="space-y-4">
          <div className="rounded-2xl border px-4 py-4" style={{ backgroundColor: surface, borderColor: lookup("border-default")?.[mode] ?? "currentColor" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: muted }}>Preview surface</p>
            <h4 className="mt-2 text-2xl font-semibold text-balance">Tokens adapt without changing the workbench structure.</h4>
            <p className="mt-3 max-w-[42ch] text-sm leading-6" style={{ color: muted }}>This preview shows the relationship between core reading text, supporting labels and the accent surface in a deterministic way.</p>
          </div>
          <div className="flex gap-3 text-xs font-mono">
            <span className="rounded-full border px-3 py-1" style={{ borderColor: lookup("border-subtle")?.[mode] ?? "currentColor", color: muted }}>Muted label</span>
            <span className="rounded-full border px-3 py-1" style={{ borderColor: accent, color: accent }}>Accent</span>
          </div>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="rounded-xl border p-4" style={{ backgroundColor: raised, borderColor: lookup("border-default")?.[mode] ?? "currentColor" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: muted }}>text-primary / text-secondary / text-muted</p>
            <p className="mt-2 leading-7" style={{ color: text }}>Primary body text remains dominant while secondary and muted text recede in a measured way.</p>
          </div>
          <div className="rounded-xl border p-4" style={{ backgroundColor: surface, borderColor: lookup("border-strong")?.[mode] ?? "currentColor" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: muted }}>success / warning / danger / info</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
              <span className="rounded-full border px-2.5 py-1" style={{ borderColor: lookup("success")?.[mode] ?? "currentColor", color: lookup("success")?.[mode] ?? accent }}>Success</span>
              <span className="rounded-full border px-2.5 py-1" style={{ borderColor: lookup("warning")?.[mode] ?? "currentColor", color: lookup("warning")?.[mode] ?? accent }}>Warning</span>
              <span className="rounded-full border px-2.5 py-1" style={{ borderColor: lookup("danger")?.[mode] ?? "currentColor", color: lookup("danger")?.[mode] ?? accent }}>Danger</span>
              <span className="rounded-full border px-2.5 py-1" style={{ borderColor: lookup("info")?.[mode] ?? "currentColor", color: lookup("info")?.[mode] ?? accent }}>Info</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
