import { requireCanonicalWriteAccess, type CanonicalSessionLoader, type CanonicalWriteAuthState } from "../security/canonical-write-access"

export interface CanonicalProjectCreateAttemptInput<T> {
  sessionLoader?: CanonicalSessionLoader
  authState?: CanonicalWriteAuthState
  persistProject: () => Promise<T> | T
}

export async function guardCanonicalProjectWrite<T>({ sessionLoader, authState, persistProject }: CanonicalProjectCreateAttemptInput<T>) {
  const access = await requireCanonicalWriteAccess(sessionLoader, authState)
  if (!access.ok) {
    return access
  }
  return await persistProject()
}
