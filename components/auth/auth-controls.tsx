"use client"

import { useTransition } from "react"
import { signIn, signOut } from "next-auth/react"

export function AuthControls({
  authenticated,
  available = true,
  callbackUrl = "/",
}: {
  authenticated: boolean
  available?: boolean
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

  if (!available) {
    return (
      <div className="flex max-w-56 flex-col items-end gap-1 text-right">
        <p className="text-xs font-medium text-neutral-950">Authentication unavailable</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-stone-500">
          OAuth is not configured in this environment
        </p>
      </div>
    )
  }

  return (
    <div className="flex max-w-56 flex-col items-end gap-2 text-right">
      <p className="text-xs font-medium text-neutral-950">
        {authenticated ? "GitHub owner session present" : "No authenticated GitHub owner session"}
      </p>
      {authenticated ? (
        <button
          type="button"
          onClick={handleSignOut}
          disabled={pending}
          className="inline-flex min-h-9 items-center justify-center rounded-sm border border-stone-400 bg-stone-50 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-900 transition-colors hover:border-neutral-950 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign out
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSignIn}
          disabled={pending}
          className="inline-flex min-h-9 items-center justify-center rounded-sm border border-neutral-950 bg-neutral-950 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-50 transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign in with GitHub
        </button>
      )}
    </div>
  )
}
