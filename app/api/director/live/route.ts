import { NextResponse } from "next/server"

import {
  buildLiveDirectorProjection,
  summarizeLiveDirectorProject,
} from "@/lib/director/live-projection"
import { getProjectById, listProjects } from "@/lib/projects/repository"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestedProjectId = url.searchParams.get("projectId")?.trim() || null
  const projects = await listProjects()
  const summaries = projects.map(summarizeLiveDirectorProject)
  const compatible = summaries.filter((project) => project.compatible)

  const selectedProjectId = requestedProjectId ?? compatible[0]?.id ?? null
  if (!selectedProjectId) {
    return NextResponse.json({
      projects: summaries,
      selectedProjectId: null,
      projection: null,
      errors: ["No Director-compatible Project Brain project is available."],
    })
  }

  const project = await getProjectById(selectedProjectId)
  if (!project) {
    return NextResponse.json(
      {
        projects: summaries,
        selectedProjectId,
        projection: null,
        errors: [`Project Brain project not found: ${selectedProjectId}`],
      },
      { status: 404 },
    )
  }

  const projection = buildLiveDirectorProjection(project)
  if (!projection) {
    return NextResponse.json(
      {
        projects: summaries,
        selectedProjectId,
        projection: null,
        errors: [`Project kind ${project.kind} is not mapped to a Creative Director mode.`],
      },
      { status: 422 },
    )
  }

  return NextResponse.json({
    projects: summaries,
    selectedProjectId,
    projection,
    errors: [],
  })
}
