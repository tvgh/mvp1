import type { Task } from '../api/types';
import { Card } from './Card';

export function MRPanel({ task }: { task: Task }) {
  const merged = task.status === 'destroying_env' || task.status === 'completed';
  const pending = task.status === 'mr_pending_merge' || task.status === 'creating_mr';

  let phase = '—';
  if (task.status === 'creating_mr') phase = 'MR 创建中';
  else if (task.status === 'mr_pending_merge') phase = '等待 GitLab 合并 Webhook';
  else if (task.status === 'destroying_env') phase = '已合并，正在销毁环境';
  else if (task.status === 'completed') phase = '已合并，环境已销毁';
  else if (task.status === 'failed_mr') phase = 'MR 创建失败';

  return (
    <Card title="Merge Request">
      <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
        <div className="text-on-surface-variant">MR 地址</div>
        <div className="font-mono">
          {task.mrUrl ? (
            <a
              className="text-primary hover:underline"
              href={task.mrUrl}
              target="_blank"
              rel="noreferrer"
            >
              {task.mrUrl}
            </a>
          ) : (
            '—'
          )}
        </div>
        <div className="text-on-surface-variant">源分支</div>
        <div className="font-mono">{task.branchName ?? '—'}</div>
        <div className="text-on-surface-variant">目标分支</div>
        <div className="font-mono">{task.baseBranch ?? '—'}</div>
        <div className="text-on-surface-variant">阶段</div>
        <div>{phase}</div>
      </div>
      {pending && (
        <p className="mt-3 text-xs text-on-surface-variant">
          模拟器会在数秒后自动模拟 GitLab MR 合并 webhook。
        </p>
      )}
      {merged && (
        <p className="mt-3 text-xs text-on-surface-variant">MR 已合并，环境销毁后任务进入已完成状态。</p>
      )}
    </Card>
  );
}
