export interface OriginkitCatalogEntry {
  name: string
  displayName: string
  category: string
  description: string
  tags: string[]
  variants: string[]
  dependencies: string[]
}

export interface OriginkitCatalogSnapshotInput {
  schemaVersion: number
  connectorIdentity: string
  connectorRepository: string
  connectorRevision: string
  connectorLicense: string
  catalogSourceKind: string
  catalogEntries: OriginkitCatalogEntry[]
}

export interface OriginkitCatalogSnapshot extends OriginkitCatalogSnapshotInput {
  catalogEntries: OriginkitCatalogEntry[]
  catalogFingerprint: string
}

export interface OriginkitCatalogValidationResult {
  valid: boolean
  errors: string[]
}
