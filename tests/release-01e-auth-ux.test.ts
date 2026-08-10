import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
const authControls = readFileSync(new URL("../components/auth/auth-controls.tsx", import.meta.url), "utf8")
const authTs = readFileSync(new URL("../auth.ts", import.meta.url), "utf8")
const release01dAuth = readFileSync(new URL("./release-01d-auth-foundation.test.ts", import.meta.url), "utf8")
const release01dWrites = readFileSync(new URL("./release-01d-b-write-gates.test.ts", import.meta.url), "utf8")

function countOccurrences(text: string, needle: string) {
  return text.split(needle).length - 1
}

test("RELEASE-01E auth UX exposes the GitHub sign-in and sign-out actions", () => {
  assert.equal(authControls.includes('signIn("github"'), true)
  assert.equal(authControls.includes('signOut({ callbackUrl: "/" })'), true)
  assert.equal(authControls.includes("Sign in with GitHub"), true)
  assert.equal(authControls.includes("Sign out"), true)
})

test("RELEASE-01E auth UX keeps the custom root sign-in page contract", () => {
  assert.equal(authTs.includes('pages: {'), true)
  assert.equal(authTs.includes('signIn: "/"'), true)
  assert.equal(authTs.includes('error: "/"'), true)
  assert.equal(page.includes("AuthControls"), true)
})

test("RELEASE-01E auth UX does not expose secrets or owner internals", () => {
  assert.equal(authControls.includes("GITHUB_SECRET"), false)
  assert.equal(authControls.includes("NEXTAUTH_SECRET"), false)
  assert.equal(authControls.includes("AUTH_OWNER_GITHUB_ACCOUNT_ID"), false)
  assert.equal(authControls.includes("providerAccountId"), false)
  assert.equal(authControls.includes("accessToken"), false)
  assert.equal(page.includes("AUTH_OWNER_GITHUB_ACCOUNT_ID"), false)
})

test("RELEASE-01E auth UX does not trigger canonical writes or Creative OS authority changes", () => {
  assert.equal(authControls.includes("fetch(\"/api/status\""), false)
  assert.equal(authControls.includes("requireCanonicalWriteAccess"), false)
  assert.equal(authControls.includes("Creative OS authority"), false)
  assert.equal(page.includes("requireCanonicalWriteAccess"), false)
})

test("RELEASE-01E auth UX leaves release-01D coverage intact", () => {
  assert.equal(release01dAuth.includes("RELEASE-01D-A"), true)
  assert.equal(release01dWrites.includes("RELEASE-01D-B"), true)
  assert.equal(countOccurrences(release01dAuth, "test(") > 0, true)
  assert.equal(countOccurrences(release01dWrites, "test(") > 0, true)
})

test("RELEASE-01E auth UX keeps public reads public", () => {
  assert.equal(page.includes("Auth foundation"), true)
  assert.equal(page.includes("AuthControls"), true)
})