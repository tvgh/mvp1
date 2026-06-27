import { useEffect, useState } from 'react';
import type { AppInfo, Task } from '../api/types';
import { api } from '../api/client';
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs text-on-surface-variant">{label}</div>
      {children}
    </div>
  );
}

function StartTaskDialog({
  task,
  onClose,
  onStarted,
}: {
  task: Task;
  onClose: () => void;
  onStarted: () => void;
}) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [projectId, setProjectId] = useState(task.projectId);
  const [requirementId, setRequirementId] = useState(task.requirementId);
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [appId, setAppId] = useState(task.appId);
  const [planMode, setPlanMode] = useState(task.planMode);
  const [baseBranch, setBaseBranch] = useState(task.baseBranch || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.listApps().then((r) => setApps(r.apps));
  }, []);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.startTask(task.id, {
        projectId,
        requirementId,
        title,
        content,
        appId,
        planMode,
        baseBranch: baseBranch || undefined,
      });
      onStarted();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container p-5 shadow-xl text-on-surface flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-base font-semibold shrink-0">确认并加入队列</h2>
        <div className="space-y-3 text-sm overflow-auto pr-2 flex-1">
          <Field label="项目 ID">
            <input
              className="w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </Field>
          <Field label="需求 ID">
            <input
              className="w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              value={requirementId}
              onChange={(e) => setRequirementId(e.target.value)}
            />
          </Field>
          <Field label="标题">
            <input
              className="w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="需求正文">
            <textarea
              rows={3}
              className="w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Field>
          <Field label="应用">
            <select
              className="w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
            >
              {apps.map((a) => (
                <option key={a.appId} value={a.appId}>
                  {a.appName} ({a.appId})
                </option>
              ))}
            </select>
          </Field>
          <Field label="目标分支 (选填)">
            <input
              placeholder="默认使用应用配置的主分支"
              className="w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={planMode}
              onChange={(e) => setPlanMode(e.target.checked)}
            />
            <span>开启 Plan 模式</span>
          </label>
        </div>
        {err && <p className="mt-2 text-xs text-error shrink-0">{err}</p>}
        <div className="mt-4 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="rounded border border-outline px-3 py-1.5 text-sm text-on-surface hover:bg-surface-bright"
          >
            取消
          </button>
          <button
            disabled={busy || !title}
            onClick={submit}
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50"
          >
            加入队列
          </button>
        </div>
      </div>
    </div>
  );
}

export function TaskMetaCard({ task, app, onChange }: { task: Task; app?: AppInfo; onChange?: () => void }) {
  const [showStart, setShowStart] = useState(false);

  return (
    <>
      <Card
        title={
          <span className="flex items-center gap-2">
            <span>{task.title}</span>
            <StatusBadge status={task.status} />
          </span>
        }
        right={
          <div className="flex items-center gap-3">
            {task.status === 'pending_start' && (
              <button
                onClick={() => setShowStart(true)}
                className="px-3 py-1 bg-primary text-on-primary font-medium rounded text-xs hover:opacity-90 transition-opacity"
              >
                加入队列
              </button>
            )}
            <span className="text-xs text-on-surface-variant">
              {task.requirementId} · {task.id}
            </span>
          </div>
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
      {showStart && (
        <StartTaskDialog
          task={task}
          onClose={() => setShowStart(false)}
          onStarted={() => {
            setShowStart(false);
            onChange?.();
          }}
        />
      )}
    </>
  );
}
