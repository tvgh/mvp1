import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from './Card';
export function MRPanel({ task }) {
    const merged = task.status === 'destroying_env' || task.status === 'completed';
    const pending = task.status === 'mr_pending_merge' || task.status === 'creating_mr';
    let phase = '—';
    if (task.status === 'creating_mr')
        phase = 'MR 创建中';
    else if (task.status === 'mr_pending_merge')
        phase = '等待 GitLab 合并 Webhook';
    else if (task.status === 'destroying_env')
        phase = '已合并，正在销毁环境';
    else if (task.status === 'completed')
        phase = '已合并，环境已销毁';
    else if (task.status === 'failed_mr')
        phase = 'MR 创建失败';
    return (_jsxs(Card, { title: "Merge Request", children: [_jsxs("div", { className: "grid grid-cols-[120px_1fr] gap-2 text-sm", children: [_jsx("div", { className: "text-on-surface-variant", children: "MR \u5730\u5740" }), _jsx("div", { className: "font-mono", children: task.mrUrl ? (_jsx("a", { className: "text-primary hover:underline", href: task.mrUrl, target: "_blank", rel: "noreferrer", children: task.mrUrl })) : ('—') }), _jsx("div", { className: "text-on-surface-variant", children: "\u6E90\u5206\u652F" }), _jsx("div", { className: "font-mono", children: task.branchName ?? '—' }), _jsx("div", { className: "text-on-surface-variant", children: "\u76EE\u6807\u5206\u652F" }), _jsx("div", { className: "font-mono", children: task.baseBranch ?? '—' }), _jsx("div", { className: "text-on-surface-variant", children: "\u9636\u6BB5" }), _jsx("div", { children: phase })] }), pending && (_jsx("p", { className: "mt-3 text-xs text-on-surface-variant", children: "\u6A21\u62DF\u5668\u4F1A\u5728\u6570\u79D2\u540E\u81EA\u52A8\u6A21\u62DF GitLab MR \u5408\u5E76 webhook\u3002" })), merged && (_jsx("p", { className: "mt-3 text-xs text-on-surface-variant", children: "MR \u5DF2\u5408\u5E76\uFF0C\u73AF\u5883\u9500\u6BC1\u540E\u4EFB\u52A1\u8FDB\u5165\u5DF2\u5B8C\u6210\u72B6\u6001\u3002" }))] }));
}
