import { Router } from 'express';
import {
  Plan,
  ReviewInfo,
  Task,
  appendLog,
  getEnvForTask,
  getLatestPlan,
  nowISO,
  store,
} from '../store.js';
import {
  confirmPlan,
  confirmReview,
  rejectPlan,
  rejectReview,
  testFail,
  testPass,
} from '../simulator.js';
import { transition } from '../stateMachine.js';

export const tasksRouter = Router();

tasksRouter.get('/tasks', (req, res) => {
  const status = req.query.status as string | undefined;
  const all = Array.from(store.tasks.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const tasks = status ? all.filter((t) => t.status === status) : all;
  res.json({ tasks });
});

tasksRouter.get('/tasks/:id', (req, res) => {
  const task = store.tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });
  const app = store.apps.get(task.appId);
  const plans = store.plans.get(task.id) ?? [];
  const latestPlan = getLatestPlan(task.id);
  const review = store.reviews.get(task.id);
  const env = getEnvForTask(task.id);
  res.json({ task, app, latestPlan, plans, review, env });
});

tasksRouter.post('/tasks', (req, res) => {
  const body = req.body as Partial<Task>;
  if (!body.requirementId || !body.title || !body.appId || !body.projectId) {
    return res.status(400).json({ error: 'requirementId, title, appId, projectId required' });
  }
  for (const t of store.tasks.values()) {
    if (
      t.requirementId === body.requirementId &&
      t.appId === body.appId &&
      t.status !== 'completed' &&
      t.status !== 'cancelled'
    ) {
      return res.status(409).json({ error: '任务已存在' });
    }
  }
  const id = `task-${Math.floor(Math.random() * 90000 + 10000)}`;
  const task: Task = {
    id,
    projectId: body.projectId!,
    requirementId: body.requirementId!,
    title: body.title!,
    content: body.content ?? '',
    appId: body.appId!,
    planMode: body.planMode ?? true,
    status: body.status ?? 'queued',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  store.tasks.set(id, task);
  appendLog({
    taskId: id,
    action: 'task:created',
    actor: 'user',
    status: 'info',
    message: body.status === 'pending_start' ? `任务 ${id} 已导入，等待开始` : `任务 ${id} 已加入队列`,
  });
  res.json({ task });
});

tasksRouter.post('/tasks/:id/status', (req, res) => {
  const task = store.tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });
  const { status, message } = req.body ?? {};
  const r = transition(task, status, message ?? '管理员手动更新状态', 'system');
  if (!r.ok) return res.status(400).json({ error: r.reason });
  res.json({ task });
});

tasksRouter.post('/tasks/:id/start', (req, res) => {
  const task = store.tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });
  
  if (!['pending_start', 'cancelled'].includes(task.status)) {
    return res.status(400).json({ error: '只能重新运行处于待开始或已取消状态的任务' });
  }

  const body = req.body ?? {};
  if (body.projectId) task.projectId = body.projectId;
  if (body.requirementId) task.requirementId = body.requirementId;
  if (body.title) task.title = body.title;
  if (body.content !== undefined) task.content = body.content;
  if (body.appId) task.appId = body.appId;
  if (body.planMode !== undefined) task.planMode = body.planMode;
  if (body.baseBranch) task.baseBranch = body.baseBranch;

  const r = transition(task, 'queued', '用户手动加入队列', 'user');
  if (!r.ok) return res.status(400).json({ error: r.reason });
  res.json({ ok: true });
});

tasksRouter.post('/tasks/:id/plan/confirm', (req, res) => {
  const r = confirmPlan(req.params.id);
  if (!r.ok) return res.status(400).json({ error: r.reason });
  res.json({ ok: true });
});

tasksRouter.post('/tasks/:id/plan/reject', (req, res) => {
  const feedback: string = req.body?.feedback ?? '请重新生成';
  const r = rejectPlan(req.params.id, feedback);
  if (!r.ok) return res.status(400).json({ error: r.reason });
  res.json({ ok: true });
});

tasksRouter.post('/tasks/:id/plan', (req, res) => {
  // PRD §9.1 writeback (used by 'coding agent' externally) — for completeness
  const task = store.tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });
  const { version, content, status } = req.body ?? {};
  const arr = store.plans.get(task.id) ?? [];
  const plan: Plan = {
    taskId: task.id,
    version: version ?? arr.length + 1,
    content: content ?? '',
    status: status ?? 'pending_confirm',
    createdAt: nowISO(),
  };
  arr.push(plan);
  store.plans.set(task.id, arr);
  res.json({ plan });
});

tasksRouter.post('/tasks/:id/review/confirm', (req, res) => {
  const r = confirmReview(req.params.id);
  if (!r.ok) return res.status(400).json({ error: r.reason });
  res.json({ ok: true });
});

tasksRouter.post('/tasks/:id/review/reject', (req, res) => {
  const feedback: string = req.body?.feedback ?? '请重新修改';
  const r = rejectReview(req.params.id, feedback);
  if (!r.ok) return res.status(400).json({ error: r.reason });
  res.json({ ok: true });
});

tasksRouter.post('/tasks/:id/review', (req, res) => {
  const task = store.tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });
  const { patchContent, diffHtmlUrl, changeSummary, testSuggestion } = req.body ?? {};
  const review: ReviewInfo = {
    taskId: task.id,
    patchContent: patchContent ?? '',
    diffHtmlUrl: diffHtmlUrl ?? '',
    changeSummary: changeSummary ?? '',
    testSuggestion: testSuggestion ?? '',
    status: 'pending_review',
    createdAt: nowISO(),
  };
  store.reviews.set(task.id, review);
  res.json({ review });
});

tasksRouter.post('/tasks/:id/test/pass', (req, res) => {
  const r = testPass(req.params.id);
  if (!r.ok) return res.status(400).json({ error: r.reason });
  res.json({ ok: true });
});

tasksRouter.post('/tasks/:id/test/fail', (req, res) => {
  const feedback: string = req.body?.feedback ?? '测试不通过';
  const r = testFail(req.params.id, feedback);
  if (!r.ok) return res.status(400).json({ error: r.reason });
  res.json({ ok: true });
});

tasksRouter.get('/tasks/:id/logs', (req, res) => {
  const logs = store.logs.get(req.params.id) ?? [];
  res.json({ logs });
});

tasksRouter.post('/tasks/:id/env', (req, res) => {
  // PRD §9.1 env writeback
  const task = store.tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });
  const { envId, envUrl, branchName, commitId } = req.body ?? {};
  task.envId = envId;
  store.tasks.set(task.id, task);
  appendLog({
    taskId: task.id,
    action: 'env:writeback',
    actor: 'app_center',
    status: 'info',
    message: `环境回写 ${envUrl} (${branchName}@${commitId})`,
  });
  res.json({ ok: true });
});
