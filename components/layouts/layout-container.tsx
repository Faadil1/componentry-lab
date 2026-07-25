import * as React from "react"
import type { ContainerSize } from "@/lib/layouts/types"

interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize
  centered?: boolean
  breakout?: boolean
  children: React.ReactNode
}

export function LayoutContainer({
  size = "standard",
  centered = true,
  breakout = false,
  children,
  className = "",
  style,
  ...props
}: LayoutContainerProps) {
  // Map sizes to tailwind classes
  const sizeMap: Record<ContainerSize, string> = {
    compact: "max-w-[480px]",
    reading: "max-w-[680px]",
    standard: "max-w-[1024px]",
    wide: "max-w-[1440px]",
    full: "max-w-full",
  }

  const containerClasses = [
    "w-full px-4 md:px-6 lg:px-8",
    centered ? "mx-auto" : "",
    breakout ? "md:-mx-4 lg:-mx-8 max-w-none" : sizeMap[size],
    className,
  ].filter(Boolean).join(" ")

  return (
    <div className={containerClasses} style={style} {...props}>
      {children}
    </div>
  )
}
