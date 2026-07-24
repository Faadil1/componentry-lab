"use client"

import * as React from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ScrollChoreographyProps {
  className?: string
  images: {
    topLeft: string
    topRight: string
    bottomLeft: string
    bottomRight: string
  }
  reduceMotion?: boolean
}

export function ScrollChoreography({
  className,
  images,
  reduceMotion = false,
}: ScrollChoreographyProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const shouldReduceMotion = prefersReducedMotion || reduceMotion

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 50,
    mass: 1.2,
    restDelta: 0.001,
  })

  // Phase positions relative to center
  const xLeft = "-22vw"
  const xRight = "22vw"
  const yTop = "-15vh"
  const yBottom = "15vh"

  // Phase 1: 0 - 0.35 (Diagonal movement - Context to Mechanism)
  // Phase 2: 0.35 - 0.68 (Stack alignment to center - Pivot)
  // Phase 3: 0.68 - 1.0 (Hero expands to full frame - Final Consequence)

  const tlX = useTransform(smoothProgress, [0, 0.35, 0.4, 0.68, 1], [xLeft, xLeft, xLeft, "0vw", "0vw"])
  const tlY = useTransform(smoothProgress, [0, 0.35, 0.4, 0.68, 1], [yTop, yBottom, yBottom, "0vh", "0vh"])

  const brX = useTransform(smoothProgress, [0, 0.35, 0.4, 0.68, 1], [xRight, xRight, xRight, "0vw", "0vw"])
  const brY = useTransform(smoothProgress, [0, 0.35, 0.4, 0.68, 1], [yBottom, yTop, yTop, "0vh", "0vh"])

  const blX = useTransform(smoothProgress, [0, 0.35, 0.4, 0.68, 1], [xLeft, xLeft, xLeft, "0vw", "0vw"])
  const blY = useTransform(smoothProgress, [0, 0.35, 0.4, 0.68, 1], [yBottom, yBottom, yBottom, "0vh", "0vh"])

  const trX = useTransform(smoothProgress, [0, 0.35, 0.4, 0.68, 1], [xRight, xRight, xRight, "0vw", "0vw"])
  const trY = useTransform(smoothProgress, [0, 0.35, 0.4, 0.68, 1], [yTop, yTop, yTop, "0vh", "0vh"])

  // Top Right (Hero) scaling/expansion properties
  const heroWidth = useTransform(smoothProgress, [0.68, 0.72, 0.9, 1], ["36vw", "36vw", "100vw", "100vw"])
  const heroHeight = useTransform(smoothProgress, [0.68, 0.72, 0.9, 1], ["25vh", "25vh", "100vh", "100vh"])

  // Opacity fading for underlying panels as hero expands
  const underImagesOpacity = useTransform(smoothProgress, [0.72, 0.85], [1, 0])

  const baseImageClasses =
    "absolute left-1/2 top-1/2 w-[36vw] h-[25vh] overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl will-change-transform"

  if (shouldReduceMotion) {
    return (
      <div ref={containerRef} className={cn("grid gap-4 md:grid-cols-4 p-4", className)}>
        {[
          [images.topLeft, "01 // Context Panel"],
          [images.bottomLeft, "02 // Mechanism Panel"],
          [images.bottomRight, "03 // Pivot Panel"],
          [images.topRight, "04 // Final Hero Proof"],
        ].map(([src, label]) => (
          <div
            key={label}
            role="img"
            aria-label={label}
            className="min-h-[220px] rounded-xl border border-stone-800 bg-cover bg-center shadow-xl p-4 flex flex-col justify-end"
            style={{ backgroundImage: `url(${src})` }}
          >
            <span className="inline-block self-start rounded bg-neutral-950/90 border border-white/20 px-2 py-1 font-mono text-[10px] font-bold text-cyan-300">
              {label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("relative h-[280vh] w-full", className)}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0c0b0a]">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Top Left Image: 01 Context */}
          <motion.div
            style={{ x: tlX, y: tlY, opacity: underImagesOpacity }}
            className={cn(baseImageClasses, "z-10")}
          >
            <div
              role="img"
              aria-label="01 // Context Panel"
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${images.topLeft})` }}
            />
          </motion.div>

          {/* Bottom Right Image: 03 Pivot */}
          <motion.div
            style={{ x: brX, y: brY, opacity: underImagesOpacity }}
            className={cn(baseImageClasses, "z-20")}
          >
            <div
              role="img"
              aria-label="03 // Pivot Panel"
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${images.bottomRight})` }}
            />
          </motion.div>

          {/* Bottom Left Image: 02 Mechanism */}
          <motion.div
            style={{ x: blX, y: blY, opacity: underImagesOpacity }}
            className={cn(baseImageClasses, "z-30")}
          >
            <div
              role="img"
              aria-label="02 // Mechanism Panel"
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${images.bottomLeft})` }}
            />
          </motion.div>

          {/* Top Right Image: 04 Final Hero Proof (Expands to full frame) */}
          <motion.div
            style={{
              x: trX,
              y: trY,
              width: heroWidth,
              height: heroHeight,
            }}
            className={cn(baseImageClasses, "z-40 origin-center bg-stone-900 border-cyan-500/30")}
          >
            <div
              role="img"
              aria-label="04 // Final Hero Proof"
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${images.topRight})` }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
