import { requireCanonicalWriteAccess, type CanonicalSessionLoader, type CanonicalWriteAuthState } from "../../security/canonical-write-access"

export interface CanonicalPlanPrepareAttemptInput<T> {
  sessionLoader?: CanonicalSessionLoader
  authState?: CanonicalWriteAuthState
  persistPlan: () => Promise<T> | T
}

export async function guardCanonicalPlanWrite<T>({ sessionLoader, authState, persistPlan }: CanonicalPlanPrepareAttemptInput<T>) {
  const access = await requireCanonicalWriteAccess(sessionLoader, authState)
  if (!access.ok) {
    return access
  }
  return await persistPlan()
}
