import * as React from "react"
import type { LayoutDensity } from "@/lib/layouts/types"

interface LayoutInspectorProps {
  active?: boolean
  columns?: boolean
  gutters?: boolean
  safeAreas?: boolean
  density?: LayoutDensity
  children?: React.ReactNode
}

export function LayoutInspector({
  active = false,
  columns = false,
  gutters = false,
  safeAreas = false,
  density = "standard",
  children,
}: LayoutInspectorProps) {
  if (!active) return <>{children}</>

  return (
    <div className="relative w-full h-full min-h-0 min-w-0">
      {/* Visual Overlay Grid */}
      <div className="absolute inset-0 pointer-events-none z-40 select-none">
        {/* Gutters visualization */}
        {gutters && (
          <div className="absolute inset-x-0 top-0 bottom-0 flex justify-between px-4 md:px-6 lg:px-8 border-l border-r border-cyan-500/30 bg-cyan-500/5">
            <span className="font-mono text-[8px] text-cyan-600 bg-cyan-100/80 px-1 py-0.5 rounded absolute left-1 top-1">GUTTER</span>
            <span className="font-mono text-[8px] text-cyan-600 bg-cyan-100/80 px-1 py-0.5 rounded absolute right-1 top-1">GUTTER</span>
          </div>
        )}

        {/* 12 columns alignment helper */}
        {columns && (
          <div className="absolute inset-0 grid grid-cols-12 gap-4 px-4 md:px-6 lg:px-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-full bg-red-500/5 border-l border-r border-red-500/20 flex items-start justify-center pt-2">
                <span className="font-mono text-[8px] text-red-500 bg-[#fbfaf6] px-0.5 border border-red-100 rounded">C{i+1}</span>
              </div>
            ))}
          </div>
        )}

        {/* Safe areas visualization */}
        {safeAreas && (
          <div className="absolute inset-6 border border-dashed border-amber-500/30 bg-amber-500/2 flex items-end justify-start p-2">
            <span className="font-mono text-[8px] text-amber-600 bg-amber-100/80 px-1 py-0.5 rounded">TITLE SAFE AREA</span>
          </div>
        )}

        {/* Floating metadata info label */}
        <div className="absolute bottom-2 right-2 bg-stone-900 text-stone-100 font-mono text-[9px] px-2 py-1 rounded shadow-md border border-stone-850">
          INSPECT: {density.toUpperCase()} DENSITY
        </div>
      </div>

      {children}
    </div>
  )
}
