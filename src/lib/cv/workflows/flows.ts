import { sleep, createHook } from "workflow";
import {
  notificationStep,
  pendingDeadline,
  pendingPurgeAndPlan,
  retentionPurge,
} from "./steps";
type Environment = "production" | "preview";
export async function cvNotificationWorkflow(
  id: string,
  environment: Environment,
  token: string,
) {
  "use workflow";
  const ownership = createHook({ token });
  void ownership;
  for (let i = 0; i < 8; i++) {
    const next = await notificationStep(id, environment);
    if (!next) return;
    await sleep(new Date(next));
  }
}
export async function cvRetentionWorkflow(
  id: string,
  environment: Environment,
  token: string,
) {
  "use workflow";
  const ownership = createHook({ token });
  void ownership;
  const pending = await pendingDeadline(id, environment);
  if (!pending) return;
  type Task = { kind: "pending" | "gps" | "ip" | "record"; at: string };
  const tasks: Task[] = [
    { kind: "pending", at: pending.pending },
    { kind: "gps", at: pending.gps },
    { kind: "ip", at: pending.ip },
  ];
  while (tasks.length) {
    tasks.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    const task = tasks.shift()!;
    await sleep(new Date(task.at));
    if (task.kind === "pending") {
      const plan = await pendingPurgeAndPlan(id, environment);
      if (!plan) return;
      tasks.push({ kind: "record", at: plan.record });
    } else {
      await retentionPurge(id, environment, task.kind);
      if (task.kind === "record") return;
    }
  }
}
