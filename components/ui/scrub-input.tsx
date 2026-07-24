"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ScrubInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  label: string
  min?: number
  max?: number
  step?: number
  scrubSensitivity?: number
  formatValue?: (value: number) => string
  reduceMotion?: boolean
}

function subscribePrefersReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", callback)
    return () => mediaQuery.removeEventListener("change", callback)
  }

  mediaQuery.addListener(callback)
  return () => mediaQuery.removeListener(callback)
}

function getPrefersReducedMotionSnapshot() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getPrefersReducedMotionServerSnapshot() {
  return false
}

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    getPrefersReducedMotionServerSnapshot
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function snapToStep(value: number, min: number, max: number, step: number) {
  const safeStep = step > 0 ? step : 1
  const snapped = min + Math.round((value - min) / safeStep) * safeStep
  const precision = Math.max(0, `${safeStep}`.split(".")[1]?.length ?? 0)
  return Number(clamp(snapped, min, max).toFixed(precision))
}

export function ScrubInput({
  value: controlledValue,
  defaultValue = 0,
  onChange,
  label,
  min = 0,
  max = 100,
  step = 1,
  scrubSensitivity = 1,
  formatValue = (value) => String(value),
  reduceMotion,
  className,
  ...props
}: ScrubInputProps) {
  const prefersReducedMotion = usePrefersReducedMotion() || Boolean(reduceMotion)
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const [isDragging, setIsDragging] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dragStartRef = React.useRef({ x: 0, value: defaultValue })

  const isControlled = controlledValue !== undefined
  const rawValue = isControlled ? controlledValue : uncontrolledValue
  const value = snapToStep(rawValue, min, max, step)
  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0
  const fillWidth = clamp(percentage, 0, 100)
  const displayValue = formatValue(value)

  const commitValue = React.useCallback(
    (nextValue: number) => {
      const next = snapToStep(nextValue, min, max, step)
      if (!isControlled) setUncontrolledValue(next)
      onChange?.(next)
    },
    [isControlled, max, min, onChange, step]
  )

  const updateValueFromDelta = React.useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const pixelsPerStep = 8 / Math.max(0.2, scrubSensitivity)
      const deltaSteps = (clientX - dragStartRef.current.x) / pixelsPerStep
      commitValue(dragStartRef.current.value + deltaSteps * step)
    },
    [commitValue, scrubSensitivity, step]
  )

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return
    event.preventDefault()
    containerRef.current?.setPointerCapture(event.pointerId)
    dragStartRef.current = { x: event.clientX, value }
    setIsDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    event.preventDefault()
    updateValueFromDelta(event.clientX)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (containerRef.current?.hasPointerCapture(event.pointerId)) {
      containerRef.current.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const largeStep = step * 10
    const keyMap: Record<string, number> = {
      ArrowLeft: -step,
      ArrowDown: -step,
      ArrowRight: step,
      ArrowUp: step,
      PageDown: -largeStep,
      PageUp: largeStep,
      Home: min - value,
      End: max - value,
    }

    const delta = keyMap[event.key]
    if (delta === undefined) return
    event.preventDefault()
    commitValue(value + delta)
  }

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={displayValue}
      className={cn(
        "relative h-12 w-full max-w-[380px] cursor-ew-resize overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-950 shadow-sm outline-none select-none touch-pan-y group",
        "focus-visible:ring-2 focus-visible:ring-zinc-950/70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus-visible:ring-zinc-50/70",
        !prefersReducedMotion && "transition-all active:scale-[0.99]",
        isDragging && "[&_*]:select-none ring-2 ring-fuchsia-400/60 border-fuchsia-400/60 shadow-lg shadow-fuchsia-500/10",
        className
      )}
      style={{ userSelect: isDragging ? "none" : undefined }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Progress track fill */}
      <div
        className={cn(
          "absolute left-0 top-0 flex h-full items-center justify-end rounded-xl border-r border-zinc-300/80 bg-white pr-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:border-fuchsia-500/30 dark:bg-zinc-800/95 dark:shadow-none",
          isDragging || prefersReducedMotion ? "transition-none" : "transition-[width] duration-200 ease-out"
        )}
        style={{ width: `${fillWidth}%` }}
        aria-hidden="true"
      >
        {/* Visible Handle Grip Pill */}
        <div className="flex h-6 w-3.5 items-center justify-center rounded-sm bg-zinc-400/60 dark:bg-fuchsia-400/60 text-[9px] font-mono font-bold tracking-tighter opacity-80 group-hover:opacity-100">
          <span className="h-3 w-0.5 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Label and Value Display */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between gap-4 px-4.5">
        <span className="truncate text-xs font-semibold uppercase tracking-wider text-black/70 dark:text-white/70 flex items-center gap-1.5">
          {label}
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-normal">↔</span>
        </span>
        <span className="font-mono text-sm font-bold tabular-nums tracking-tight text-black/85 dark:text-white/90">
          {displayValue}
        </span>
      </div>
    </div>
  )
}
