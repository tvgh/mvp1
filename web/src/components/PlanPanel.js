import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../api/client';
import { Card } from './Card';
export function PlanPanel({ task, latestPlan, plans, onChange, }) {
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [busy, setBusy] = useState(false);
    if (!task.planMode) {
        return (_jsx(Card, { title: "Plan", children: _jsx("p", { className: "text-sm text-on-surface-variant", children: "\u8BE5\u4EFB\u52A1\u672A\u5F00\u542F Plan \u6A21\u5F0F\uFF0C\u5DF2\u8DF3\u8FC7 Plan \u9636\u6BB5\u3002" }) }));
    }
    const viewing = selectedVersion !== null ? plans.find((p) => p.version === selectedVersion) : latestPlan;
    const canAct = task.status === 'plan_pending_confirm';
    const onConfirm = async () => {
        setBusy(true);
        try {
            await api.confirmPlan(task.id);
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
            await api.rejectPlan(task.id, feedback.trim());
            setFeedback('');
            setShowFeedback(false);
            await onChange();
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs(Card, { title: "Plan \u5B9E\u73B0\u65B9\u6848", right: plans.length > 0 && (_jsx("select", { className: "rounded border border-outline px-2 py-1 text-xs bg-surface text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20", value: selectedVersion ?? latestPlan?.version ?? '', onChange: (e) => setSelectedVersion(Number(e.target.value)), children: plans
                .slice()
                .sort((a, b) => b.version - a.version)
                .map((p) => (_jsxs("option", { value: p.version, children: ["v", p.version, " \u00B7 ", p.status] }, p.version))) })), children: [!viewing && (_jsx("p", { className: "text-sm text-on-surface-variant", children: task.status === 'planning' ? 'Plan 正在生成中…' : '尚未生成 Plan。' })), viewing && (_jsxs(_Fragment, { children: [_jsx("div", { className: "markdown text-sm text-on-surface", children: _jsx(ReactMarkdown, { children: viewing.content }) }), viewing.feedback && (_jsxs("div", { className: "mt-3 rounded border border-outline-variant bg-surface-container-high p-2 text-xs text-on-surface", children: ["\u4E0A\u4E00\u8F6E\u53CD\u9988\uFF1A", viewing.feedback] })), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: [_jsx("button", { disabled: !canAct || busy, onClick: onConfirm, className: "rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50", children: "\u786E\u8BA4 Plan" }), _jsx("button", { disabled: !canAct || busy, onClick: () => setShowFeedback((s) => !s), className: "rounded border border-outline px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface-bright disabled:opacity-50", children: "\u9A73\u56DE\u5E76\u586B\u5199\u4FEE\u6539\u610F\u89C1" }), !canAct && (_jsx("span", { className: "text-xs text-on-surface-variant", children: viewing.status === 'confirmed' ? '已确认' : '当前状态不可操作' }))] }), showFeedback && (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("textarea", { className: "w-full rounded border border-outline-variant bg-surface p-2 text-sm text-on-surface placeholder-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20", rows: 3, value: feedback, onChange: (e) => setFeedback(e.target.value), placeholder: "\u8BF7\u586B\u5199\u4FEE\u6539\u610F\u89C1\uFF0CCoding Agent \u5C06\u57FA\u4E8E\u53CD\u9988\u91CD\u65B0\u751F\u6210 Plan" }), _jsx("button", { disabled: !feedback.trim() || busy, onClick: onReject, className: "rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50", children: "\u63D0\u4EA4\u9A73\u56DE" })] }))] }))] }));
}
