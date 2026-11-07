import { start } from "workflow/api";
import { HookConflictError } from "workflow/errors";
import { cvNotificationWorkflow, cvRetentionWorkflow } from "./flows";
import type { CvService } from "../service";
export async function dispatchCvJobs(
  s: CvService,
  requestId?: string,
  limit = 10,
) {
  if (process.env.VERCEL !== "1") return 0;
  const candidates = (
    await s.db.query<{
      request_id: string;
      kind: "retention" | "notification";
      generation: number;
    }>(
      "SELECT request_id,kind,generation FROM cv_background_jobs WHERE run_id IS NULL AND (lease_until IS NULL OR lease_until<now()) AND ($1::uuid IS NULL OR request_id=$1) ORDER BY created_at LIMIT $2",
      [requestId ?? null, limit],
    )
  ).rows;
  let scheduled = 0;
  for (const job of candidates) {
    const claimed = await s.db.query(
      "UPDATE cv_background_jobs SET lease_until=now()+interval '2 minutes' WHERE request_id=$1 AND kind=$2 AND generation=$3 AND run_id IS NULL AND (lease_until IS NULL OR lease_until<now()) RETURNING request_id",
      [job.request_id, job.kind, job.generation],
    );
    if (!claimed.rowCount) continue;
    try {
      const token = `cv-${s.config.dataEnvironment}-${job.kind}-${job.request_id}-${job.generation}`;
      let runId: string;
      try {
        const fn =
          job.kind === "retention"
            ? cvRetentionWorkflow
            : cvNotificationWorkflow;
        const run = await start(
          fn,
          [job.request_id, s.config.dataEnvironment, token],
          { experimental_hook: { token }, experimental_retention: 0 },
        );
        runId = run.runId;
      } catch (e) {
        if (!HookConflictError.is(e) || !e.conflictingRunId) throw e;
        runId = e.conflictingRunId;
      }
      await s.db.query(
        "UPDATE cv_background_jobs SET run_id=$4,lease_until=NULL WHERE request_id=$1 AND kind=$2 AND generation=$3",
        [job.request_id, job.kind, job.generation, runId],
      );
      scheduled++;
    } catch {
      await s.db.query(
        "UPDATE cv_background_jobs SET lease_until=NULL WHERE request_id=$1 AND kind=$2 AND generation=$3",
        [job.request_id, job.kind, job.generation],
      );
      console.warn("CV_BACKGROUND_SCHEDULING_FAILED", { kind: job.kind });
    }
  }
  return scheduled;
}
