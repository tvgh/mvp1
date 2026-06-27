import { Router } from 'express';
import { randomHex } from '../mockContent.js';
import { appendLog, store } from '../store.js';

export const gitlabRouter = Router();

gitlabRouter.get('/projects/:projectId/repository/branches/:branchName', (req, res) => {
  res.json({
    branchName: req.params.branchName,
    commitId: randomHex(8),
  });
});

gitlabRouter.post('/webhooks/push', (req, res) => {
  const { ref, checkoutSha } = req.body ?? {};
  const branch = (ref as string | undefined)?.replace('refs/heads/', '');
  if (!branch?.startsWith('aiwx/')) {
    return res.json({ ok: true, ignored: true });
  }
  for (const task of store.tasks.values()) {
    if (task.branchName === branch) {
      appendLog({
        taskId: task.id,
        action: 'gitlab:webhook_push',
        actor: 'gitlab',
        status: 'info',
        message: `收到 push webhook，commit=${checkoutSha}`,
      });
      break;
    }
  }
  res.json({ ok: true });
});

gitlabRouter.post('/webhooks/mr', (req, res) => {
  const { action, sourceBranch } = req.body ?? {};
  if (action !== 'merge') return res.json({ ok: true, ignored: true });
  for (const task of store.tasks.values()) {
    if (task.branchName === sourceBranch) {
      appendLog({
        taskId: task.id,
        action: 'gitlab:webhook_mr_merge',
        actor: 'gitlab',
        status: 'info',
        message: `收到 MR 合并 webhook`,
      });
      break;
    }
  }
  res.json({ ok: true });
});
