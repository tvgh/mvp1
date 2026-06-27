import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import * as Diff2Html from 'diff2html';
import { api } from '../api/client';
import { Card } from './Card';
export function CodeReviewPanel({ task, review, onChange, }) {
    const [tab, setTab] = useState('diff');
    const [feedback, setFeedback] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [busy, setBusy] = useState(false);
    const diffHtml = useMemo(() => {
        if (!review?.patchContent)
            return '';
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
        }
        finally {
            setBusy(false);
        }
    };
    const onReject = async () => {
        if (!feedback.trim())
            return;
        setBusy(true);
        try {
            await api.rejectReview(task.id, feedback.trim());
            setFeedback('');
            setShowFeedback(false);
            await onChange();
        }
        finally {
            setBusy(false);
        }
    };
    if (!review) {
        return (_jsx(Card, { title: "\u4EE3\u7801 Review", children: _jsx("p", { className: "text-sm text-on-surface-variant", children: task.status === 'coding' || task.status === 'patch_checking'
                    ? '代码与 Patch 生成中…'
                    : '尚未生成代码改动。' }) }));
    }
    return (_jsxs(Card, { title: "\u4EE3\u7801 Review", children: [_jsx("div", { className: "mb-3 flex gap-1 border-b border-outline-variant", children: [
                    ['diff', 'Diff'],
                    ['patch', 'Patch'],
                    ['summary', '改动说明'],
                    ['suggestion', '测试建议'],
                ].map(([k, label]) => (_jsx("button", { onClick: () => setTab(k), className: `px-3 py-1.5 text-sm font-medium ${tab === k
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-on-surface-variant hover:text-on-surface'}`, children: label }, k))) }), tab === 'diff' && (_jsx("div", { className: "overflow-x-auto rounded border border-outline-variant bg-surface text-xs", dangerouslySetInnerHTML: { __html: diffHtml } })), tab === 'patch' && (_jsx("pre", { className: "max-h-[480px] overflow-auto rounded bg-[#020617] p-3 text-xs text-on-surface", children: review.patchContent })), tab === 'summary' && (_jsx("p", { className: "whitespace-pre-line text-sm text-on-surface", children: review.changeSummary })), tab === 'suggestion' && (_jsx("p", { className: "whitespace-pre-line text-sm text-on-surface", children: review.testSuggestion })), review.feedback && (_jsxs("div", { className: "mt-3 rounded border border-outline-variant bg-surface-container-high p-2 text-xs text-on-surface", children: ["\u4E0A\u4E00\u8F6E\u53CD\u9988\uFF1A", review.feedback] })), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: [_jsx("button", { disabled: !canAct || busy, onClick: onConfirm, className: "rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50", children: "\u786E\u8BA4\u4EE3\u7801" }), _jsx("button", { disabled: !canAct || busy, onClick: () => setShowFeedback((s) => !s), className: "rounded border border-outline px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface-bright disabled:opacity-50", children: "\u9A73\u56DE\u5E76\u586B\u5199\u4FEE\u6539\u610F\u89C1" }), !canAct && (_jsx("span", { className: "text-xs text-on-surface-variant", children: review.status === 'confirmed' ? '已确认' : '当前状态不可操作' }))] }), showFeedback && (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("textarea", { className: "w-full rounded border border-outline-variant bg-surface p-2 text-sm text-on-surface placeholder-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20", rows: 3, value: feedback, onChange: (e) => setFeedback(e.target.value), placeholder: "\u8BF7\u586B\u5199\u4FEE\u6539\u610F\u89C1\uFF0CCoding Agent \u5C06\u57FA\u4E8E\u53CD\u9988\u91CD\u65B0\u751F\u6210\u4EE3\u7801" }), _jsx("button", { disabled: !feedback.trim() || busy, onClick: onReject, className: "rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50", children: "\u63D0\u4EA4\u9A73\u56DE" })] }))] }));
}
