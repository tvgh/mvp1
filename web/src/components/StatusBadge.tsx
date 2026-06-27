import type { TaskStatus } from '../api/types';

const LABEL: Record<TaskStatus, string> = {
  queued: '待处理',
  locking_baseline: '基线锁定中',
  preparing_sandbox: '沙箱准备中',
  planning: 'Plan 生成中',
  plan_pending_confirm: 'Plan 待确认',
  coding: '代码生成中',
  patch_checking: 'Patch 校验中',
  code_pending_review: '代码待确认',
  pushing_branch: '分支推送中',
  deploying: '流水线部署中',
  testing_pending: '待用户测试',
  creating_mr: 'MR 创建中',
  mr_pending_merge: 'MR 待合并',
  destroying_env: '环境销毁中',
  completed: '已完成',
  failed_baseline: '基线失败',
  failed_plan: 'Plan 失败',
  failed_patch: 'Patch 失败',
  failed_push: 'Push 失败',
  failed_pipeline: '流水线失败',
  failed_mr: 'MR 失败',
  failed_destroy_env: '销毁失败',
  cancelled: '已取消',
};

function colorOf(status: TaskStatus): string {
  if (status === 'completed') return 'bg-green-100 text-green-700 border-green-300';
  if (status === 'cancelled') return 'bg-gray-100 text-gray-600 border-gray-300';
  if (status.startsWith('failed_')) return 'bg-red-100 text-red-700 border-red-300';
  if (
    status === 'plan_pending_confirm' ||
    status === 'code_pending_review' ||
    status === 'testing_pending' ||
    status === 'mr_pending_merge'
  )
    return 'bg-amber-100 text-amber-700 border-amber-300';
  return 'bg-blue-100 text-blue-700 border-blue-300';
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colorOf(status)}`}
    >
      {LABEL[status] ?? status}
    </span>
  );
}

export { LABEL as STATUS_LABEL };
