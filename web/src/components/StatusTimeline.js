import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { STATUS_LABEL } from './StatusBadge';
const HAPPY = [
    'queued',
    'locking_baseline',
    'preparing_sandbox',
    'planning',
    'plan_pending_confirm',
    'coding',
    'patch_checking',
    'code_pending_review',
    'pushing_branch',
    'deploying',
    'testing_pending',
    'creating_mr',
    'mr_pending_merge',
    'destroying_env',
    'completed',
];
function stepClass(idx, currentIdx, isFailed) {
    if (isFailed && idx === currentIdx)
        return 'bg-error text-on-error border-error';
    if (idx < currentIdx)
        return 'bg-green-500 text-white border-green-500';
    if (idx === currentIdx)
        return 'bg-primary text-on-primary border-primary animate-pulse';
    return 'bg-surface-container text-outline border-outline-variant';
}
export function StatusTimeline({ status }) {
    const isFailed = status.startsWith('failed_');
    const failureMap = {
        failed_baseline: 'locking_baseline',
        failed_plan: 'planning',
        failed_patch: 'patch_checking',
        failed_push: 'pushing_branch',
        failed_pipeline: 'deploying',
        failed_mr: 'creating_mr',
        failed_destroy_env: 'destroying_env',
    };
    const effective = (failureMap[status] ?? status);
    const currentIdx = HAPPY.indexOf(effective);
    return (_jsx("div", { className: "overflow-x-auto pb-2", children: _jsx("ol", { className: "flex items-center gap-1 min-w-max", children: HAPPY.map((s, i) => (_jsxs("li", { className: "flex items-center gap-1", children: [_jsx("div", { className: `flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold ${stepClass(i, currentIdx, isFailed)}`, children: i + 1 }), _jsx("div", { className: "text-[11px] whitespace-nowrap text-on-surface-variant max-w-[88px] truncate", children: STATUS_LABEL[s] }), i < HAPPY.length - 1 && (_jsx("div", { className: `h-px w-4 ${i < currentIdx ? 'bg-green-500' : 'bg-outline-variant'}` }))] }, s))) }) }));
}
