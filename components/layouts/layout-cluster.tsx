import * as React from "react"
import type { LayoutAlignment } from "@/lib/layouts/types"

interface LayoutClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "none" | "inline" | "cluster" | "stack" | "grid"
  align?: LayoutAlignment
  justify?: "start" | "center" | "end" | "between" | "around"
  wrap?: boolean
  children: React.ReactNode
}

export function LayoutCluster({
  gap = "cluster",
  align = "center",
  justify = "start",
  wrap = true,
  children,
  className = "",
  ...props
}: LayoutClusterProps) {
  const gapMap = {
    none: "gap-0",
    inline: "gap-2",
    cluster: "gap-4",
    stack: "gap-6",
    grid: "gap-8",
  }

  const alignMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }

  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  }

  const baseClasses = [
    "flex flex-row",
    wrap ? "flex-wrap" : "flex-nowrap overflow-x-auto",
    gapMap[gap],
    alignMap[align],
    justifyMap[justify],
    className,
  ].filter(Boolean).join(" ")

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}
