"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SplitFlapRow {
  label: string
  value: string
}

export interface SplitFlapDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: SplitFlapRow[]
  text?: string
  columns?: number
  size?: "sm" | "md" | "lg" | "xl"
  accentColor?: string
  showIndicators?: boolean
  staggerDelay?: number
  flipSpeed?: number
  reduceMotion?: boolean
}

const CHARACTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$.,!?:;+-=%&#@"
const KEYFRAMES_ID = "split-flap-keyframes"

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

function getNextChar(current: string): string {
  const index = CHARACTERS.indexOf(current)
  if (index === -1 || index >= CHARACTERS.length - 1) return CHARACTERS[0] ?? " "
  return CHARACTERS[index + 1] ?? " "
}

function useSplitFlapKeyframes(disabled: boolean) {
  React.useEffect(() => {
    if (disabled || typeof document === "undefined") return
    if (document.getElementById(KEYFRAMES_ID)) return

    const style = document.createElement("style")
    style.id = KEYFRAMES_ID
    style.textContent = `
      @keyframes flapTopDown {
        0% { transform: rotateX(0deg); }
        100% { transform: rotateX(-90deg); }
      }
      @keyframes flapBottomUp {
        0% { transform: rotateX(90deg); }
        100% { transform: rotateX(0deg); }
      }
    `
    document.head.appendChild(style)

    return () => {
      const element = document.getElementById(KEYFRAMES_ID)
      if (element) element.remove()
    }
  }, [disabled])
}

function FlapCell({
  targetChar,
  size = "md",
  delay = 0,
  flipSpeed = 35,
  reduceMotion = false,
}: {
  targetChar: string
  size?: "sm" | "md" | "lg" | "xl"
  delay?: number
  flipSpeed?: number
  reduceMotion?: boolean
}) {
  const target = targetChar.toUpperCase()
  const [displayChar, setDisplayChar] = React.useState(target)
  const [isFlipping, setIsFlipping] = React.useState(false)
  const [flipPhase, setFlipPhase] = React.useState<"idle" | "top-down" | "bottom-up">("idle")
  const [previousChar, setPreviousChar] = React.useState(target)
  const timersRef = React.useRef<Array<ReturnType<typeof setTimeout>>>([])
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current = []
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const schedule = React.useCallback((callback: () => void, timeout: number) => {
    const timer = setTimeout(callback, timeout)
    timersRef.current.push(timer)
  }, [])

  React.useEffect(() => {
    clearTimers()

    if (reduceMotion) {
      return clearTimers
    }

    setDisplayChar((current) => {
      if (current === target) return current

      schedule(() => {
        setIsFlipping(true)
        intervalRef.current = setInterval(() => {
          setDisplayChar((previous) => {
            const next = getNextChar(previous)
            setPreviousChar(previous)
            setFlipPhase("top-down")
            schedule(() => setFlipPhase("bottom-up"), flipSpeed * 0.4)
            schedule(() => setFlipPhase("idle"), flipSpeed * 0.8)

            if (next === target && intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
              schedule(() => {
                setIsFlipping(false)
                setFlipPhase("idle")
              }, flipSpeed)
            }

            return next
          })
        }, flipSpeed)
      }, delay)

      return current
    })

    return clearTimers
  }, [clearTimers, delay, flipSpeed, reduceMotion, schedule, target])

  const sizeMap = {
    sm: "h-[38px] w-[26px] text-[16px]",
    md: "h-[54px] w-[38px] text-[24px]",
    lg: "h-[72px] w-[52px] text-[34px]",
    xl: "h-[85px] w-[58px] text-[40px] sm:h-[110px] sm:w-[76px] sm:text-[54px] md:h-[135px] md:w-[94px] md:text-[68px]",
  }

  return (
    <span
      className={cn("relative inline-block select-none font-mono font-bold tabular-nums", sizeMap[size])}
      style={{ perspective: reduceMotion ? undefined : "400px" }}
      aria-hidden="true"
    >
      <span className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-[4px] bg-[#1c1c1c]">
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[48%] text-[#f0eee9] drop-shadow-sm">
          {reduceMotion ? target : displayChar}
        </span>
      </span>

      <span className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-[4px] bg-[#111]">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[48%] text-[#d8d6d0] drop-shadow-sm">
          {reduceMotion ? target : displayChar}
        </span>
      </span>

      {isFlipping && flipPhase === "top-down" && (
        <span
          className="absolute inset-x-0 top-0 z-10 h-1/2 overflow-hidden rounded-t-[4px] bg-[#222]"
          style={{ transformOrigin: "bottom center", animation: `flapTopDown ${flipSpeed * 0.4}ms ease-in forwards` }}
        >
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[48%] text-[#f0eee9]">
            {previousChar}
          </span>
        </span>
      )}

      {isFlipping && flipPhase === "bottom-up" && (
        <span
          className="absolute inset-x-0 bottom-0 z-10 h-1/2 overflow-hidden rounded-b-[4px] bg-[#111]"
          style={{ transformOrigin: "top center", animation: `flapBottomUp ${flipSpeed * 0.4}ms ease-out forwards` }}
        >
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[48%] text-[#d8d6d0]">
            {displayChar}
          </span>
        </span>
      )}

      <span className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-black shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
      <span className="pointer-events-none absolute inset-0 z-20 rounded-[4px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),inset_0_-1px_2px_rgba(0,0,0,0.4)]" />
    </span>
  )
}

function IndicatorStrip({ color = "#22c55e", size = "md" }: { color?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const heightMap = {
    sm: "h-[38px]",
    md: "h-[54px]",
    lg: "h-[72px]",
    xl: "h-[85px] sm:h-[110px] md:h-[135px]",
  }

  return (
    <span
      className={cn("w-2 shrink-0 self-stretch rounded-[3px]", heightMap[size])}
      style={{
        background: `linear-gradient(180deg, ${color} 0%, ${color}99 48%, ${color}66 100%)`,
        boxShadow: `0 0 12px ${color}66, inset 0 1px 2px rgba(255,255,255,0.3)`,
      }}
      aria-hidden="true"
    />
  )
}

function FlapRow({
  text,
  columns,
  size = "md",
  accentColor = "#22c55e",
  showIndicators = true,
  staggerDelay = 30,
  flipSpeed = 35,
  reduceMotion = false,
}: {
  text: string
  columns: number
  size?: "sm" | "md" | "lg" | "xl"
  accentColor?: string
  showIndicators?: boolean
  staggerDelay?: number
  flipSpeed?: number
  reduceMotion?: boolean
}) {
  const padded = text.toUpperCase().padEnd(columns, " ").slice(0, columns)

  return (
    <span className="flex items-center gap-2">
      {showIndicators && <IndicatorStrip color={accentColor} size={size} />}
      <span className="flex gap-1 overflow-hidden">
        {padded.split("").map((char, index) => (
          <FlapCell
            key={`${index}-${char}`}
            targetChar={char}
            size={size}
            delay={index * staggerDelay}
            flipSpeed={flipSpeed}
            reduceMotion={reduceMotion}
          />
        ))}
      </span>
      {showIndicators && <IndicatorStrip color={accentColor} size={size} />}
    </span>
  )
}

function getAccessibleLabel(rows?: SplitFlapRow[], text?: string) {
  if (text) return text
  return (rows ?? []).map((row) => `${row.label} ${row.value}`).join(", ")
}

export function SplitFlapDisplay({
  rows,
  text,
  columns = 14,
  size = "md",
  accentColor = "#22c55e",
  showIndicators = true,
  staggerDelay = 30,
  flipSpeed = 35,
  reduceMotion,
  className,
  ...props
}: SplitFlapDisplayProps) {
  const prefersReducedMotion = usePrefersReducedMotion() || Boolean(reduceMotion)
  useSplitFlapKeyframes(prefersReducedMotion)

  const boardClassName = cn(
    "inline-flex max-w-full flex-col gap-2.5 overflow-x-auto rounded-2xl bg-[#080808] p-4 sm:p-6 text-white shadow-[0_25px_70px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10",
    className
  )

  if (text && !rows) {
    return (
      <div aria-label={getAccessibleLabel(undefined, text)} role="img" tabIndex={0} className={boardClassName} {...props}>
        <FlapRow
          text={text}
          columns={columns}
          size={size}
          accentColor={accentColor}
          showIndicators={showIndicators}
          staggerDelay={staggerDelay}
          flipSpeed={flipSpeed}
          reduceMotion={prefersReducedMotion}
        />
      </div>
    )
  }

  return (
    <div aria-label={getAccessibleLabel(rows, text)} role="img" tabIndex={0} className={boardClassName} {...props}>
      {(rows ?? []).map((row, index) => {
        const spacing = " ".repeat(Math.max(1, columns - row.label.length - row.value.length))
        const combined = `${row.label}${spacing}${row.value}`

        return (
          <FlapRow
            key={`${row.label}-${index}`}
            text={combined}
            columns={columns}
            size={size}
            accentColor={accentColor}
            showIndicators={showIndicators}
            staggerDelay={staggerDelay}
            flipSpeed={flipSpeed}
            reduceMotion={prefersReducedMotion}
          />
        )
      })}
    </div>
  )
}
