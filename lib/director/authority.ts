import type { AuthorityContext, AuthorityLevel } from "./types"

export function canAuthorizeExternalAction(authority: AuthorityContext): boolean {
  return (
    authority.status === "granted" &&
    authority.approvalRequirement !== "none" &&
    authority.authorityLevel !== "prohibited" &&
    authority.reversibility !== "irreversible" &&
    authority.grantedScope.length > 0
  )
}

export function defaultAuthorityLevelForAction(actionType: string): AuthorityLevel {
  if (actionType === "preview" || actionType === "inspect") return "suggest"
  if (actionType === "prepare-local") return "prepare"
  if (actionType === "local-reversible") return "local-reversible-execution"
  if (actionType === "prepare-external") return "prepare-external-action"
  if (actionType === "external-reversible") return "authorized-reversible-external-action"
  return "prohibited"
}
