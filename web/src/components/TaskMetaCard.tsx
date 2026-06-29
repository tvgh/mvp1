import { useEffect, useState } from 'react';
import type { AppInfo, Task, TaskStatus } from '../api/types';
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

const inputClass =
  'w-full rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed';

interface JoinQueueButtonState {
  label: string;
  enabled: boolean;
}

function getJoinQueueButtonState(status: TaskStatus): JoinQueueButtonState {
  switch (status) {
    case 'pending_start':
      return { label: '加入队列', enabled: true };
    case 'queued':
      return { label: '已在队列', enabled: false };
    case 'locking_baseline':
    case 'preparing_sandbox':
    case 'planning':
    case 'coding':
    case 'patch_checking':
    case 'pushing_branch':
    case 'deploying':
    case 'creating_mr':
    case 'destroying_env':
      return { label: '任务执行中', enabled: false };
    case 'plan_pending_confirm':
    case 'code_pending_review':
    case 'testing_pending':
    case 'mr_pending_merge':
      return { label: '等待用户操作', enabled: false };
    case 'completed':
      return { label: '已完成', enabled: false };
    case 'cancelled':
      return { label: '已取消', enabled: false };
    case 'failed_baseline':
    case 'failed_plan':
    case 'failed_patch':
    case 'failed_push':
    case 'failed_pipeline':
    case 'failed_mr':
    case 'failed_destroy_env':
      return { label: '已失败', enabled: false };
  }
}

export function TaskMetaCard({
  task,
  app,
  onChange,
}: {
  task: Task;
  app?: AppInfo;
  onChange?: () => void;
}) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [projectId, setProjectId] = useState(task.projectId);
  const [requirementId, setRequirementId] = useState(task.requirementId);
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [appId, setAppId] = useState(task.appId || '');
  const [planMode, setPlanMode] = useState(task.planMode);
  const [baseBranch, setBaseBranch] = useState(task.baseBranch || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.listApps().then((r) => setApps(r.apps));
  }, []);

  const projects = Array.from(new Map(apps.map((a) => [a.projectId, a.projectName])).entries());
  const projectApps = apps.filter((a) => a.projectId === projectId);

  const selectedApp = apps.find((a) => a.appId === appId) || app;

  useEffect(() => {
    const validApps = apps.filter((a) => a.projectId === projectId);
    if (appId !== '' && !validApps.some((a) => a.appId === appId)) {
      setAppId('');
      setBaseBranch('');
    }
  }, [projectId, apps, appId]);

  useEffect(() => {
    setProjectId(task.projectId);
    setRequirementId(task.requirementId);
    setTitle(task.title);
    setContent(task.content);
    setAppId(task.appId || '');
    setPlanMode(task.planMode);
    setBaseBranch(task.baseBranch || '');
    setErr(null);
  }, [task.id, task.status]);

  const editable = task.status === 'pending_start';
  const buttonState = getJoinQueueButtonState(task.status);
  const canSubmit = buttonState.enabled && !busy && !!title.trim();

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
      onChange?.();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

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
      <div className="space-y-3">
        <Field label="所属项目">
          {editable ? (
            <select
              className={inputClass}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projects.length === 0 && <option value={projectId}>{projectId}</option>}
              {projects.map(([id, name]) => (
                <option key={id} value={id}>
                  {name} ({id})
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputClass}
              value={apps.find(a => a.projectId === projectId)?.projectName || projectId}
              disabled
            />
          )}
        </Field>
        <Field label="需求 ID">
          <input
            className={inputClass}
            value={requirementId}
            disabled={!editable}
            onChange={(e) => setRequirementId(e.target.value)}
          />
        </Field>
        <Field label="标题">
          <input
            className={inputClass}
            value={title}
            disabled={!editable}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="需求正文">
          <textarea
            rows={4}
            className={inputClass}
            value={content}
            disabled={!editable}
            onChange={(e) => setContent(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={planMode}
            disabled={!editable}
            onChange={(e) => setPlanMode(e.target.checked)}
          />
          <span>开启 Plan 模式</span>
        </label>
        <Field label="目标应用">
          <select
            className={inputClass}
            value={appId}
            disabled={!editable}
            onChange={(e) => {
              const newAppId = e.target.value;
              setAppId(newAppId);
              const newApp = apps.find(a => a.appId === newAppId);
              if (newApp) setBaseBranch(newApp.defaultBranch);
            }}
          >
            <option value="">&lt;自动选择&gt;</option>
            {projectApps.map((a) => (
              <option key={a.appId} value={a.appId}>
                {a.appName} ({a.appId})
              </option>
            ))}
          </select>
          {selectedApp?.appDescription && (
            <div className="mt-1 text-xs text-on-surface-variant">
              {selectedApp.appDescription}
            </div>
          )}
        </Field>
        {appId && (
          <Field label="目标分支">
            <input
              placeholder="默认使用应用配置的主分支"
              className={inputClass}
              value={baseBranch}
              disabled={!editable}
              onChange={(e) => setBaseBranch(e.target.value)}
            />
          </Field>
        )}
      </div>

      <div className="mt-4 border-t border-outline-variant pt-3">
        <div className="divide-y divide-outline-variant">
          {appId && <Row label="Git 仓库" value={selectedApp?.gitUrl} />}
          <Row label="baseCommit" value={task.baseCommit} />
          <Row label="AI 分支" value={task.branchName} />
          <Row label="沙箱 ID" value={task.sandboxId} />
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
      </div>

      {err && <p className="mt-3 text-xs text-error">{err}</p>}

      <div className="mt-4 flex justify-end">
        <button
          disabled={!canSubmit}
          onClick={submit}
          className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? '提交中…' : buttonState.label}
        </button>
      </div>
    </Card>
  );
}
