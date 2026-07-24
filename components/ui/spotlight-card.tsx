"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function subscribePrefersReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", callback)
    return () => mediaQuery.removeEventListener("change", callback)
  } else {
    mediaQuery.addListener(callback)
    return () => mediaQuery.removeListener(callback)
  }
}

function getPrefersReducedMotionSnapshot() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getPrefersReducedMotionServerSnapshot() {
  return false
}

export function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    getPrefersReducedMotionServerSnapshot
  )
}

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spotlightColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  glowIntensity?: number
  disableTilt?: boolean
  reduceMotion?: boolean
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(120, 119, 198, 0.3)",
  borderColor,
  borderWidth = 1,
  borderRadius = 16,
  glowIntensity = 0.15,
  reduceMotion,
  ...props
}: SpotlightCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const prefersReducedMotion = usePrefersReducedMotion() || Boolean(reduceMotion)

  const updatePositionToCenter = React.useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({ x: rect.width / 2, y: rect.height / 2 })
  }, [])

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },
    [prefersReducedMotion]
  )

  const handlePointerEnter = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsHovered(true)
      if (prefersReducedMotion) {
        updatePositionToCenter()
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    },
    [prefersReducedMotion, updatePositionToCenter]
  )

  const handlePointerLeave = React.useCallback(() => {
    setIsHovered(false)
  }, [])

  const handleFocus = React.useCallback(() => {
    setIsFocused(true)
    updatePositionToCenter()
  }, [updatePositionToCenter])

  const handleBlur = React.useCallback(() => {
    setIsFocused(false)
  }, [])

  const active = isHovered || isFocused

  return (
    <div
      ref={containerRef}
      tabIndex={props.tabIndex ?? 0}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerDown={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "relative overflow-hidden bg-gradient-to-b",
        "from-neutral-50 to-white",
        "dark:from-neutral-950 dark:to-neutral-900",
        "transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
        className
      )}
      style={{
        borderRadius: `${borderRadius}px`,
      }}
      {...props}
    >
      {/* Gradient border */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          borderRadius: `${borderRadius}px`,
          padding: `${borderWidth}px`,
          background: borderColor
            ? borderColor
            : `conic-gradient(
                from 225deg,
                rgba(120, 119, 198, 0.9),
                rgba(120, 119, 198, 0.1) 25%,
                rgba(255, 255, 255, 0.15) 50%,
                rgba(120, 119, 198, 0.1) 75%,
                rgba(120, 119, 198, 0.9)
              )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          opacity: active ? 1 : 0.4,
        }}
      />

      {/* Spotlight effect */}
      <div
        className={cn(
          "absolute pointer-events-none",
          prefersReducedMotion ? "transition-opacity duration-500" : "transition-opacity duration-300"
        )}
        style={{
          left: position.x,
          top: position.y,
          width: "400px",
          height: "400px",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 70%)`,
          opacity: active ? glowIntensity * 5 : 0,
        }}
      />

      {/* Border glow on hover/focus */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          borderRadius: `${borderRadius}px`,
          opacity: active ? 0.5 : 0,
          boxShadow: `inset 0 0 30px rgba(120, 119, 198, 0.1), 0 0 30px rgba(120, 119, 198, 0.1)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export interface SpotlightCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SpotlightCardContent({
  children,
  className,
  ...props
}: SpotlightCardContentProps) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  )
}

export interface SpotlightCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SpotlightCardHeader({
  children,
  className,
  ...props
}: SpotlightCardHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6 pb-0", className)} {...props}>
      {children}
    </div>
  )
}

export interface SpotlightCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function SpotlightCardTitle({
  children,
  className,
  ...props
}: SpotlightCardTitleProps) {
  return (
    <h3
      className={cn(
        "text-xl font-semibold leading-none tracking-tight text-neutral-900 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export interface SpotlightCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function SpotlightCardDescription({
  children,
  className,
  ...props
}: SpotlightCardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-neutral-600 dark:text-neutral-400", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export interface MultiSpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  colors?: string[]
  borderRadius?: number
  reduceMotion?: boolean
}

export function MultiSpotlightCard({
  children,
  className,
  colors = [
    "rgba(120, 119, 198, 0.4)",
    "rgba(255, 77, 77, 0.3)",
    "rgba(77, 255, 174, 0.3)",
  ],
  borderRadius = 16,
  reduceMotion,
  ...props
}: MultiSpotlightCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const prefersReducedMotion = usePrefersReducedMotion() || Boolean(reduceMotion)

  const updatePositionToCenter = React.useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({ x: rect.width / 2, y: rect.height / 2 })
  }, [])

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },
    [prefersReducedMotion]
  )

  const active = isHovered || isFocused

  return (
    <div
      ref={containerRef}
      tabIndex={props.tabIndex ?? 0}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        setIsHovered(true)
        if (prefersReducedMotion) updatePositionToCenter()
      }}
      onPointerDown={() => {
        setIsHovered(true)
        updatePositionToCenter()
      }}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={() => {
        setIsFocused(true)
        updatePositionToCenter()
      }}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative overflow-hidden bg-white dark:bg-neutral-950",
        "border border-neutral-200 dark:border-neutral-800",
        "transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
        className
      )}
      style={{ borderRadius: `${borderRadius}px` }}
      {...props}
    >
      {/* Multiple spotlight layers */}
      {colors.map((color, index) => (
        <div
          key={index}
          className="absolute pointer-events-none transition-opacity duration-500"
          style={{
            left: prefersReducedMotion ? "50%" : position.x + (index - 1) * 40,
            top: prefersReducedMotion ? "50%" : position.y + (index - 1) * 40,
            width: "320px",
            height: "320px",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            opacity: active ? 0.95 : 0,
            filter: "blur(35px)",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export interface BeamSpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  beamColor?: string
  beamWidth?: number
  borderRadius?: number
  reduceMotion?: boolean
}

export function BeamSpotlightCard({
  children,
  className,
  beamColor = "rgba(120, 119, 198, 0.5)",
  beamWidth = 200,
  borderRadius = 16,
  reduceMotion,
  ...props
}: BeamSpotlightCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const prefersReducedMotion = usePrefersReducedMotion() || Boolean(reduceMotion)

  const updatePositionToCenter = React.useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({ x: rect.width / 2, y: rect.height / 2 })
  }, [])

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },
    [prefersReducedMotion]
  )

  const active = isHovered || isFocused

  return (
    <div
      ref={containerRef}
      tabIndex={props.tabIndex ?? 0}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        setIsHovered(true)
        if (prefersReducedMotion) updatePositionToCenter()
      }}
      onPointerDown={() => {
        setIsHovered(true)
        updatePositionToCenter()
      }}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={() => {
        setIsFocused(true)
        updatePositionToCenter()
      }}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative overflow-hidden bg-white dark:bg-neutral-950",
        "border border-neutral-200 dark:border-neutral-800",
        "transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
        className
      )}
      style={{ borderRadius: `${borderRadius}px` }}
      {...props}
    >
      {/* Vertical beam */}
      <div
        className="absolute pointer-events-none transition-all duration-150"
        style={{
          left: (prefersReducedMotion ? position.x : position.x) - beamWidth / 2,
          top: 0,
          width: `${beamWidth}px`,
          height: "100%",
          background: `linear-gradient(90deg, transparent, ${beamColor}, transparent)`,
          opacity: active ? 0.6 : 0,
          filter: "blur(20px)",
        }}
      />

      {/* Horizontal beam */}
      <div
        className="absolute pointer-events-none transition-all duration-150"
        style={{
          left: 0,
          top: (prefersReducedMotion ? position.y : position.y) - beamWidth / 2,
          width: "100%",
          height: `${beamWidth}px`,
          background: `linear-gradient(180deg, transparent, ${beamColor}, transparent)`,
          opacity: active ? 0.4 : 0,
          filter: "blur(20px)",
        }}
      />

      {/* Intersection glow */}
      <div
        className="absolute pointer-events-none transition-all duration-150"
        style={{
          left: position.x,
          top: position.y,
          width: "120px",
          height: "120px",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${beamColor} 0%, transparent 70%)`,
          opacity: active ? 1 : 0,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export interface GradientFollowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  gradientColors?: [string, string, string]
  borderRadius?: number
  reduceMotion?: boolean
}

export function GradientFollowCard({
  children,
  className,
  gradientColors = ["#7877c6", "#5eead4", "#f472b6"],
  borderRadius = 16,
  reduceMotion,
  ...props
}: GradientFollowCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const prefersReducedMotion = usePrefersReducedMotion() || Boolean(reduceMotion)

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setPosition({ x, y })
    },
    [prefersReducedMotion]
  )

  const active = isHovered || isFocused

  return (
    <div
      ref={containerRef}
      tabIndex={props.tabIndex ?? 0}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerDown={() => {
        setIsHovered(true)
        setPosition({ x: 50, y: 50 })
      }}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={() => {
        setIsFocused(true)
        setPosition({ x: 50, y: 50 })
      }}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50",
        className
      )}
      style={{ borderRadius: `${borderRadius}px` }}
      {...props}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `
            radial-gradient(
              600px circle at ${position.x}% ${position.y}%,
              ${gradientColors[0]}40,
              transparent 40%
            ),
            radial-gradient(
              400px circle at ${position.x + 10}% ${position.y - 10}%,
              ${gradientColors[1]}30,
              transparent 40%
            ),
            radial-gradient(
              300px circle at ${position.x - 10}% ${position.y + 10}%,
              ${gradientColors[2]}20,
              transparent 40%
            )
          `,
          opacity: active ? 1 : 0.3,
        }}
      />

      {/* Base background */}
      <div
        className="absolute inset-0 bg-white/90 dark:bg-neutral-950/90"
        style={{ borderRadius: `${borderRadius}px` }}
      />

      {/* Border */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          borderRadius: `${borderRadius}px`,
          border: "1px solid",
          borderColor: active
            ? "rgba(255, 255, 255, 0.25)"
            : "rgba(255, 255, 255, 0.1)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export interface TiltSpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxTilt?: number
  perspective?: number
  scale?: number
  borderRadius?: number
  glareOpacity?: number
  spotlightColor?: string
  reduceMotion?: boolean
}

export function TiltSpotlightCard({
  children,
  className,
  maxTilt = 8,
  perspective = 1000,
  scale = 1.015,
  borderRadius = 16,
  glareOpacity = 0.2,
  spotlightColor = "rgba(120, 119, 198, 0.3)",
  reduceMotion,
  ...props
}: TiltSpotlightCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [transform, setTransform] = React.useState({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  })
  const [glarePosition, setGlarePosition] = React.useState({ x: 50, y: 50 })
  const [spotlightPosition, setSpotlightPosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const prefersReducedMotion = usePrefersReducedMotion() || Boolean(reduceMotion)

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const rotateY = ((mouseX - centerX) / centerX) * maxTilt
      const rotateX = -((mouseY - centerY) / centerY) * maxTilt

      setTransform({ rotateX, rotateY, scale })
      setGlarePosition({
        x: (mouseX / rect.width) * 100,
        y: (mouseY / rect.height) * 100,
      })
      setSpotlightPosition({
        x: mouseX,
        y: mouseY,
      })
    },
    [maxTilt, scale, prefersReducedMotion]
  )

  const handlePointerLeave = React.useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 })
    setIsHovered(false)
  }, [])

  const active = isHovered || isFocused

  return (
    <div
      ref={containerRef}
      tabIndex={props.tabIndex ?? 0}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerDown={() => {
        setIsHovered(true)
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setSpotlightPosition({ x: rect.width / 2, y: rect.height / 2 })
          setGlarePosition({ x: 50, y: 50 })
        }
      }}
      onPointerLeave={handlePointerLeave}
      onFocus={() => {
        setIsFocused(true)
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setSpotlightPosition({ x: rect.width / 2, y: rect.height / 2 })
          setGlarePosition({ x: 50, y: 50 })
        }
      }}
      onBlur={() => {
        setIsFocused(false)
        setTransform({ rotateX: 0, rotateY: 0, scale: 1 })
      }}
      className={cn(
        "relative overflow-hidden bg-white dark:bg-neutral-950",
        "border border-neutral-200 dark:border-neutral-800",
        "transition-[border-color] duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
        active && "border-neutral-300 dark:border-neutral-700",
        className
      )}
      style={{
        borderRadius: `${borderRadius}px`,
        perspective: `${perspective}px`,
        transform: prefersReducedMotion
          ? "none"
          : `
          perspective(${perspective}px)
          rotateX(${transform.rotateX}deg)
          rotateY(${transform.rotateY}deg)
          scale(${transform.scale})
        `,
        transition: prefersReducedMotion
          ? "none"
          : active
          ? "transform 0.1s ease-out"
          : "transform 0.4s ease-out",
      }}
      {...props}
    >
      {/* Glare effect */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(
              circle at ${glarePosition.x}% ${glarePosition.y}%,
              rgba(255, 255, 255, ${glareOpacity}) 0%,
              transparent 50%
            )
          `,
          opacity: active ? 1 : 0,
        }}
      />

      {/* Spotlight effect */}
      <div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: spotlightPosition.x,
          top: spotlightPosition.y,
          width: "400px",
          height: "400px",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 70%)`,
          opacity: active ? 0.45 : 0,
          filter: "blur(20px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
