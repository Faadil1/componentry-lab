import * as React from "react"

interface LayoutSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode
  children: React.ReactNode
  side?: "left" | "right"
  sidebarWidth?: string
  gap?: "none" | "inline" | "cluster" | "stack" | "grid"
}

export function LayoutSidebar({
  sidebar,
  children,
  side = "left",
  sidebarWidth = "260px",
  gap = "grid",
  className = "",
  style,
  ...props
}: LayoutSidebarProps) {
  const gapMap = {
    none: "gap-0",
    inline: "gap-2",
    cluster: "gap-4",
    stack: "gap-6",
    grid: "gap-8",
  }

  const containerClasses = [
    "flex flex-wrap min-w-0",
    gapMap[gap],
    className,
  ].filter(Boolean).join(" ")

  return (
    <div className={containerClasses} style={style} {...props}>
      {/* Sidebar container */}
      <div
        className={`grow shrink-0 ${side === "left" ? "order-1" : "order-2"}`}
        style={{ flexBasis: sidebarWidth }}
      >
        {sidebar}
      </div>

      {/* Main container */}
      <div className={`grow-[999] shrink min-w-[50%] ${side === "left" ? "order-2" : "order-1"}`}>
        {children}
      </div>
    </div>
  )
}
