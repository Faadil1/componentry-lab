import type { Session } from "next-auth"
import { getServerSession } from "next-auth/next"

import { authOptions, canAuthorizeOwnerGithubAccount, getOwnerGithubAccountId } from "../../auth"

export type CanonicalWritePrincipal =
  | {
      kind: "authorized-owner"
      ownerGithubAccountId: string
      session: Session
    }
  | {
      kind: "unauthorized"
      reason: "unauthenticated" | "owner-missing" | "non-owner"
    }

export type CanonicalWriteAccessResult =
  | {
      ok: true
      principal: Extract<CanonicalWritePrincipal, { kind: "authorized-owner" }>
    }
  | {
      ok: false
      principal: Extract<CanonicalWritePrincipal, { kind: "unauthorized" }>
    }

export interface CanonicalWriteAuthState {
  getOwnerGithubAccountId: () => string
  canAuthorizeOwnerGithubAccount: (providerAccountId: string | undefined | null) => boolean
}

export type CanonicalSessionLoader = () => Promise<Session | null>

const defaultAuthState: CanonicalWriteAuthState = {
  getOwnerGithubAccountId,
  canAuthorizeOwnerGithubAccount,
}

const defaultSessionLoader: CanonicalSessionLoader = () => getServerSession(authOptions)

function getSessionGithubProviderAccountId(session: Session): string | null {
  const providerAccountId = (session.user as { id?: string } | undefined)?.id
  return typeof providerAccountId === "string" && providerAccountId.trim() ? providerAccountId.trim() : null
}

export async function requireCanonicalWriteAccess(
  sessionLoader: CanonicalSessionLoader = defaultSessionLoader,
  authState: CanonicalWriteAuthState = defaultAuthState,
): Promise<CanonicalWriteAccessResult> {
  const session = await sessionLoader()
  if (!session) {
    return { ok: false, principal: { kind: "unauthorized", reason: "unauthenticated" } }
  }

  const ownerGithubAccountId = authState.getOwnerGithubAccountId()
  if (!ownerGithubAccountId) {
    return { ok: false, principal: { kind: "unauthorized", reason: "owner-missing" } }
  }

  const providerAccountId = getSessionGithubProviderAccountId(session)
  if (!providerAccountId || !authState.canAuthorizeOwnerGithubAccount(providerAccountId)) {
    return { ok: false, principal: { kind: "unauthorized", reason: "non-owner" } }
  }

  return {
    ok: true,
    principal: {
      kind: "authorized-owner",
      ownerGithubAccountId,
      session,
    },
  }
}

export async function withCanonicalWriteAccess<T>(
  sessionLoader: CanonicalSessionLoader,
  handler: (principal: Extract<CanonicalWritePrincipal, { kind: "authorized-owner" }>) => Promise<T> | T,
  authState: CanonicalWriteAuthState = defaultAuthState,
): Promise<CanonicalWriteAccessResult | T> {
  const access = await requireCanonicalWriteAccess(sessionLoader, authState)
  if (!access.ok) return access
  return handler(access.principal)
}
