import { AppInfo, Task, appendLog, nowISO, store } from './store.js';

export function seed() {
  const apps: AppInfo[] = [
    {
      appId: 'app-001',
      appName: '用户中心',
      appDescription: '负责用户登录、注册、账号管理',
      gitUrl: 'git@gitlab.example.com:demo/user-center.git',
      defaultBranch: 'master',
      aiwxPipelineId: 'pipeline-001',
      aiwxEnvLimit: 5,
    },
    {
      appId: 'app-002',
      appName: '订单服务',
      appDescription: '订单创建、支付、退款',
      gitUrl: 'git@gitlab.example.com:demo/order-service.git',
      defaultBranch: 'main',
      aiwxPipelineId: 'pipeline-002',
      aiwxEnvLimit: 3,
    },
    {
      appId: 'app-003',
      appName: '消息推送',
      appDescription: '站内信、Push、短信',
      gitUrl: 'git@gitlab.example.com:demo/notify.git',
      defaultBranch: 'master',
      aiwxPipelineId: 'pipeline-003',
      aiwxEnvLimit: 5,
    },
  ];
  apps.forEach((a) => store.apps.set(a.appId, a));

  const seedTasks: Task[] = [
    {
      id: 'task-001',
      projectId: 'project-001',
      requirementId: 'REQ-10086',
      title: '优化登录页错误提示',
      content: '用户登录失败时需要展示明确的错误原因，区分密码错误、账号不存在、网络异常。',
      appId: 'app-001',
      planMode: true,
      status: 'queued',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: 'task-002',
      projectId: 'project-001',
      requirementId: 'REQ-10087',
      title: '订单详情页增加退款入口',
      content: '在订单详情页根据订单状态展示"申请退款"按钮，已退款订单展示退款进度。',
      appId: 'app-002',
      planMode: false,
      status: 'queued',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: 'task-003',
      projectId: 'project-002',
      requirementId: 'REQ-20001',
      title: '推送消息支持富文本',
      content: '允许推送消息包含粗体、链接、表情，按平台能力降级渲染。',
      appId: 'app-003',
      planMode: true,
      status: 'queued',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: 'task-004',
      projectId: 'project-001',
      requirementId: 'REQ-10000',
      title: '历史需求：修复手机号校验正则',
      content: '修复手机号校验不支持 167 号段的问题。',
      appId: 'app-001',
      planMode: false,
      status: 'completed',
      baseBranch: 'master',
      baseCommit: 'a1b2c3d4',
      branchName: 'aiwx/feat-REQ-10000',
      sandboxId: 'sb-project-001',
      mrUrl: 'https://gitlab.example.com/demo/user-center/-/merge_requests/42',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
  ];
  seedTasks.forEach((t) => {
    store.tasks.set(t.id, t);
    appendLog({
      taskId: t.id,
      action: 'task:created',
      actor: 'system',
      status: 'info',
      message: `任务 ${t.id} 已进入队列`,
    });
  });
}
