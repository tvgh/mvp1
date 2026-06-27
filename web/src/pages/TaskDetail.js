import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { CodeReviewPanel } from '../components/CodeReviewPanel';
import { LogList } from '../components/LogList';
import { MRPanel } from '../components/MRPanel';
import { PlanPanel } from '../components/PlanPanel';
import { StatusTimeline } from '../components/StatusTimeline';
import { TaskMetaCard } from '../components/TaskMetaCard';
import { TestEnvPanel } from '../components/TestEnvPanel';
import { useTask } from '../hooks/useTask';
export function TaskDetail() {
    const { id } = useParams();
    const { detail, logs, error, refresh } = useTask(id);
    if (error) {
        return (_jsxs("div", { className: "mx-auto max-w-7xl px-6 py-6", children: [_jsx(Link, { to: "/", className: "text-sm text-primary hover:underline", children: "\u2190 \u8FD4\u56DE\u4EFB\u52A1\u5217\u8868" }), _jsxs("p", { className: "mt-4 text-error", children: ["\u52A0\u8F7D\u5931\u8D25\uFF1A", error] })] }));
    }
    if (!detail) {
        return (_jsxs("div", { className: "mx-auto max-w-7xl px-6 py-6 text-sm text-on-surface-variant", children: [_jsx(Link, { to: "/", className: "text-primary hover:underline", children: "\u2190 \u8FD4\u56DE\u4EFB\u52A1\u5217\u8868" }), _jsx("p", { className: "mt-4", children: "\u52A0\u8F7D\u4E2D\u2026" })] }));
    }
    const { task, app, latestPlan, plans, review, env } = detail;
    return (_jsxs("div", { className: "mx-auto max-w-7xl px-6 py-6", children: [_jsxs("header", { className: "mb-4 flex items-center justify-between", children: [_jsx(Link, { to: "/", className: "text-sm text-primary hover:underline", children: "\u2190 \u8FD4\u56DE\u4EFB\u52A1\u5217\u8868" }), _jsx("span", { className: "text-xs text-on-surface-variant", children: "\u6BCF\u79D2\u5237\u65B0\u4E00\u6B21" })] }), _jsx("div", { className: "mb-4", children: _jsx(Card, { title: "\u4EFB\u52A1\u8FDB\u5EA6", children: _jsx(StatusTimeline, { status: task.status }) }) }), _jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [_jsxs("div", { className: "lg:col-span-1 space-y-4", children: [_jsx(TaskMetaCard, { task: task, app: app }), _jsx(MRPanel, { task: task })] }), _jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx(PlanPanel, { task: task, latestPlan: latestPlan, plans: plans, onChange: refresh }), _jsx(CodeReviewPanel, { task: task, review: review, onChange: refresh }), _jsx(TestEnvPanel, { task: task, env: env, review: review, onChange: refresh }), _jsx(LogList, { logs: logs })] })] })] }));
}
