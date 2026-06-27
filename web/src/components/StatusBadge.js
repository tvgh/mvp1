import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const LABEL = {
    pending_start: '待开始',
    queued: '排队中',
    locking_baseline: '基线锁定中',
    preparing_sandbox: '沙箱准备中',
    planning: 'Plan 生成中',
    plan_pending_confirm: 'Plan 待确认',
    coding: '代码生成中',
    patch_checking: 'Patch 校验中',
    code_pending_review: '代码待确认',
    pushing_branch: '分支推送中',
    deploying: '流水线部署中',
    testing_pending: '待用户测试',
    creating_mr: 'MR 创建中',
    mr_pending_merge: 'MR 待合并',
    destroying_env: '环境销毁中',
    completed: '已完成',
    failed_baseline: '基线失败',
    failed_plan: 'Plan 失败',
    failed_patch: 'Patch 失败',
    failed_push: 'Push 失败',
    failed_pipeline: '流水线失败',
    failed_mr: 'MR 失败',
    failed_destroy_env: '销毁失败',
    cancelled: '已取消',
};
function getBadgeConfig(status) {
    if (status === 'completed') {
        return {
            className: 'badge-completed border-green-200',
            icon: _jsx("span", { className: "material-symbols-outlined text-[14px]", children: "check_circle" }),
        };
    }
    if (status === 'cancelled' || status === 'queued' || status === 'pending_start') {
        return {
            className: 'badge-queued border-slate-200',
            icon: _jsx("span", { className: "material-symbols-outlined text-[14px]", children: "schedule" }),
        };
    }
    if (status.startsWith('failed_')) {
        return {
            className: 'badge-failed border-red-200',
            icon: _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-500" }),
        };
    }
    if (status === 'plan_pending_confirm' ||
        status === 'code_pending_review' ||
        status === 'testing_pending' ||
        status === 'mr_pending_merge') {
        return {
            className: 'badge-testing border-purple-200',
            icon: _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-purple-500" }),
        };
    }
    return {
        className: 'badge-processing border-blue-200',
        icon: _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" }),
    };
}
export function StatusBadge({ status }) {
    const config = getBadgeConfig(status);
    return (_jsxs("span", { className: `px-2 py-1 rounded-full font-label-md text-label-md flex items-center gap-xs w-max border ${config.className}`, children: [config.icon, LABEL[status] ?? status] }));
}
export { LABEL as STATUS_LABEL };
