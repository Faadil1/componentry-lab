import { NextResponse } from "next/server"
import { buildAi33Packet } from "@/lib/film-kit/presets"
import { FILM_PROJECT_IDS } from "@/lib/film-kit/schema"

export const dynamic = "force-static"

export function GET() {
  return NextResponse.json(buildAi33Packet(FILM_PROJECT_IDS[0]))
}