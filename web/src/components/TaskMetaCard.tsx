import type { AppInfo, Task } from '../api/types';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-1.5 text-sm">
      <div className="text-on-surface-variant">{label}</div>
      <div className="font-mono text-on-surface break-all">{value ?? '—'}</div>
    </div>
  );
}

export function TaskMetaCard({ task, app }: { task: Task; app?: AppInfo }) {
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <span>{task.title}</span>
          <StatusBadge status={task.status} />
        </span>
      }
      right={
        <span className="text-xs text-on-surface-variant">
          {task.requirementId} · {task.id}
        </span>
      }
    >
      <p className="mb-3 whitespace-pre-line text-sm text-on-surface">{task.content}</p>
      <div className="divide-y divide-outline-variant">
        <Row label="项目" value={task.projectId} />
        <Row label="应用" value={app ? `${app.appName} (${app.appId})` : task.appId} />
        <Row label="Git 仓库" value={app?.gitUrl} />
        <Row label="主分支" value={task.baseBranch ?? app?.defaultBranch} />
        <Row label="baseCommit" value={task.baseCommit} />
        <Row label="AI 分支" value={task.branchName} />
        <Row label="沙箱 ID" value={task.sandboxId} />
        <Row label="Plan 模式" value={task.planMode ? '开启' : '关闭'} />
        <Row
          label="MR 地址"
          value={
            task.mrUrl ? (
              <a className="text-primary hover:underline" href={task.mrUrl} target="_blank">
                {task.mrUrl}
              </a>
            ) : (
              '—'
            )
          }
        />
        {task.failReason && (
          <Row
            label="失败原因"
            value={<span className="text-error">{task.failReason}</span>}
          />
        )}
      </div>
    </Card>
  );
}
