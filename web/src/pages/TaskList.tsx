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

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">AIWX Coding Agent · 任务列表</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 加入任务队列
        </button>
      </header>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">需求 ID</th>
              <th className="px-4 py-2">标题</th>
              <th className="px-4 py-2">项目</th>
              <th className="px-4 py-2">应用</th>
              <th className="px-4 py-2">状态</th>
              <th className="px-4 py-2">分支</th>
              <th className="px-4 py-2">更新时间</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr
                key={t.id}
                className="cursor-pointer border-t border-gray-100 hover:bg-blue-50"
                onClick={() => navigate(`/tasks/${t.id}`)}
              >
                <td className="px-4 py-2 font-mono text-xs text-gray-700">{t.requirementId}</td>
                <td className="px-4 py-2">{t.title}</td>
                <td className="px-4 py-2 text-gray-600">{t.projectId}</td>
                <td className="px-4 py-2 text-gray-600">{appName(t.appId)}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-2 font-mono text-xs text-gray-600">
                  {t.branchName ?? '—'}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {new Date(t.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  暂无任务
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    </div>
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
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-base font-semibold">加入任务队列</h2>
        <div className="space-y-3 text-sm">
          <Field label="项目 ID">
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </Field>
          <Field label="需求 ID">
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5"
              value={requirementId}
              onChange={(e) => setRequirementId(e.target.value)}
            />
          </Field>
          <Field label="标题">
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="需求正文">
            <textarea
              rows={3}
              className="w-full rounded border border-gray-300 px-2 py-1.5"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Field>
          <Field label="应用">
            <select
              className="w-full rounded border border-gray-300 px-2 py-1.5"
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
        {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
          >
            取消
          </button>
          <button
            disabled={busy || !title}
            onClick={submit}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:bg-gray-300"
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
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      {children}
    </div>
  );
}
