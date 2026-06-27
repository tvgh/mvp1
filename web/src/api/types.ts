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
  appId: string;
  planMode: boolean;
  status: TaskStatus;
  branchName?: string;
  baseBranch?: string;
  baseCommit?: string;
  sandboxId?: string;
  envId?: string;
  mrUrl?: string;
  failReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppInfo {
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

export interface TaskDetail {
  task: Task;
  app?: AppInfo;
  latestPlan?: Plan;
  plans: Plan[];
  review?: ReviewInfo;
  env?: EnvRecord;
}
