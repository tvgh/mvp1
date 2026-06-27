import { useState } from 'react';
import { api } from '../api/client';
import type { EnvRecord, ReviewInfo, Task } from '../api/types';
import { Card } from './Card';

export function TestEnvPanel({
  task,
  env,
  review,
  onChange,
}: {
  task: Task;
  env?: EnvRecord;
  review?: ReviewInfo;
  onChange: () => void;
}) {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [busy, setBusy] = useState(false);

  const canAct = task.status === 'testing_pending';

  const onPass = async () => {
    setBusy(true);
    try {
      await api.testPass(task.id);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const onFail = async () => {
    if (!feedback.trim()) return;
    setBusy(true);
    try {
      await api.testFail(task.id, feedback.trim());
      setFeedback('');
      setShowFeedback(false);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const pipelineStatus = (() => {
    if (task.status === 'deploying' || task.status === 'pushing_branch') return '运行中';
    if (task.status === 'failed_pipeline') return '失败';
    if (env) return '成功';
    return '—';
  })();

  return (
    <Card title="AIWX 临时环境与测试">
      <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
        <div className="text-on-surface-variant">环境地址</div>
        <div className="font-mono">
          {env?.envUrl ? (
            <a
              className="text-primary hover:underline"
              href={env.envUrl}
              target="_blank"
              rel="noreferrer"
            >
              {env.envUrl}
            </a>
          ) : (
            '—'
          )}
        </div>
        <div className="text-on-surface-variant">环境名称</div>
        <div className="font-mono">{env?.envName ?? '—'}</div>
        <div className="text-on-surface-variant">部署分支</div>
        <div className="font-mono">{env?.branchName ?? task.branchName ?? '—'}</div>
        <div className="text-on-surface-variant">Commit</div>
        <div className="font-mono">{env?.commitId ?? task.baseCommit ?? '—'}</div>
        <div className="text-on-surface-variant">流水线状态</div>
        <div>{pipelineStatus}</div>
      </div>

      {review?.testSuggestion && (
        <div className="mt-3 rounded border border-outline-variant bg-surface-container-high p-2 text-xs text-on-surface whitespace-pre-line">
          <strong>测试建议：</strong>
          {'\n'}
          {review.testSuggestion}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          disabled={!canAct || busy}
          onClick={onPass}
          className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50"
        >
          测试通过 → 创建 MR
        </button>
        <button
          disabled={!canAct || busy}
          onClick={() => setShowFeedback((s) => !s)}
          className="rounded border border-outline px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface-bright disabled:opacity-50"
        >
          测试不通过
        </button>
        {!canAct && (
          <span className="text-xs text-on-surface-variant">
            {task.status === 'completed'
              ? '任务已完成'
              : task.status === 'mr_pending_merge' || task.status === 'creating_mr'
                ? '已通过测试'
                : '当前状态不可操作'}
          </span>
        )}
      </div>
      {showFeedback && (
        <div className="mt-3 space-y-2">
          <textarea
            className="w-full rounded border border-outline-variant bg-surface p-2 text-sm text-on-surface placeholder-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="请填写测试反馈，Coding Agent 将回到代码生成阶段重新修改"
          />
          <button
            disabled={!feedback.trim() || busy}
            onClick={onFail}
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50"
          >
            提交反馈
          </button>
        </div>
      )}
    </Card>
  );
}
