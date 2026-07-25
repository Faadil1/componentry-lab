import type { FontProfile } from "@/lib/typography/types"

export function FontSpecimen({ profile }: { profile: FontProfile }) {
  return (
    <article className="border-b border-stone-300 bg-[#fbfaf6] p-6 space-y-6">
      {/* Specimen Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200 pb-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">
          {profile.role.toUpperCase()} {"//"} ROLE SPECIMEN
        </span>
        <span className="font-mono text-[10px] text-stone-500">
          {profile.source.toUpperCase()}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="font-mono text-xs text-neutral-500 uppercase tracking-wider">Family Name</h3>
        <p className="text-3xl font-bold tracking-tight text-neutral-950 font-sans" style={{ fontFamily: profile.fallbackStack }}>
          {profile.family}
        </p>
      </div>

      {/* Glyphs & Character Tests */}
      <div className="space-y-4 pt-2">
        <div>
          <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Title Specimen</span>
          <p className="text-xl font-semibold tracking-tight text-neutral-900" style={{ fontFamily: profile.fallbackStack }}>
            Typography System Foundations
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Français (Display/Body)</span>
          <p className="text-sm text-neutral-800 leading-relaxed" style={{ fontFamily: profile.fallbackStack }}>
            La typographie structure la pensée avant même l’amorce du moindre mouvement d’interface.
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest block mb-1">English (Display/Body)</span>
          <p className="text-sm text-neutral-800 leading-relaxed" style={{ fontFamily: profile.fallbackStack }}>
            Typography structures thought before a single interface transition or motion starts.
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Glyph Test (Accents, Symbols, Numbers)</span>
          <p className="font-mono text-xs text-neutral-800 tracking-wider bg-stone-100 p-2 rounded" style={{ fontFamily: profile.fallbackStack }}>
            ÀÈÌÒÙ áéíóú ç ñ / 0123456789 (Tabular: 001 998) / € $ £ % / 08:43s
          </p>
        </div>
      </div>

      {/* Technical Spec Sheet */}
      <dl className="grid gap-3 pt-3 border-t border-stone-200 text-xs font-mono">
        <div className="flex justify-between">
          <dt className="text-neutral-500 uppercase tracking-wider">Weights</dt>
          <dd className="text-neutral-900 font-bold">{profile.weights.join(", ")}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500 uppercase tracking-wider">Styles</dt>
          <dd className="text-neutral-900 font-bold">{profile.styles.join(", ")}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500 uppercase tracking-wider">License</dt>
          <dd className="text-neutral-900 font-bold">{profile.licenseName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500 uppercase tracking-wider">Redistribution</dt>
          <dd className="text-neutral-900 font-bold">{profile.licenseStatus === "confirmed" ? "ALLOWED" : "RESTRICTED"}</dd>
        </div>
        <div className="space-y-1 pt-2 border-t border-stone-200">
          <dt className="text-neutral-500 uppercase tracking-wider">Fallback Stack</dt>
          <dd className="text-[11px] text-stone-600 truncate" title={profile.fallbackStack}>{profile.fallbackStack}</dd>
        </div>
      </dl>
    </article>
  )
}
