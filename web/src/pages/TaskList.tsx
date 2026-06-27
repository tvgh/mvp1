import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { AppInfo } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';
import { useTasks } from '../hooks/useTasks';
import { useEffect } from 'react';

export function TaskList() {
  const navigate = useNavigate();
  const { tasks, refresh } = useTasks();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.listApps().then((r) => setApps(r.apps));
  }, []);

  const appName = (id: string) => apps.find((a) => a.appId === id)?.appName ?? id;

  // Mock metrics (in real app, fetch from API)
  const metrics = {
    activeTasks: tasks.filter(t => !t.status.startsWith('failed_') && t.status !== 'completed' && t.status !== 'cancelled').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length
  };

  return (
    <>
      {/* Page Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Coding Agent Tasks</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Monitor and manage AI-orchestrated coding tasks.
          </p>
        </div>
        <div className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-lg p-xs">
          <button className="px-md py-[6px] rounded bg-secondary-container text-on-secondary-container font-body-sm text-body-sm font-medium transition-colors">
            All
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-md py-[6px] rounded bg-primary-container text-white font-body-sm text-body-sm transition-colors hover:bg-primary"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
        <div className="card rounded-xl p-md flex flex-col justify-between border">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">Active Tasks</span>
            <span className="material-symbols-outlined text-primary-container text-[20px]">autorenew</span>
          </div>
          <div className="flex items-baseline gap-sm">
            <span className="font-display-lg text-display-lg text-on-surface">{metrics.activeTasks}</span>
          </div>
        </div>
        <div className="card rounded-xl p-md flex flex-col justify-between border">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">Completed Tasks</span>
            <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          </div>
          <div className="flex items-baseline gap-sm">
            <span className="font-display-lg text-display-lg text-on-surface">{metrics.completedTasks}</span>
          </div>
        </div>
        <div className="card rounded-xl p-md flex flex-col justify-between border relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, #2563eb, transparent 70%)' }}></div>
          <div className="relative z-10 flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">Env Usage</span>
            <span className="material-symbols-outlined text-primary-container text-[20px]">memory</span>
          </div>
          <div className="relative z-10 flex flex-col gap-xs">
            <div className="flex items-baseline gap-sm">
              <span className="font-display-lg text-display-lg text-on-surface">3<span className="text-on-surface-variant font-headline-lg text-headline-lg">/5</span></span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full w-[60%] rounded-full glow-active"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List Card */}
      <div className="card border rounded-xl overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-sm px-md py-sm border-b border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface-variant uppercase">
          <div className="col-span-2">Task ID</div>
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Application</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Updated</div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-outline-variant">
          {tasks.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/tasks/${t.id}`)}
              className="grid grid-cols-12 gap-sm px-md py-sm items-center hover:bg-surface-container transition-colors group cursor-pointer"
            >
              <div className="col-span-2 font-label-md text-label-md text-primary-container">
                {t.requirementId}
              </div>
              <div className="col-span-4 font-body-md text-body-md text-on-surface font-medium truncate pr-sm">
                {t.title}
              </div>
              <div className="col-span-2 font-body-sm text-body-sm text-on-surface-variant">
                {appName(t.appId)}
              </div>
              <div className="col-span-2 flex items-center">
                <StatusBadge status={t.status} />
              </div>
              <div className="col-span-2 font-body-sm text-body-sm text-on-surface-variant text-right">
                {new Date(t.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="px-md py-xl text-center text-on-surface-variant font-body-md">
              暂无任务
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateTaskDialog
          apps={apps}
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false);
            await refresh();
          }}
        />
      )}
    </>
  );
}

function CreateTaskDialog({
  apps,
  onClose,
  onCreated,
}: {
  apps: AppInfo[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [projectId, setProjectId] = useState('project-001');
  const [requirementId, setRequirementId] = useState(
    `REQ-${Math.floor(Math.random() * 90000 + 10000)}`,
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [appId, setAppId] = useState(apps[0]?.appId ?? 'app-001');
  const [planMode, setPlanMode] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.createTask({ projectId, requirementId, title, content, appId, planMode });
      onCreated();
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
        className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container p-5 shadow-xl text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-base font-semibold">加入任务队列</h2>
        <div className="space-y-3 text-sm">
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
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={planMode}
              onChange={(e) => setPlanMode(e.target.checked)}
            />
            <span>开启 Plan 模式</span>
          </label>
        </div>
        {err && <p className="mt-2 text-xs text-error">{err}</p>}
        <div className="mt-4 flex justify-end gap-2">
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
            创建
          </button>
        </div>
      </div>
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
