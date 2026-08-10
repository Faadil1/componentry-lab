import type { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"

type AuthEnv = Partial<Record<
  | "GITHUB_ID"
  | "AUTH_GITHUB_ID"
  | "GITHUB_SECRET"
  | "AUTH_GITHUB_SECRET"
  | "NEXTAUTH_SECRET"
  | "AUTH_SECRET"
  | "AUTH_OWNER_GITHUB_ACCOUNT_ID",
  string
>>

function readEnvValue(env: AuthEnv, primary: keyof AuthEnv, fallback?: keyof AuthEnv) {
  return (env[primary]?.trim() ?? (fallback ? env[fallback]?.trim() : "") ?? "") as string
}

export function createAuthRuntime(env: AuthEnv = process.env) {
  const githubClientId = readEnvValue(env, "GITHUB_ID", "AUTH_GITHUB_ID")
  const githubClientSecret = readEnvValue(env, "GITHUB_SECRET", "AUTH_GITHUB_SECRET")
  const nextAuthSecret = readEnvValue(env, "NEXTAUTH_SECRET", "AUTH_SECRET")
  const ownerGithubAccountId = env.AUTH_OWNER_GITHUB_ACCOUNT_ID?.trim() ?? ""

  const hasGithubOAuthConfiguration = githubClientId.length > 0 && githubClientSecret.length > 0 && nextAuthSecret.length > 0
  const canAuthorizeOwnerGithubAccount = (providerAccountId: string | undefined | null) => {
    if (!ownerGithubAccountId) return false
    if (!providerAccountId) return false
    return providerAccountId === ownerGithubAccountId
  }

  const providers = hasGithubOAuthConfiguration
    ? [
        GitHubProvider({
          clientId: githubClientId,
          clientSecret: githubClientSecret,
        }),
      ]
    : []

  const authOptions: NextAuthOptions = {
    secret: nextAuthSecret || undefined,
    session: { strategy: "jwt" },
    providers,
    callbacks: {
      async signIn({ account }) {
        if (!account || account.provider !== "github") return false
        return canAuthorizeOwnerGithubAccount(account.providerAccountId)
      },
      async jwt({ token, account }) {
        if (account?.provider === "github") {
          token.provider = account.provider
          token.providerAccountId = account.providerAccountId
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          ;(session.user as { id?: string }).id = token.sub ?? (token as { providerAccountId?: string }).providerAccountId ?? undefined
        }
        return session
      },
    },
    pages: {
      signIn: "/",
      error: "/",
    },
  }

  return {
    authOptions,
    authRuntimeSummary: {
      provider: "github",
      ownerAccountIdConfigured: ownerGithubAccountId.length > 0,
      oauthConfigured: hasGithubOAuthConfiguration,
    },
    canAuthorizeOwnerGithubAccount,
    getOwnerGithubAccountId: () => ownerGithubAccountId,
    hasGithubOAuthConfiguration: () => hasGithubOAuthConfiguration,
  }
}

const runtime = createAuthRuntime()

export const authOptions = runtime.authOptions
export const authRuntimeSummary = runtime.authRuntimeSummary
export const canAuthorizeOwnerGithubAccount = runtime.canAuthorizeOwnerGithubAccount
export const getOwnerGithubAccountId = runtime.getOwnerGithubAccountId
export const hasGithubOAuthConfiguration = runtime.hasGithubOAuthConfiguration
