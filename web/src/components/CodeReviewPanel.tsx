import { useMemo, useState } from 'react';
import * as Diff2Html from 'diff2html';
import { api } from '../api/client';
import type { ReviewInfo, Task } from '../api/types';
import { Card } from './Card';

type Tab = 'diff' | 'patch' | 'summary' | 'suggestion';

export function CodeReviewPanel({
  task,
  review,
  onChange,
}: {
  task: Task;
  review?: ReviewInfo;
  onChange: () => void;
}) {
  const [tab, setTab] = useState<Tab>('diff');
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [busy, setBusy] = useState(false);

  const diffHtml = useMemo(() => {
    if (!review?.patchContent) return '';
    return Diff2Html.html(review.patchContent, {
      drawFileList: true,
      outputFormat: 'line-by-line',
      matching: 'lines',
    });
  }, [review?.patchContent]);

  const canAct = task.status === 'code_pending_review';

  const onConfirm = async () => {
    setBusy(true);
    try {
      await api.confirmReview(task.id);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const onReject = async () => {
    if (!feedback.trim()) return;
    setBusy(true);
    try {
      await api.rejectReview(task.id, feedback.trim());
      setFeedback('');
      setShowFeedback(false);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  if (!review) {
    return (
      <Card title="代码 Review">
        <p className="text-sm text-on-surface-variant">
          {task.status === 'coding' || task.status === 'patch_checking'
            ? '代码与 Patch 生成中…'
            : '尚未生成代码改动。'}
        </p>
      </Card>
    );
  }

  return (
    <Card title="代码 Review">
      <div className="mb-3 flex gap-1 border-b border-outline-variant">
        {(
          [
            ['diff', 'Diff'],
            ['patch', 'Patch'],
            ['summary', '改动说明'],
            ['suggestion', '测试建议'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3 py-1.5 text-sm font-medium ${tab === k
                ? 'border-b-2 border-primary text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'diff' && (
        <div
          className="overflow-x-auto rounded border border-outline-variant bg-surface text-xs"
          dangerouslySetInnerHTML={{ __html: diffHtml }}
        />
      )}
      {tab === 'patch' && (
        <pre className="max-h-[480px] overflow-auto rounded bg-[#020617] p-3 text-xs text-on-surface">
          {review.patchContent}
        </pre>
      )}
      {tab === 'summary' && (
        <p className="whitespace-pre-line text-sm text-on-surface">{review.changeSummary}</p>
      )}
      {tab === 'suggestion' && (
        <p className="whitespace-pre-line text-sm text-on-surface">{review.testSuggestion}</p>
      )}

      {review.feedback && (
        <div className="mt-3 rounded border border-outline-variant bg-surface-container-high p-2 text-xs text-on-surface">
          上一轮反馈：{review.feedback}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          disabled={!canAct || busy}
          onClick={onConfirm}
          className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50"
        >
          确认代码
        </button>
        <button
          disabled={!canAct || busy}
          onClick={() => setShowFeedback((s) => !s)}
          className="rounded border border-outline px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface-bright disabled:opacity-50"
        >
          驳回并填写修改意见
        </button>
        {!canAct && (
          <span className="text-xs text-on-surface-variant">
            {review.status === 'confirmed' ? '已确认' : '当前状态不可操作'}
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
            placeholder="请填写修改意见，Coding Agent 将基于反馈重新生成代码"
          />
          <button
            disabled={!feedback.trim() || busy}
            onClick={onReject}
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50"
          >
            提交驳回
          </button>
        </div>
      )}
    </Card>
  );
}
