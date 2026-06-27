import { Task, TaskStatus, appendLog, nowISO, store } from './store.js';

const ALLOWED: Record<TaskStatus, TaskStatus[]> = {
  pending_start: ['queued', 'cancelled'],
  queued: ['locking_baseline', 'cancelled'],
  locking_baseline: ['preparing_sandbox', 'failed_baseline', 'cancelled'],
  preparing_sandbox: ['planning', 'coding', 'failed_baseline', 'cancelled'],
  planning: ['plan_pending_confirm', 'failed_plan', 'cancelled'],
  plan_pending_confirm: ['coding', 'planning', 'cancelled'],
  coding: ['patch_checking', 'failed_patch', 'cancelled'],
  patch_checking: ['code_pending_review', 'coding', 'failed_patch', 'cancelled'],
  code_pending_review: ['pushing_branch', 'coding', 'cancelled'],
  pushing_branch: ['deploying', 'failed_push', 'cancelled'],
  deploying: ['testing_pending', 'failed_pipeline', 'cancelled'],
  testing_pending: ['creating_mr', 'coding', 'cancelled'],
  creating_mr: ['mr_pending_merge', 'failed_mr', 'cancelled'],
  mr_pending_merge: ['destroying_env', 'cancelled'],
  destroying_env: ['completed', 'failed_destroy_env', 'cancelled'],
  completed: [],
  failed_baseline: ['locking_baseline', 'cancelled'],
  failed_plan: ['planning', 'cancelled'],
  failed_patch: ['coding', 'cancelled'],
  failed_push: ['pushing_branch', 'cancelled'],
  failed_pipeline: ['deploying', 'cancelled'],
  failed_mr: ['creating_mr', 'cancelled'],
  failed_destroy_env: ['destroying_env', 'cancelled'],
  cancelled: [],
};

export const HAPPY_PATH: TaskStatus[] = [
  'queued',
  'locking_baseline',
  'preparing_sandbox',
  'planning',
  'plan_pending_confirm',
  'coding',
  'patch_checking',
  'code_pending_review',
  'pushing_branch',
  'deploying',
  'testing_pending',
  'creating_mr',
  'mr_pending_merge',
  'destroying_env',
  'completed',
];

export const TERMINAL: TaskStatus[] = ['completed', 'cancelled'];
export const USER_GATES: TaskStatus[] = [
  'plan_pending_confirm',
  'code_pending_review',
  'testing_pending',
];

export function transition(
  task: Task,
  toStatus: TaskStatus,
  message: string,
  actor: 'user' | 'coding_agent' | 'gitlab' | 'app_center' | 'system' = 'coding_agent',
): { ok: true } | { ok: false; reason: string } {
  const allowed = ALLOWED[task.status] ?? [];
  if (!allowed.includes(toStatus)) {
    return { ok: false, reason: `Transition ${task.status} -> ${toStatus} not allowed` };
  }
  task.status = toStatus;
  task.updatedAt = nowISO();
  store.tasks.set(task.id, task);
  appendLog({
    taskId: task.id,
    action: `status:${toStatus}`,
    actor,
    status: toStatus.startsWith('failed_') ? 'fail' : 'info',
    message,
  });
  return { ok: true };
}
