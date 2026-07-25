export type LayoutDensity = "compact" | "standard" | "spacious"

export type LayoutBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl"

export type ContainerSize = "compact" | "reading" | "standard" | "wide" | "full"

export type LayoutAlignment = "start" | "center" | "end" | "stretch"

export type LayoutPrimitiveName =
  | "shell"
  | "container"
  | "stack"
  | "cluster"
  | "grid"
  | "split"
  | "sidebar"
  | "rail"
  | "stage"

export type LayoutPresetCategory = "editorial" | "workspace" | "command-center" | "broadcast"

export interface ContainerToken {
  name: ContainerSize
  value: string
  usage: string
}

export interface GutterToken {
  name: "compact" | "standard" | "generous" | "cinematic"
  value: string
  usage: string
}

export interface GapToken {
  name: "inline" | "cluster" | "stack" | "grid" | "section"
  value: string
  usage: string
}

export interface GridToken {
  name: "2-cols" | "3-cols" | "4-cols" | "6-cols" | "12-cols"
  columns: number
  usage: string
}

export interface SafeAreaToken {
  name: "interface" | "presentation" | "broadcast" | "cinematic"
  top: string
  bottom: string
  left: string
  right: string
  usage: string
}

export interface LayoutPreset {
  category: LayoutPresetCategory
  name: string
  description: string
  structure: {
    primitives: LayoutPrimitiveName[]
    density: LayoutDensity
    container: ContainerSize
  }
}

export interface LayoutTokens {
  containers: ContainerToken[]
  gutters: GutterToken[]
  gaps: GapToken[]
  grids: GridToken[]
  safeAreas: SafeAreaToken[]
}
