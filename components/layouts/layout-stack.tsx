import * as React from "react"
import type { LayoutAlignment } from "@/lib/layouts/types"

interface LayoutStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "none" | "inline" | "cluster" | "stack" | "grid" | "section"
  align?: LayoutAlignment
  separator?: boolean
  children: React.ReactNode
}

export function LayoutStack({
  gap = "stack",
  align = "stretch",
  separator = false,
  children,
  className = "",
  ...props
}: LayoutStackProps) {
  const gapMap = {
    none: "space-y-0",
    inline: "space-y-2",
    cluster: "space-y-4",
    stack: "space-y-6",
    grid: "space-y-8",
    section: "space-y-16",
  }

  const alignMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }

  const baseClasses = [
    "flex flex-col min-w-0",
    gapMap[gap],
    alignMap[align],
    separator ? "divide-y divide-stone-305" : "",
    className,
  ].filter(Boolean).join(" ")

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}
