import assert from "node:assert/strict"
import test from "node:test"

import { createAuthRuntime } from "../auth"

test("RELEASE-01D-A auth foundation fails closed without GitHub OAuth configuration", () => {
  const runtime = createAuthRuntime({} as never)

  assert.equal(runtime.hasGithubOAuthConfiguration(), false)
  assert.equal(runtime.authRuntimeSummary.provider, "github")
  assert.equal(runtime.authRuntimeSummary.oauthConfigured, false)
  assert.equal(runtime.authOptions.providers.length, 0)
  assert.equal(runtime.canAuthorizeOwnerGithubAccount("123456"), false)
})

test("RELEASE-01D-A auth foundation only authorizes the configured GitHub owner account id", () => {
  const runtime = createAuthRuntime({
    AUTH_OWNER_GITHUB_ACCOUNT_ID: "owner-123",
    GITHUB_ID: "client-id",
    GITHUB_SECRET: "client-secret",
    NEXTAUTH_SECRET: "secret",
  } as never)

  assert.equal(runtime.hasGithubOAuthConfiguration(), true)
  assert.equal(runtime.getOwnerGithubAccountId(), "owner-123")
  assert.equal(runtime.canAuthorizeOwnerGithubAccount("owner-123"), true)
  assert.equal(runtime.canAuthorizeOwnerGithubAccount("someone-else"), false)
  assert.equal(runtime.authOptions.providers.length, 1)
})
