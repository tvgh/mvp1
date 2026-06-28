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

gitlabRouter.get('/projects/:projectId/issues', (req, res) => {
  res.json({
    issues: [
      { id: '1', iid: 101, title: 'Bug: 登录页面在移动端显示异常', description: '登录界面的输入框在 iOS Safari 上会被键盘遮挡。' },
      { id: '2', iid: 102, title: 'Feature: 支持批量导出任务为 CSV', description: '用户需要在任务列表点击导出，将所有任务及状态导出为 CSV。' },
      { id: '3', iid: 103, title: 'Bug: 黑暗模式下侧边栏文字颜色看不清', description: '黑暗模式下，侧边栏菜单的非激活态文字颜色对比度过低。' },
      { id: '4', iid: 104, title: 'Feature: 集成钉钉机器人通知', description: '当任务状态变为 completed 或 failed 时，发送钉钉消息到指定群。' },
      { id: '5', iid: 105, title: 'Refactor: 抽取公共组件 Button', description: '项目中存在多处样板代码相同的按钮，需要提取出一个基础的 Button 组件。' }
    ]
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
