import type { ColorMode, ColorToken } from "@/lib/foundations/types"

export function SemanticColorPreview({ tokens, mode, onModeChange }: { tokens: ColorToken[]; mode: ColorMode; onModeChange: (mode: ColorMode) => void }) {
  const activeBackground = mode === "light" ? "#f3efe6" : "#121110"
  const surface = mode === "light" ? "#fbfaf6" : "#1e1d1a"
  const raised = mode === "light" ? "#eae6db" : "#2a2824"
  const textPrimary = mode === "light" ? "#181716" : "#f5f3ee"
  const textSecondary = mode === "light" ? "#57534e" : "#a8a29e"
  const textMuted = mode === "light" ? "#78716c" : "#78716c"
  const accentColor = mode === "light" ? "#0f766e" : "#22d3ee"

  const lookup = (role: ColorToken["role"]) => tokens.find((token) => token.role === role)

  return (
    <section className="rounded-xl border border-stone-300 bg-[#fbfaf6] overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 bg-[#eae6db] px-5 py-3">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Semantic Interactive Arena</p>
          <h3 className="text-lg font-bold text-neutral-950">Applied Color Relationships</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={mode === "light"}
            onClick={() => onModeChange("light")}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-mono font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              mode === "light" ? "border-neutral-950 bg-neutral-950 text-white shadow-xs" : "border-stone-300 bg-white text-neutral-700 hover:text-neutral-950"
            }`}
          >
            Light mode
          </button>
          <button
            type="button"
            aria-pressed={mode === "dark"}
            onClick={() => onModeChange("dark")}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-mono font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              mode === "dark" ? "border-neutral-950 bg-neutral-950 text-white shadow-xs" : "border-stone-300 bg-white text-neutral-700 hover:text-neutral-950"
            }`}
          >
            Dark mode
          </button>
        </div>
      </div>

      {/* Applied compositions grid */}
      <div className="grid gap-6 p-6 md:grid-cols-2" style={{ backgroundColor: activeBackground, color: textPrimary }}>
        {/* Environment & Content preview card */}
        <div
          className="rounded-lg border p-6 space-y-4"
          style={{ backgroundColor: surface, borderColor: lookup("border-default")?.[mode] ?? "currentColor" }}
        >
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest block" style={{ color: textMuted }}>
              bg-surface // text-primary // border-default
            </span>
            <h4 className="text-2xl font-bold leading-tight" style={{ color: textPrimary }}>
              Luminance transitions respond instantly to mode shifts.
            </h4>
          </div>
          <p className="text-xs leading-relaxed max-w-[44ch]" style={{ color: textSecondary }}>
            Ce panneau de démonstration illustre la relation de contraste entre le corps de texte principal (text-primary) et le texte d’accompagnement secondaire (text-secondary).
          </p>

          <div className="pt-4 border-t flex flex-wrap gap-2 text-[10px] font-mono" style={{ borderColor: lookup("border-subtle")?.[mode] ?? "currentColor" }}>
            <span className="rounded-full border px-2.5 py-0.5" style={{ borderColor: lookup("border-subtle")?.[mode] ?? "currentColor", color: textSecondary }}>
              border-subtle
            </span>
            <span className="rounded-full border px-2.5 py-0.5" style={{ borderColor: accentColor, color: accentColor }}>
              accent-highlight
            </span>
          </div>
        </div>

        {/* Structural & Feedback layouts */}
        <div className="space-y-4">
          {/* Borders & elevation card */}
          <div
            className="rounded-lg border p-5 space-y-3"
            style={{ backgroundColor: raised, borderColor: lookup("border-strong")?.[mode] ?? "currentColor" }}
          >
            <span className="font-mono text-[9px] uppercase tracking-widest block" style={{ color: textMuted }}>
              bg-surface-raised // border-strong
            </span>
            <p className="text-xs leading-relaxed" style={{ color: textPrimary }}>
              Les bordures default et strong permettent de délimiter proprement les surfaces élevées sans avoir recours à des ombres portées décoratives.
            </p>
          </div>

          {/* Feedback states badge matrix */}
          <div
            className="rounded-lg border p-5 space-y-4"
            style={{ backgroundColor: surface, borderColor: lookup("border-default")?.[mode] ?? "currentColor" }}
          >
            <span className="font-mono text-[9px] uppercase tracking-widest block" style={{ color: textMuted }}>
              system state feedback tokens
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <span className="rounded border px-2.5 py-1.5 flex items-center justify-between" style={{ borderColor: lookup("success")?.[mode] ?? "currentColor", color: lookup("success")?.[mode] ?? accentColor }}>
                <span>SUCCESS</span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lookup("success")?.[mode] ?? "currentColor" }} />
              </span>
              <span className="rounded border px-2.5 py-1.5 flex items-center justify-between" style={{ borderColor: lookup("warning")?.[mode] ?? "currentColor", color: lookup("warning")?.[mode] ?? accentColor }}>
                <span>WARNING</span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lookup("warning")?.[mode] ?? "currentColor" }} />
              </span>
              <span className="rounded border px-2.5 py-1.5 flex items-center justify-between" style={{ borderColor: lookup("danger")?.[mode] ?? "currentColor", color: lookup("danger")?.[mode] ?? accentColor }}>
                <span>DANGER</span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lookup("danger")?.[mode] ?? "currentColor" }} />
              </span>
              <span className="rounded border px-2.5 py-1.5 flex items-center justify-between" style={{ borderColor: lookup("info")?.[mode] ?? "currentColor", color: lookup("info")?.[mode] ?? accentColor }}>
                <span>INFO</span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lookup("info")?.[mode] ?? "currentColor" }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
