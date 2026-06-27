import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { useTasks } from '../hooks/useTasks';
import { useEffect } from 'react';
export function TaskList() {
    const navigate = useNavigate();
    const { tasks, refresh } = useTasks();
    const [apps, setApps] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    useEffect(() => {
        api.listApps().then((r) => setApps(r.apps));
    }, []);
    const appName = (id) => apps.find((a) => a.appId === id)?.appName ?? id;
    // Mock metrics (in real app, fetch from API)
    const metrics = {
        activeTasks: tasks.filter(t => !t.status.startsWith('failed_') && t.status !== 'completed' && t.status !== 'cancelled').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-headline-lg text-headline-lg text-on-surface", children: "Coding Agent Tasks" }), _jsx("p", { className: "font-body-md text-body-md text-on-surface-variant mt-xs", children: "Monitor and manage AI-orchestrated coding tasks." })] }), _jsxs("div", { className: "flex items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-lg p-xs", children: [_jsx("button", { className: "px-md py-[6px] rounded bg-secondary-container text-on-secondary-container font-body-sm text-body-sm font-medium transition-colors", children: "All" }), _jsx("button", { onClick: () => setShowCreate(true), className: "px-md py-[6px] rounded bg-primary-container text-white font-body-sm text-body-sm transition-colors hover:bg-primary", children: "+ New Task" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-md mb-lg", children: [_jsxs("div", { className: "card rounded-xl p-md flex flex-col justify-between border", children: [_jsxs("div", { className: "flex items-center justify-between mb-sm", children: [_jsx("span", { className: "font-label-md text-label-md text-on-surface-variant uppercase", children: "Active Tasks" }), _jsx("span", { className: "material-symbols-outlined text-primary-container text-[20px]", children: "autorenew" })] }), _jsx("div", { className: "flex items-baseline gap-sm", children: _jsx("span", { className: "font-display-lg text-display-lg text-on-surface", children: metrics.activeTasks }) })] }), _jsxs("div", { className: "card rounded-xl p-md flex flex-col justify-between border", children: [_jsxs("div", { className: "flex items-center justify-between mb-sm", children: [_jsx("span", { className: "font-label-md text-label-md text-on-surface-variant uppercase", children: "Completed Tasks" }), _jsx("span", { className: "material-symbols-outlined text-green-500 text-[20px]", children: "check_circle" })] }), _jsx("div", { className: "flex items-baseline gap-sm", children: _jsx("span", { className: "font-display-lg text-display-lg text-on-surface", children: metrics.completedTasks }) })] }), _jsxs("div", { className: "card rounded-xl p-md flex flex-col justify-between border relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 opacity-5 pointer-events-none", style: { background: 'radial-gradient(circle at top right, #2563eb, transparent 70%)' } }), _jsxs("div", { className: "relative z-10 flex items-center justify-between mb-sm", children: [_jsx("span", { className: "font-label-md text-label-md text-on-surface-variant uppercase", children: "Env Usage" }), _jsx("span", { className: "material-symbols-outlined text-primary-container text-[20px]", children: "memory" })] }), _jsxs("div", { className: "relative z-10 flex flex-col gap-xs", children: [_jsx("div", { className: "flex items-baseline gap-sm", children: _jsxs("span", { className: "font-display-lg text-display-lg text-on-surface", children: ["3", _jsx("span", { className: "text-on-surface-variant font-headline-lg text-headline-lg", children: "/5" })] }) }), _jsx("div", { className: "w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden", children: _jsx("div", { className: "bg-primary-container h-full w-[60%] rounded-full glow-active" }) })] })] })] }), _jsxs("div", { className: "card border rounded-xl overflow-hidden flex flex-col", children: [_jsxs("div", { className: "grid grid-cols-12 gap-sm px-md py-sm border-b border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface-variant uppercase", children: [_jsx("div", { className: "col-span-2", children: "Task ID" }), _jsx("div", { className: "col-span-4", children: "Title" }), _jsx("div", { className: "col-span-2", children: "Application" }), _jsx("div", { className: "col-span-2", children: "Status" }), _jsx("div", { className: "col-span-2 text-right", children: "Updated" })] }), _jsxs("div", { className: "divide-y divide-outline-variant", children: [tasks.map((t) => (_jsxs("div", { onClick: () => navigate(`/tasks/${t.id}`), className: "grid grid-cols-12 gap-sm px-md py-sm items-center hover:bg-surface-container transition-colors group cursor-pointer", children: [_jsx("div", { className: "col-span-2 font-label-md text-label-md text-primary-container", children: t.requirementId }), _jsx("div", { className: "col-span-4 font-body-md text-body-md text-on-surface font-medium truncate pr-sm", children: t.title }), _jsx("div", { className: "col-span-2 font-body-sm text-body-sm text-on-surface-variant", children: appName(t.appId) }), _jsx("div", { className: "col-span-2 flex items-center", children: _jsx(StatusBadge, { status: t.status }) }), _jsxs("div", { className: "col-span-2 font-body-sm text-body-sm text-on-surface-variant flex items-center justify-end gap-2", children: [t.status === 'pending_start' && (_jsx("button", { onClick: async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        await api.startTask(t.id);
                                                        refresh();
                                                    }
                                                    catch (err) {
                                                        alert(err.message);
                                                    }
                                                }, className: "px-2 py-1 bg-primary text-on-primary rounded text-xs hover:opacity-90 transition-opacity", children: "\u52A0\u5165\u961F\u5217" })), _jsx("span", { children: new Date(t.updatedAt).toLocaleString() })] })] }, t.id))), tasks.length === 0 && (_jsx("div", { className: "px-md py-xl text-center text-on-surface-variant font-body-md", children: "\u6682\u65E0\u4EFB\u52A1" }))] })] }), showCreate && (_jsx(CreateTaskDialog, { apps: apps, onClose: () => setShowCreate(false), onCreated: async () => {
                    setShowCreate(false);
                    await refresh();
                } }))] }));
}
function CreateTaskDialog({ apps, onClose, onCreated, }) {
    const [projectId, setProjectId] = useState('project-001');
    const [requirementId, setRequirementId] = useState(`REQ-${Math.floor(Math.random() * 90000 + 10000)}`);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [appId, setAppId] = useState(apps[0]?.appId ?? 'app-001');
    const [planMode, setPlanMode] = useState(true);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    const submit = async () => {
        setBusy(true);
        setErr(null);
        try {
            await api.createTask({ projectId, requirementId, title, content, appId, planMode });
            onCreated();
        }
        catch (e) {
            setErr(e.message);
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/30", onClick: onClose, children: _jsxs("div", { className: "w-full max-w-md rounded-lg border border-outline-variant bg-surface-container p-5 shadow-xl text-on-surface", onClick: (e) => e.stopPropagation(), children: [_jsx("h2", { className: "mb-3 text-base font-semibold", children: "\u52A0\u5165\u4EFB\u52A1\u961F\u5217" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsx(Field, { label: "\u9879\u76EE ID", children: _jsx("input", { className: "w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20", value: projectId, onChange: (e) => setProjectId(e.target.value) }) }), _jsx(Field, { label: "\u9700\u6C42 ID", children: _jsx("input", { className: "w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20", value: requirementId, onChange: (e) => setRequirementId(e.target.value) }) }), _jsx(Field, { label: "\u6807\u9898", children: _jsx("input", { className: "w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20", value: title, onChange: (e) => setTitle(e.target.value) }) }), _jsx(Field, { label: "\u9700\u6C42\u6B63\u6587", children: _jsx("textarea", { rows: 3, className: "w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20", value: content, onChange: (e) => setContent(e.target.value) }) }), _jsx(Field, { label: "\u5E94\u7528", children: _jsx("select", { className: "w-full rounded border border-outline-variant bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20", value: appId, onChange: (e) => setAppId(e.target.value), children: apps.map((a) => (_jsxs("option", { value: a.appId, children: [a.appName, " (", a.appId, ")"] }, a.appId))) }) }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: planMode, onChange: (e) => setPlanMode(e.target.checked) }), _jsx("span", { children: "\u5F00\u542F Plan \u6A21\u5F0F" })] })] }), err && _jsx("p", { className: "mt-2 text-xs text-error", children: err }), _jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [_jsx("button", { onClick: onClose, className: "rounded border border-outline px-3 py-1.5 text-sm text-on-surface hover:bg-surface-bright", children: "\u53D6\u6D88" }), _jsx("button", { disabled: busy || !title, onClick: submit, className: "rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50", children: "\u521B\u5EFA" })] })] }) }));
}
function Field({ label, children }) {
    return (_jsxs("div", { children: [_jsx("div", { className: "mb-1 text-xs text-on-surface-variant", children: label }), children] }));
}
