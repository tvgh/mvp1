import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { AppInfo } from '../api/types';
import { StatusBadge, STATUS_LABEL } from '../components/StatusBadge';
import { useTasks } from '../hooks/useTasks';
import { useEffect } from 'react';

export function TaskList() {
  const navigate = useNavigate();
  const { tasks, refresh } = useTasks();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [startingTask, setStartingTask] = useState<any>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.listApps().then((r) => setApps(r.apps));
  }, []);

  const allProjects = Array.from(new Set(tasks.map((t) => t.projectId))).filter(Boolean);
  const allStatuses = Array.from(new Set(tasks.map((t) => t.status))).filter(Boolean);

  const filteredTasks = tasks.filter((t) => {
    const matchProject = selectedProjects.length === 0 || selectedProjects.includes(t.projectId);
    const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(t.status);
    const matchSearch = searchQuery.trim() === '' || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.requirementId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchProject && matchStatus && matchSearch;
  });

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
          <h2 className="font-headline-lg text-headline-lg text-on-surface">AI 编码任务</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            监控和管理 AI 驱动的编码任务。
          </p>
        </div>
        <div className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-lg p-xs">
          <button
            onClick={() => setShowCreate(true)}
            className="px-md py-[6px] rounded bg-primary-container text-white font-body-sm text-body-sm transition-colors hover:bg-primary"
          >
            + 新建任务
          </button>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
        <div className="card rounded-xl p-md flex flex-col justify-between border">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">进行中的任务</span>
            <span className="material-symbols-outlined text-primary-container text-[20px]">autorenew</span>
          </div>
          <div className="flex items-baseline gap-sm">
            <span className="font-display-lg text-display-lg text-on-surface">{metrics.activeTasks}</span>
          </div>
        </div>
        <div className="card rounded-xl p-md flex flex-col justify-between border">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">已完成的任务</span>
            <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          </div>
          <div className="flex items-baseline gap-sm">
            <span className="font-display-lg text-display-lg text-on-surface">{metrics.completedTasks}</span>
          </div>
        </div>
        <div className="card rounded-xl p-md flex flex-col justify-between border relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, #2563eb, transparent 70%)' }}></div>
          <div className="relative z-10 flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">环境资源占用</span>
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

      {/* Filters and Search */}
      <div className="flex items-center gap-3 mb-sm">
        <div className="hidden md:flex items-center w-64 relative">
          <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            className="input-light w-full pl-8 pr-sm py-[6px] rounded border font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-0 placeholder-on-surface-variant"
            placeholder="搜索任务、ID..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <MultiSelect label="项目过滤" options={allProjects} value={selectedProjects} onChange={setSelectedProjects} />
        <MultiSelect label="状态过滤" options={allStatuses} value={selectedStatuses} onChange={setSelectedStatuses} getOptionLabel={(opt) => (STATUS_LABEL as any)[opt] || opt} />
      </div>

      {/* Tasks List Card */}
      <div className="card border rounded-xl overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-sm px-md py-sm border-b border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface-variant uppercase">
          <div className="col-span-2">任务 ID</div>
          <div className="col-span-4">任务标题</div>
          <div className="col-span-2">所属项目</div>
          <div className="col-span-2">当前状态</div>
          <div className="col-span-2 text-right">最后更新</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-outline-variant">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/tasks/${t.id}`)}
              className="grid grid-cols-12 gap-sm px-md py-sm items-center hover:bg-surface-container transition-colors group cursor-pointer"
            >
              <div className="col-span-2 font-label-md text-label-md text-primary-container flex items-center gap-1">
                <span className="truncate">{t.requirementId}</span>
                {['pending_start', 'cancelled'].includes(t.status) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStartingTask(t);
                    }}
                    className="w-5 h-5 bg-blue-500 text-white hover:bg-red-500 rounded-full transition-colors flex items-center justify-center shrink-0 shadow-sm"
                    title="加入队列"
                  >
                    <span className="material-symbols-outlined text-[14px] font-bold">play_arrow</span>
                  </button>
                )}
                {['coding', 'planning'].includes(t.status) && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('确定要停止该任务吗？')) {
                        try {
                          await api.cancelTask(t.id);
                          refresh();
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }
                    }}
                    className="w-5 h-5 bg-blue-500 text-white hover:bg-red-500 rounded-full transition-colors flex items-center justify-center shrink-0 shadow-sm"
                    title="停止任务"
                  >
                    <span className="material-symbols-outlined text-[14px] font-bold">stop</span>
                  </button>
                )}
              </div>
              <div className="col-span-4 font-body-md text-body-md text-on-surface font-medium truncate pr-sm">
                {t.title}
              </div>
              <div className="col-span-2 font-body-sm text-body-sm text-on-surface-variant truncate pr-2">
                {t.projectId}
              </div>
              <div className="col-span-2 flex items-center">
                <StatusBadge status={t.status} />
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {new Date(t.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
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
      {startingTask && (
        <StartTaskDialog
          apps={apps}
          task={startingTask}
          onClose={() => setStartingTask(null)}
          onStarted={async () => {
            setStartingTask(null);
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

function MultiSelect({
  label,
  options,
  value,
  onChange,
  getOptionLabel,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
  getOptionLabel?: (opt: string) => string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 bg-surface border border-outline-variant rounded flex items-center gap-1 text-sm font-medium hover:bg-surface-container"
      >
        {label} {value.length > 0 && `(${value.length})`}
        <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-48 bg-surface border border-outline-variant rounded shadow-lg text-on-surface">
          <div className="p-2 max-h-60 overflow-y-auto">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-2 px-2 py-1 hover:bg-surface-container rounded cursor-pointer text-sm">
                <input 
                  type="checkbox" 
                  checked={value.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...value, opt]);
                    } else {
                      onChange(value.filter(v => v !== opt));
                    }
                  }}
                />
                <span className="truncate">{getOptionLabel ? getOptionLabel(opt) : opt}</span>
              </label>
            ))}
            {options.length === 0 && <div className="text-xs text-on-surface-variant p-2">无选项</div>}
          </div>
          <div className="border-t border-outline-variant p-2 flex justify-between">
            <button className="text-xs text-primary hover:underline" onClick={() => onChange([])}>清空</button>
            <button className="text-xs text-on-surface hover:underline" onClick={() => setOpen(false)}>确定</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StartTaskDialog({
  apps,
  task,
  onClose,
  onStarted,
}: {
  apps: AppInfo[];
  task: any;
  onClose: () => void;
  onStarted: () => void;
}) {
  const [projectId, setProjectId] = useState(task.projectId);
  const [requirementId, setRequirementId] = useState(task.requirementId);
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [appId, setAppId] = useState(task.appId);
  const [planMode, setPlanMode] = useState(task.planMode);
  const [baseBranch, setBaseBranch] = useState(task.baseBranch || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
