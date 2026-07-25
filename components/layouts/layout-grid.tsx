import * as React from "react"

interface LayoutGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 6 | 12
  minWidth?: string
  gap?: "none" | "inline" | "cluster" | "stack" | "grid"
  children: React.ReactNode
}

export function LayoutGrid({
  columns,
  minWidth,
  gap = "grid",
  children,
  className = "",
  style,
  ...props
}: LayoutGridProps) {
  const gapMap = {
    none: "gap-0",
    inline: "gap-2",
    cluster: "gap-4",
    stack: "gap-6",
    grid: "gap-8",
  }

  // If minWidth is specified, we build an autogrid with CSS Grid
  const customStyle: React.CSSProperties = minWidth
    ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minWidth}, 100%), 1fr))`,
        ...style,
      }
    : { ...style }

  const gridClasses = [
    "grid",
    gapMap[gap],
    !minWidth && columns ? `grid-cols-1 md:grid-cols-${columns}` : "",
    className,
  ].filter(Boolean).join(" ")

  return (
    <div className={gridClasses} style={customStyle} {...props}>
      {children}
    </div>
  )
}
