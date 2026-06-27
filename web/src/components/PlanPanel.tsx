import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../api/client';
import type { Plan, Task } from '../api/types';
import { Card } from './Card';

export function PlanPanel({
  task,
  latestPlan,
  plans,
  onChange,
}: {
  task: Task;
  latestPlan?: Plan;
  plans: Plan[];
  onChange: () => void;
}) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!task.planMode) {
    return (
      <Card title="Plan">
        <p className="text-sm text-gray-500">该任务未开启 Plan 模式，已跳过 Plan 阶段。</p>
      </Card>
    );
  }

  const viewing =
    selectedVersion !== null ? plans.find((p) => p.version === selectedVersion) : latestPlan;
  const canAct = task.status === 'plan_pending_confirm';

  const onConfirm = async () => {
    setBusy(true);
    try {
      await api.confirmPlan(task.id);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const onReject = async () => {
    if (!feedback.trim()) return;
    setBusy(true);
    try {
      await api.rejectPlan(task.id, feedback.trim());
      setFeedback('');
      setShowFeedback(false);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="Plan 实现方案"
      right={
        plans.length > 0 && (
          <select
            className="rounded border border-gray-300 px-2 py-1 text-xs"
            value={selectedVersion ?? latestPlan?.version ?? ''}
            onChange={(e) => setSelectedVersion(Number(e.target.value))}
          >
            {plans
              .slice()
              .sort((a, b) => b.version - a.version)
              .map((p) => (
                <option key={p.version} value={p.version}>
                  v{p.version} · {p.status}
                </option>
              ))}
          </select>
        )
      }
    >
      {!viewing && (
        <p className="text-sm text-gray-500">
          {task.status === 'planning' ? 'Plan 正在生成中…' : '尚未生成 Plan。'}
        </p>
      )}
      {viewing && (
        <>
          <div className="markdown text-sm text-gray-800">
            <ReactMarkdown>{viewing.content}</ReactMarkdown>
          </div>
          {viewing.feedback && (
            <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
              上一轮反馈：{viewing.feedback}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              disabled={!canAct || busy}
              onClick={onConfirm}
              className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:bg-gray-300"
            >
              确认 Plan
            </button>
            <button
              disabled={!canAct || busy}
              onClick={() => setShowFeedback((s) => !s)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              驳回并填写修改意见
            </button>
            {!canAct && (
              <span className="text-xs text-gray-500">
                {viewing.status === 'confirmed' ? '已确认' : '当前状态不可操作'}
              </span>
            )}
          </div>
          {showFeedback && (
            <div className="mt-3 space-y-2">
              <textarea
                className="w-full rounded border border-gray-300 p-2 text-sm"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="请填写修改意见，Coding Agent 将基于反馈重新生成 Plan"
              />
              <button
                disabled={!feedback.trim() || busy}
                onClick={onReject}
                className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white disabled:bg-gray-300"
              >
                提交驳回
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
