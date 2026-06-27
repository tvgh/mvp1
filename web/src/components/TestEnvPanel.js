import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../api/client';
import { Card } from './Card';
export function TestEnvPanel({ task, env, review, onChange, }) {
    const [feedback, setFeedback] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [busy, setBusy] = useState(false);
    const canAct = task.status === 'testing_pending';
    const onPass = async () => {
        setBusy(true);
        try {
            await api.testPass(task.id);
            await onChange();
        }
        finally {
            setBusy(false);
        }
    };
    const onFail = async () => {
        if (!feedback.trim())
            return;
        setBusy(true);
        try {
            await api.testFail(task.id, feedback.trim());
            setFeedback('');
            setShowFeedback(false);
            await onChange();
        }
        finally {
            setBusy(false);
        }
    };
    const pipelineStatus = (() => {
        if (task.status === 'deploying' || task.status === 'pushing_branch')
            return '运行中';
        if (task.status === 'failed_pipeline')
            return '失败';
        if (env)
            return '成功';
        return '—';
    })();
    return (_jsxs(Card, { title: "AIWX \u4E34\u65F6\u73AF\u5883\u4E0E\u6D4B\u8BD5", children: [_jsxs("div", { className: "grid grid-cols-[120px_1fr] gap-2 text-sm", children: [_jsx("div", { className: "text-on-surface-variant", children: "\u73AF\u5883\u5730\u5740" }), _jsx("div", { className: "font-mono", children: env?.envUrl ? (_jsx("a", { className: "text-primary hover:underline", href: env.envUrl, target: "_blank", rel: "noreferrer", children: env.envUrl })) : ('—') }), _jsx("div", { className: "text-on-surface-variant", children: "\u73AF\u5883\u540D\u79F0" }), _jsx("div", { className: "font-mono", children: env?.envName ?? '—' }), _jsx("div", { className: "text-on-surface-variant", children: "\u90E8\u7F72\u5206\u652F" }), _jsx("div", { className: "font-mono", children: env?.branchName ?? task.branchName ?? '—' }), _jsx("div", { className: "text-on-surface-variant", children: "Commit" }), _jsx("div", { className: "font-mono", children: env?.commitId ?? task.baseCommit ?? '—' }), _jsx("div", { className: "text-on-surface-variant", children: "\u6D41\u6C34\u7EBF\u72B6\u6001" }), _jsx("div", { children: pipelineStatus })] }), review?.testSuggestion && (_jsxs("div", { className: "mt-3 rounded border border-outline-variant bg-surface-container-high p-2 text-xs text-on-surface whitespace-pre-line", children: [_jsx("strong", { children: "\u6D4B\u8BD5\u5EFA\u8BAE\uFF1A" }), '\n', review.testSuggestion] })), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: [_jsx("button", { disabled: !canAct || busy, onClick: onPass, className: "rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50", children: "\u6D4B\u8BD5\u901A\u8FC7 \u2192 \u521B\u5EFA MR" }), _jsx("button", { disabled: !canAct || busy, onClick: () => setShowFeedback((s) => !s), className: "rounded border border-outline px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface-bright disabled:opacity-50", children: "\u6D4B\u8BD5\u4E0D\u901A\u8FC7" }), !canAct && (_jsx("span", { className: "text-xs text-on-surface-variant", children: task.status === 'completed'
                            ? '任务已完成'
                            : task.status === 'mr_pending_merge' || task.status === 'creating_mr'
                                ? '已通过测试'
                                : '当前状态不可操作' }))] }), showFeedback && (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("textarea", { className: "w-full rounded border border-outline-variant bg-surface p-2 text-sm text-on-surface placeholder-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20", rows: 3, value: feedback, onChange: (e) => setFeedback(e.target.value), placeholder: "\u8BF7\u586B\u5199\u6D4B\u8BD5\u53CD\u9988\uFF0CCoding Agent \u5C06\u56DE\u5230\u4EE3\u7801\u751F\u6210\u9636\u6BB5\u91CD\u65B0\u4FEE\u6539" }), _jsx("button", { disabled: !feedback.trim() || busy, onClick: onFail, className: "rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50", children: "\u63D0\u4EA4\u53CD\u9988" })] }))] }));
}
