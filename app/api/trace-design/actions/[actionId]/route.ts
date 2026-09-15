import { getServerSession } from "next-auth/next"
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

import { authOptions, authRuntimeSummary } from "@/auth"
import { executeTraceAction, revertTraceAction } from "@/lib/trace-runtime/actions"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ actionId: string }> },
) {
  if (!authRuntimeSummary.oauthConfigured) {
    return NextResponse.json({ error: "TRACE runtime OAuth is not configured in this deployment." }, { status: 401 })
  }

  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user) return NextResponse.json({ error: "Owner GitHub authentication is required." }, { status: 401 })

  try {
    const { actionId } = await context.params
    const body = await request.json() as Record<string, unknown>
    if (body.approved !== true) {
      return NextResponse.json({ error: "Explicit approval is required for TRACE runtime mutations." }, { status: 400 })
    }
    const operation = body.operation === "undo" ? "undo" : body.operation === "execute" ? "execute" : null
    if (!operation) return NextResponse.json({ error: "operation must be execute or undo." }, { status: 400 })

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    })
    const githubAccessToken = typeof (token as { githubAccessToken?: unknown } | null)?.githubAccessToken === "string"
      ? (token as { githubAccessToken: string }).githubAccessToken
      : undefined

    const result = operation === "execute"
      ? await executeTraceAction(actionId, githubAccessToken)
      : await revertTraceAction(actionId, githubAccessToken)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}
