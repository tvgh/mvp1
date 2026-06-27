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
      outputFormat: 'side-by-side',
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
        <p className="text-sm text-gray-500">
          {task.status === 'coding' || task.status === 'patch_checking'
            ? '代码与 Patch 生成中…'
            : '尚未生成代码改动。'}
        </p>
      </Card>
    );
  }

  return (
    <Card title="代码 Review">
      <div className="mb-3 flex gap-1 border-b border-gray-100">
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
            className={`px-3 py-1.5 text-sm font-medium ${
              tab === k
                ? 'border-b-2 border-blue-500 text-blue-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'diff' && (
        <div
          className="overflow-x-auto rounded border border-gray-200 bg-white text-xs"
          dangerouslySetInnerHTML={{ __html: diffHtml }}
        />
      )}
      {tab === 'patch' && (
        <pre className="max-h-[480px] overflow-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
          {review.patchContent}
        </pre>
      )}
      {tab === 'summary' && (
        <p className="whitespace-pre-line text-sm text-gray-700">{review.changeSummary}</p>
      )}
      {tab === 'suggestion' && (
        <p className="whitespace-pre-line text-sm text-gray-700">{review.testSuggestion}</p>
      )}

      {review.feedback && (
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          上一轮反馈：{review.feedback}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          disabled={!canAct || busy}
          onClick={onConfirm}
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:bg-gray-300"
        >
          确认代码
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
            {review.status === 'confirmed' ? '已确认' : '当前状态不可操作'}
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
            placeholder="请填写修改意见，Coding Agent 将基于反馈重新生成代码"
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
    </Card>
  );
}
