"use client"

import { useTransition } from "react"
import { signIn, signOut } from "next-auth/react"

export function AuthControls({
  authenticated,
  callbackUrl = "/",
}: {
  authenticated: boolean
  callbackUrl?: string
}) {
  const [pending, startTransition] = useTransition()

  const handleSignIn = () => {
    startTransition(() => {
      void signIn("github", { callbackUrl })
    })
  }

  const handleSignOut = () => {
    startTransition(() => {
      void signOut({ callbackUrl })
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="mt-1 font-medium text-neutral-950">
        {authenticated ? "GitHub owner session present" : "No authenticated GitHub owner session"}
      </p>
      <div className="flex flex-wrap gap-3">
        {authenticated ? (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSignIn}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in with GitHub
          </button>
        )}
      </div>
    </div>
  )
}
