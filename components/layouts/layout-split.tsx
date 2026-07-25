import * as React from "react"
import type { LayoutAlignment } from "@/lib/layouts/types"

interface LayoutSplitProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: "1:1" | "1:2" | "2:1" | "1:3" | "3:1"
  reverse?: boolean
  align?: LayoutAlignment
  gap?: "none" | "inline" | "cluster" | "stack" | "grid"
  children: [React.ReactNode, React.ReactNode]
}

export function LayoutSplit({
  ratio = "1:1",
  reverse = false,
  align = "stretch",
  gap = "grid",
  children,
  className = "",
  ...props
}: LayoutSplitProps) {
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

  const ratioMap = {
    "1:1": "grid-cols-1 md:grid-cols-2",
    "1:2": "grid-cols-1 md:grid-cols-[1fr_2fr]",
    "2:1": "grid-cols-1 md:grid-cols-[2fr_1fr]",
    "1:3": "grid-cols-1 md:grid-cols-[1fr_3fr]",
    "3:1": "grid-cols-1 md:grid-cols-[3fr_1fr]",
  }

  const splitClasses = [
    "grid min-w-0",
    ratioMap[ratio],
    gapMap[gap],
    alignMap[align],
    className,
  ].filter(Boolean).join(" ")

  const [first, second] = children

  return (
    <div className={splitClasses} {...props}>
      <div className={reverse ? "order-1 md:order-2" : "order-1"}>
        {first}
      </div>
      <div className={reverse ? "order-2 md:order-1" : "order-2"}>
        {second}
      </div>
    </div>
  )
}
