import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from './Card';
function color(status) {
    if (status === 'fail')
        return 'text-error';
    if (status === 'success')
        return 'text-green-500';
    return 'text-on-surface-variant';
}
function actor(a) {
    return {
        user: '用户',
        coding_agent: 'Coding Agent',
        gitlab: 'GitLab',
        app_center: '应用中心',
        system: '系统',
    }[a];
}
export function LogList({ logs }) {
    return (_jsx(Card, { title: `操作记录 (${logs.length})`, children: _jsxs("ol", { className: "max-h-[420px] space-y-1.5 overflow-auto text-xs", children: [logs
                    .slice()
                    .reverse()
                    .map((l, i) => (_jsxs("li", { className: "grid grid-cols-[150px_100px_90px_1fr] gap-2 border-b border-outline-variant py-1", children: [_jsx("span", { className: "font-mono text-on-surface-variant", children: new Date(l.createdAt).toLocaleTimeString() }), _jsx("span", { className: "text-on-surface-variant", children: actor(l.actor) }), _jsx("span", { className: `font-mono ${color(l.status)}`, children: l.action }), _jsx("span", { className: "text-on-surface", children: l.message })] }, `${l.createdAt}-${i}`))), logs.length === 0 && _jsx("li", { className: "text-on-surface-variant", children: "\u6682\u65E0\u65E5\u5FD7" })] }) }));
}
