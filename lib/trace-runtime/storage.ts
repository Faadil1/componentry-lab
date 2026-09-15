import "server-only"

import type {
  TraceRuntimeAction,
  TraceRuntimeActionDraft,
  TraceRuntimeArtifact,
  TraceRuntimeArtifactDraft,
  TraceRuntimeRun,
  TraceRuntimeRunListItem,
} from "./types"

type SqlClient = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Array<Record<string, unknown>>>
  unsafe<T extends Array<Record<string, unknown>> = Array<Record<string, unknown>>>(query: string, values?: unknown[]): Promise<T>
  begin?<T>(callback: (txn: SqlClient) => Promise<T>): Promise<T>
}

async function getSql(): Promise<SqlClient> {
  const { getDatabase } = await import("../persistence/db")
  return getDatabase() as unknown as SqlClient
}

const LOCK_A = 0x74726163
const LOCK_B = 0x6572756e

async function ensureSchema(sql: SqlClient): Promise<void> {
  const writeSchema = async (client: SqlClient) => {
    await client`
      CREATE TABLE IF NOT EXISTS componentry_trace_runs (
        run_id TEXT PRIMARY KEY,
        project_id TEXT,
        target_kind TEXT NOT NULL,
        target_id TEXT NOT NULL,
        authority_used TEXT NOT NULL,
        status TEXT NOT NULL,
        summary TEXT NOT NULL DEFAULT '',
        findings JSONB NOT NULL DEFAULT '[]'::jsonb,
        evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
        input JSONB NOT NULL,
        error TEXT,
        created_at TIMESTAMPTZ NOT NULL,
        completed_at TIMESTAMPTZ
      )
    `

    await client`
      CREATE TABLE IF NOT EXISTS componentry_trace_artifacts (
        artifact_id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        project_id TEXT,
        kind TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      )
    `

    await client`
      CREATE TABLE IF NOT EXISTS componentry_trace_actions (
        action_id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        project_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        authority TEXT NOT NULL,
        reversible BOOLEAN NOT NULL,
        status TEXT NOT NULL,
        payload JSONB NOT NULL,
        result JSONB,
        created_at TIMESTAMPTZ NOT NULL,
        executed_at TIMESTAMPTZ
      )
    `

    await client`CREATE INDEX IF NOT EXISTS componentry_trace_runs_project_created_idx ON componentry_trace_runs (project_id, created_at DESC)`
    await client`CREATE INDEX IF NOT EXISTS componentry_trace_actions_run_idx ON componentry_trace_actions (run_id)`
  }

  if (typeof sql.begin === "function") {
    await sql.begin(async (txn) => {
      await txn`SELECT pg_advisory_xact_lock(${LOCK_A}, ${LOCK_B})`
      await writeSchema(txn)
    })
    return
  }

  await writeSchema(sql)
}

function json(value: unknown): string {
  return JSON.stringify(value ?? null)
}

function rowValue<T>(row: Record<string, unknown>, key: string): T {
  return row[key] as T
}

export async function createTraceRun(run: TraceRuntimeRun): Promise<void> {
  const sql = await getSql()
  await ensureSchema(sql)
  await sql.unsafe(
    `INSERT INTO componentry_trace_runs
      (run_id, project_id, target_kind, target_id, authority_used, status, summary, findings, evidence, input, error, created_at, completed_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11,$12,$13)`,
    [
      run.runId,
      run.projectId ?? null,
      run.targetKind,
      run.targetId,
      run.authorityUsed,
      run.status,
      run.summary,
      json(run.findings),
      json(run.evidence),
      json(run.input),
      run.error ?? null,
      run.createdAt,
      run.completedAt ?? null,
    ],
  )
}

export async function completeTraceRun(run: TraceRuntimeRun): Promise<void> {
  const sql = await getSql()
  await ensureSchema(sql)
  await sql.unsafe(
    `UPDATE componentry_trace_runs
       SET authority_used=$2, status=$3, summary=$4, findings=$5::jsonb, evidence=$6::jsonb,
           error=$7, completed_at=$8
     WHERE run_id=$1`,
    [
      run.runId,
      run.authorityUsed,
      run.status,
      run.summary,
      json(run.findings),
      json(run.evidence),
      run.error ?? null,
      run.completedAt ?? null,
    ],
  )
}

export async function persistTraceArtifacts(
  runId: string,
  projectId: string | undefined,
  drafts: TraceRuntimeArtifactDraft[],
): Promise<TraceRuntimeArtifact[]> {
  const sql = await getSql()
  await ensureSchema(sql)
  const now = new Date().toISOString()
  const artifacts: TraceRuntimeArtifact[] = []

  for (const draft of drafts) {
    const artifact: TraceRuntimeArtifact = {
      ...draft,
      artifactId: `artifact_${crypto.randomUUID()}`,
      runId,
      createdAt: now,
    }
    await sql.unsafe(
      `INSERT INTO componentry_trace_artifacts
        (artifact_id, run_id, project_id, kind, title, summary, payload, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
      [artifact.artifactId, runId, projectId ?? null, artifact.kind, artifact.title, artifact.summary, json(artifact.payload), artifact.createdAt],
    )
    artifacts.push(artifact)
  }

  return artifacts
}

export async function persistTraceActions(
  runId: string,
  projectId: string | undefined,
  drafts: TraceRuntimeActionDraft[],
): Promise<TraceRuntimeAction[]> {
  const sql = await getSql()
  await ensureSchema(sql)
  const now = new Date().toISOString()
  const actions: TraceRuntimeAction[] = []

  for (const draft of drafts) {
    const action: TraceRuntimeAction = {
      ...draft,
      actionId: `action_${crypto.randomUUID()}`,
      runId,
      status: "PREPARED",
      createdAt: now,
    }
    await sql.unsafe(
      `INSERT INTO componentry_trace_actions
        (action_id, run_id, project_id, type, title, description, authority, reversible, status, payload, result, created_at, executed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,NULL,$11,NULL)`,
      [action.actionId, runId, projectId ?? null, action.type, action.title, action.description, action.authority, action.reversible, action.status, json(action.payload), action.createdAt],
    )
    actions.push(action)
  }

  return actions
}

export async function listTraceRuns(projectId?: string, limit = 12): Promise<TraceRuntimeRunListItem[]> {
  const sql = await getSql()
  await ensureSchema(sql)
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)))
  const rows = projectId
    ? await sql.unsafe(`SELECT * FROM componentry_trace_runs WHERE project_id=$1 ORDER BY created_at DESC LIMIT ${safeLimit}`, [projectId])
    : await sql.unsafe(`SELECT * FROM componentry_trace_runs ORDER BY created_at DESC LIMIT ${safeLimit}`)

  return rows.map((row) => ({
    runId: rowValue<string>(row, "run_id"),
    projectId: rowValue<string | null>(row, "project_id") ?? undefined,
    targetKind: rowValue<TraceRuntimeRunListItem["targetKind"]>(row, "target_kind"),
    targetId: rowValue<string>(row, "target_id"),
    authorityUsed: rowValue<TraceRuntimeRunListItem["authorityUsed"]>(row, "authority_used"),
    status: rowValue<TraceRuntimeRunListItem["status"]>(row, "status"),
    summary: rowValue<string>(row, "summary"),
    createdAt: new Date(rowValue<string | Date>(row, "created_at")).toISOString(),
    completedAt: rowValue<string | Date | null>(row, "completed_at") ? new Date(rowValue<string | Date>(row, "completed_at")).toISOString() : undefined,
  }))
}

export async function getTraceAction(actionId: string): Promise<(TraceRuntimeAction & { projectId?: string }) | undefined> {
  const sql = await getSql()
  await ensureSchema(sql)
  const rows = await sql.unsafe(`SELECT * FROM componentry_trace_actions WHERE action_id=$1 LIMIT 1`, [actionId])
  const row = rows[0]
  if (!row) return undefined

  return {
    actionId: rowValue<string>(row, "action_id"),
    runId: rowValue<string>(row, "run_id"),
    projectId: rowValue<string | null>(row, "project_id") ?? undefined,
    type: rowValue<TraceRuntimeAction["type"]>(row, "type"),
    title: rowValue<string>(row, "title"),
    description: rowValue<string>(row, "description"),
    authority: rowValue<TraceRuntimeAction["authority"]>(row, "authority"),
    reversible: rowValue<boolean>(row, "reversible"),
    status: rowValue<TraceRuntimeAction["status"]>(row, "status"),
    payload: rowValue<Record<string, unknown>>(row, "payload"),
    result: rowValue<Record<string, unknown> | null>(row, "result") ?? undefined,
    createdAt: new Date(rowValue<string | Date>(row, "created_at")).toISOString(),
    executedAt: rowValue<string | Date | null>(row, "executed_at") ? new Date(rowValue<string | Date>(row, "executed_at")).toISOString() : undefined,
  }
}

export async function updateTraceAction(
  actionId: string,
  status: TraceRuntimeAction["status"],
  result?: Record<string, unknown>,
): Promise<void> {
  const sql = await getSql()
  await ensureSchema(sql)
  const executedAt = status === "EXECUTED" || status === "REVERTED" || status === "FAILED" ? new Date().toISOString() : null
  await sql.unsafe(
    `UPDATE componentry_trace_actions SET status=$2, result=$3::jsonb, executed_at=$4 WHERE action_id=$1`,
    [actionId, status, json(result ?? null), executedAt],
  )
}

export async function getTraceRuntimeSql(): Promise<SqlClient> {
  const sql = await getSql()
  await ensureSchema(sql)
  return sql
}
