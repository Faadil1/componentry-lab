export type ComponentryLabStorageMode = "local-file" | "postgres"

export function getComponentryLabStorageMode(): ComponentryLabStorageMode {
  const mode = process.env.COMPONENTRY_LAB_STORAGE_MODE
  if (mode === "postgres" || mode === "local-file") {
    return mode
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "COMPONENTRY_LAB_STORAGE_MODE must be set to 'postgres' in production. Falling back to local-file is not allowed."
    )
  }

  return "local-file"
}

export function isDurableStorageRequired(): boolean {
  return getComponentryLabStorageMode() === "postgres"
}

