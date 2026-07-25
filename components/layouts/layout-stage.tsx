import * as React from "react"

interface LayoutStageProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: "16:9" | "4:3" | "1:1" | "portrait"
  safeArea?: "off" | "interface" | "broadcast"
  theme?: "light" | "dark" | "cinematic"
  titleLabel?: string
  lowerThird?: string
  children: React.ReactNode
}

export function LayoutStage({
  ratio = "16:9",
  safeArea = "off",
  theme = "cinematic",
  titleLabel,
  lowerThird,
  children,
  className = "",
  ...props
}: LayoutStageProps) {
  const ratioMap = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
    portrait: "aspect-[9/16]",
  }

  const themeMap = {
    light: "bg-[#fbfaf6] text-neutral-900 border-stone-300",
    dark: "bg-[#1a1816] text-stone-100 border-stone-800",
    cinematic: "bg-[#0a0a09] text-stone-100 border-stone-900",
  }

  const safeAreaOverlayMap = {
    off: "",
    interface: "border-16 border-dashed border-cyan-500/20",
    broadcast: "border-48 border-dashed border-amber-500/25",
  }

  const stageClasses = [
    "relative overflow-hidden w-full rounded-xl border flex flex-col justify-between p-6 shadow-md transition-all duration-300",
    ratioMap[ratio],
    themeMap[theme],
    className,
  ].filter(Boolean).join(" ")

  return (
    <div className={stageClasses} {...props}>
      {/* Title-safe overlay display */}
      {safeArea !== "off" && (
        <div className={`absolute inset-0 pointer-events-none rounded ${safeAreaOverlayMap[safeArea]}`} />
      )}

      {/* Header element */}
      <div className="z-10 flex justify-between items-start">
        {titleLabel && (
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-stone-900/60 text-stone-300 px-2 py-0.5 rounded backdrop-blur-xs">
            {titleLabel}
          </span>
        )}
        <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase">
          {ratio} STAGE
        </span>
      </div>

      {/* Central content slot */}
      <div className="z-10 flex-1 flex items-center justify-center min-w-0">
        {children}
      </div>

      {/* Footer lower third */}
      {lowerThird && (
        <div className="z-10 mt-auto bg-stone-900/70 border border-stone-850 p-2.5 rounded backdrop-blur-xs max-w-[280px]">
          <p className="font-mono text-[10px] text-cyan-300 font-bold tracking-wider">{lowerThird}</p>
        </div>
      )}
    </div>
  )
}
