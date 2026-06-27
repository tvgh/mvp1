import type { AppInfo, LogEntry, Task, TaskDetail } from './types';

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status} ${res.statusText} ${detail}`);
  }
  return (await res.json()) as T;
}

export const api = {
  listTasks: () => jsonFetch<{ tasks: Task[] }>('/api/aiwx/tasks'),
  getTask: (id: string) => jsonFetch<TaskDetail>(`/api/aiwx/tasks/${id}`),
  getLogs: (id: string) => jsonFetch<{ logs: LogEntry[] }>(`/api/aiwx/tasks/${id}/logs`),
  listApps: () => jsonFetch<{ apps: AppInfo[] }>('/api/apps'),
  createTask: (body: {
    projectId: string;
    requirementId: string;
    title: string;
    content: string;
    appId: string;
    planMode: boolean;
  }) =>
    jsonFetch<{ task: Task }>('/api/aiwx/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  confirmPlan: (id: string) =>
    jsonFetch<{ ok: true }>(`/api/aiwx/tasks/${id}/plan/confirm`, { method: 'POST' }),
  rejectPlan: (id: string, feedback: string) =>
    jsonFetch<{ ok: true }>(`/api/aiwx/tasks/${id}/plan/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    }),
  confirmReview: (id: string) =>
    jsonFetch<{ ok: true }>(`/api/aiwx/tasks/${id}/review/confirm`, { method: 'POST' }),
  rejectReview: (id: string, feedback: string) =>
    jsonFetch<{ ok: true }>(`/api/aiwx/tasks/${id}/review/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    }),
  startTask: (id: string, options?: Partial<Task>) =>
    jsonFetch<{ ok: true }>(`/api/aiwx/tasks/${id}/start`, { 
      method: 'POST',
      body: options ? JSON.stringify(options) : undefined
    }),
  testPass: (id: string) =>
    jsonFetch<{ ok: true }>(`/api/aiwx/tasks/${id}/test/pass`, { method: 'POST' }),
  testFail: (id: string, feedback: string) =>
    jsonFetch<{ ok: true }>(`/api/aiwx/tasks/${id}/test/fail`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    }),
};
