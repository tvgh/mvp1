export type TaskStatus =
  | 'pending_start'
  | 'queued'
  | 'locking_baseline'
  | 'preparing_sandbox'
  | 'planning'
  | 'plan_pending_confirm'
  | 'coding'
  | 'patch_checking'
  | 'code_pending_review'
  | 'pushing_branch'
  | 'deploying'
  | 'testing_pending'
  | 'creating_mr'
  | 'mr_pending_merge'
  | 'destroying_env'
  | 'completed'
  | 'failed_baseline'
  | 'failed_plan'
  | 'failed_patch'
  | 'failed_push'
  | 'failed_pipeline'
  | 'failed_mr'
  | 'failed_destroy_env'
  | 'cancelled';

export interface Task {
  id: string;
  projectId: string;
  requirementId: string;
  title: string;
  content: string;
  appId?: string;
  planMode: boolean;
  status: TaskStatus;
  branchName?: string;
  baseBranch?: string;
  baseCommit?: string;
  sandboxId?: string;
  envId?: string;
  mrUrl?: string;
  failReason?: string;
  pipelineTickCounter?: number;
  mrTickCounter?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppInfo {
  projectId: string;
  projectName: string;
  appId: string;
  appName: string;
  appDescription?: string;
  gitUrl: string;
  defaultBranch: string;
  aiwxPipelineId: string;
  aiwxEnvLimit: number;
}

export interface Plan {
  taskId: string;
  content: string;
  version: number;
  status: 'pending_confirm' | 'confirmed' | 'rejected';
  feedback?: string;
  createdAt: string;
}

export interface ReviewInfo {
  taskId: string;
  patchContent: string;
  diffHtmlUrl: string;
  changeSummary: string;
  testSuggestion: string;
  status: 'pending_review' | 'confirmed' | 'rejected';
  feedback?: string;
  createdAt: string;
}

export interface EnvRecord {
  envId: string;
  envName: string;
  envUrl: string;
  appId: string;
  taskId: string;
  branchName: string;
  commitId: string;
  status: 'creating' | 'deploying' | 'running' | 'destroying' | 'destroyed' | 'failed';
  createdAt: string;
}

export interface LogEntry {
  taskId: string;
  action: string;
  actor: 'user' | 'coding_agent' | 'gitlab' | 'app_center' | 'system';
  status: 'info' | 'success' | 'fail';
  message: string;
  createdAt: string;
}

export const store = {
  tasks: new Map<string, Task>(),
  apps: new Map<string, AppInfo>(),
  plans: new Map<string, Plan[]>(),
  reviews: new Map<string, ReviewInfo>(),
  envs: new Map<string, EnvRecord>(),
  logs: new Map<string, LogEntry[]>(),
};

export function nowISO() {
  return new Date().toISOString();
}

export function appendLog(entry: Omit<LogEntry, 'createdAt'>) {
  const arr = store.logs.get(entry.taskId) ?? [];
  arr.push({ ...entry, createdAt: nowISO() });
  store.logs.set(entry.taskId, arr);
}

export function getLatestPlan(taskId: string): Plan | undefined {
  const arr = store.plans.get(taskId);
  if (!arr || arr.length === 0) return undefined;
  return arr[arr.length - 1];
}

export function getEnvForTask(taskId: string): EnvRecord | undefined {
  for (const env of store.envs.values()) {
    if (env.taskId === taskId && env.status !== 'destroyed') return env;
  }
  return undefined;
}
