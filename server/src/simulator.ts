import {
  EnvRecord,
  Plan,
  ReviewInfo,
  Task,
  appendLog,
  getEnvForTask,
  getLatestPlan,
  nowISO,
  store,
} from './store.js';
import { transition } from './stateMachine.js';
import {
  generateChangeSummary,
  generatePatch,
  generatePlan,
  generateTestSuggestion,
  randomHex,
} from './mockContent.js';

const TICK_MS = 1500;
const MR_AUTO_MERGE_TICKS = 4;

export const config = {
  failureRate: 0,
};

function pickFailure(): boolean {
  return config.failureRate > 0 && Math.random() < config.failureRate;
}

function step(task: Task) {
  const app = store.apps.get(task.appId);
  if (!app) return;

  switch (task.status) {
    case 'queued': {
      transition(task, 'locking_baseline', `开始锁定 ${app.appName} 基线`);
      break;
    }

    case 'locking_baseline': {
      task.baseBranch = app.defaultBranch;
      task.baseCommit = randomHex(8);
      transition(
        task,
        'preparing_sandbox',
        `锁定 baseBranch=${task.baseBranch}, baseCommit=${task.baseCommit}`,
      );
      break;
    }

    case 'preparing_sandbox': {
      task.sandboxId = `sb-${task.projectId}`;
      task.branchName = `aiwx/feat-${task.requirementId}`;
      appendLog({
        taskId: task.id,
        action: 'sandbox:ready',
        actor: 'coding_agent',
        status: 'success',
        message: `沙箱 ${task.sandboxId} 已就绪，分支 ${task.branchName}`,
      });
      if (task.planMode) {
        transition(task, 'planning', '开始生成 Plan');
      } else {
        transition(task, 'coding', '跳过 Plan，直接生成代码');
      }
      break;
    }

    case 'planning': {
      if (pickFailure()) {
        task.failReason = 'LLM 生成 Plan 超时';
        transition(task, 'failed_plan', task.failReason);
        break;
      }
      const arr = store.plans.get(task.id) ?? [];
      const version = arr.length + 1;
      const plan: Plan = {
        taskId: task.id,
        version,
        content: generatePlan(task, version),
        status: 'pending_confirm',
        createdAt: nowISO(),
      };
      arr.push(plan);
      store.plans.set(task.id, arr);
      transition(task, 'plan_pending_confirm', `Plan v${version} 已生成，等待用户确认`);
      break;
    }

    case 'plan_pending_confirm':
      return;

    case 'coding': {
      transition(task, 'patch_checking', '生成代码并执行 git apply --check');
      break;
    }

    case 'patch_checking': {
      if (pickFailure()) {
        task.failReason = 'git apply --check 失败：补丁与基线冲突';
        transition(task, 'failed_patch', task.failReason);
        break;
      }
      const review: ReviewInfo = {
        taskId: task.id,
        patchContent: generatePatch(task),
        diffHtmlUrl: `/api/aiwx/tasks/${task.id}/diff`,
        changeSummary: generateChangeSummary(task),
        testSuggestion: generateTestSuggestion(task),
        status: 'pending_review',
        createdAt: nowISO(),
      };
      store.reviews.set(task.id, review);
      transition(task, 'code_pending_review', 'Patch 校验通过，等待用户 Review');
      break;
    }

    case 'code_pending_review':
      return;

    case 'pushing_branch': {
      if (pickFailure()) {
        task.failReason = 'git push 被拒：远端分支已存在不同 commit';
        transition(task, 'failed_push', task.failReason);
        break;
      }
      appendLog({
        taskId: task.id,
        action: 'gitlab:push',
        actor: 'coding_agent',
        status: 'success',
        message: `推送分支 ${task.branchName} 到 GitLab`,
      });
      transition(task, 'deploying', 'GitLab Webhook 已触发，开始部署 AIWX 临时环境');
      break;
    }

    case 'deploying': {
      if (pickFailure()) {
        task.failReason = '流水线失败：构建阶段单元测试未通过';
        transition(task, 'failed_pipeline', task.failReason);
        break;
      }
      const envId = `env-${task.requirementId}`;
      const env: EnvRecord = {
        envId,
        envName: `AIWX-${task.requirementId}`,
        envUrl: `https://aiwx-${task.requirementId.toLowerCase()}.example.com`,
        appId: task.appId,
        taskId: task.id,
        branchName: task.branchName!,
        commitId: task.baseCommit!,
        status: 'running',
        createdAt: nowISO(),
      };
      store.envs.set(envId, env);
      task.envId = envId;
      appendLog({
        taskId: task.id,
        action: 'pipeline:success',
        actor: 'app_center',
        status: 'success',
        message: `AIWX 环境 ${env.envName} 已部署：${env.envUrl}`,
      });
      transition(task, 'testing_pending', '流水线成功，等待用户测试');
      break;
    }

    case 'testing_pending':
      return;

    case 'creating_mr': {
      if (pickFailure()) {
        task.failReason = 'MR 创建失败：目标分支保护规则';
        transition(task, 'failed_mr', task.failReason);
        break;
      }
      task.mrUrl = `https://gitlab.example.com/demo/${task.appId}/-/merge_requests/${Math.floor(
        Math.random() * 900 + 100,
      )}`;
      task.mrTickCounter = 0;
      appendLog({
        taskId: task.id,
        action: 'gitlab:mr_create',
        actor: 'coding_agent',
        status: 'success',
        message: `MR 已创建：${task.mrUrl}`,
      });
      transition(task, 'mr_pending_merge', 'MR 已创建，等待合并');
      break;
    }

    case 'mr_pending_merge': {
      task.mrTickCounter = (task.mrTickCounter ?? 0) + 1;
      if (task.mrTickCounter >= MR_AUTO_MERGE_TICKS) {
        appendLog({
          taskId: task.id,
          action: 'gitlab:mr_merge',
          actor: 'gitlab',
          status: 'success',
          message: `MR 已被合并到 ${task.baseBranch}`,
        });
        transition(task, 'destroying_env', '收到 GitLab MR 合并 Webhook，开始销毁环境');
      }
      break;
    }

    case 'destroying_env': {
      if (task.envId) {
        const env = store.envs.get(task.envId);
        if (env) {
          env.status = 'destroyed';
          store.envs.set(env.envId, env);
        }
      }
      appendLog({
        taskId: task.id,
        action: 'env:destroyed',
        actor: 'app_center',
        status: 'success',
        message: 'AIWX 临时环境已销毁',
      });
      transition(task, 'completed', '任务完成');
      break;
    }

    case 'completed':
    case 'cancelled':
    case 'failed_baseline':
    case 'failed_plan':
    case 'failed_patch':
    case 'failed_push':
    case 'failed_pipeline':
    case 'failed_mr':
    case 'failed_destroy_env':
      return;
  }
}

let timer: NodeJS.Timeout | null = null;

export function startSimulator() {
  if (timer) return;
  timer = setInterval(() => {
    for (const task of store.tasks.values()) {
      try {
        step(task);
      } catch (err) {
        console.error(`[simulator] task ${task.id} error:`, err);
      }
    }
  }, TICK_MS);
}

export function stopSimulator() {
  if (timer) clearInterval(timer);
  timer = null;
}

// helpers called from routes to nudge user-gated transitions

export function confirmPlan(taskId: string): { ok: boolean; reason?: string } {
  const task = store.tasks.get(taskId);
  if (!task) return { ok: false, reason: 'task not found' };
  if (task.status !== 'plan_pending_confirm') {
    return { ok: false, reason: `task not in plan_pending_confirm (was ${task.status})` };
  }
  const plan = getLatestPlan(taskId);
  if (plan) {
    plan.status = 'confirmed';
  }
  const r = transition(task, 'coding', '用户已确认 Plan', 'user');
  return r.ok ? { ok: true } : { ok: false, reason: r.reason };
}

export function rejectPlan(taskId: string, feedback: string): { ok: boolean; reason?: string } {
  const task = store.tasks.get(taskId);
  if (!task) return { ok: false, reason: 'task not found' };
  if (task.status !== 'plan_pending_confirm') {
    return { ok: false, reason: `task not in plan_pending_confirm (was ${task.status})` };
  }
  const plan = getLatestPlan(taskId);
  if (plan) {
    plan.status = 'rejected';
    plan.feedback = feedback;
  }
  const r = transition(task, 'planning', `用户驳回 Plan：${feedback}`, 'user');
  return r.ok ? { ok: true } : { ok: false, reason: r.reason };
}

export function confirmReview(taskId: string): { ok: boolean; reason?: string } {
  const task = store.tasks.get(taskId);
  if (!task) return { ok: false, reason: 'task not found' };
  if (task.status !== 'code_pending_review') {
    return { ok: false, reason: `task not in code_pending_review (was ${task.status})` };
  }
  const review = store.reviews.get(taskId);
  if (review) review.status = 'confirmed';
  const r = transition(task, 'pushing_branch', '用户已确认代码', 'user');
  return r.ok ? { ok: true } : { ok: false, reason: r.reason };
}

export function rejectReview(
  taskId: string,
  feedback: string,
): { ok: boolean; reason?: string } {
  const task = store.tasks.get(taskId);
  if (!task) return { ok: false, reason: 'task not found' };
  if (task.status !== 'code_pending_review') {
    return { ok: false, reason: `task not in code_pending_review (was ${task.status})` };
  }
  const review = store.reviews.get(taskId);
  if (review) {
    review.status = 'rejected';
    review.feedback = feedback;
  }
  const r = transition(task, 'coding', `用户驳回代码：${feedback}`, 'user');
  return r.ok ? { ok: true } : { ok: false, reason: r.reason };
}

export function testPass(taskId: string): { ok: boolean; reason?: string } {
  const task = store.tasks.get(taskId);
  if (!task) return { ok: false, reason: 'task not found' };
  if (task.status !== 'testing_pending') {
    return { ok: false, reason: `task not in testing_pending (was ${task.status})` };
  }
  const r = transition(task, 'creating_mr', '用户测试通过', 'user');
  return r.ok ? { ok: true } : { ok: false, reason: r.reason };
}

export function testFail(
  taskId: string,
  feedback: string,
): { ok: boolean; reason?: string } {
  const task = store.tasks.get(taskId);
  if (!task) return { ok: false, reason: 'task not found' };
  if (task.status !== 'testing_pending') {
    return { ok: false, reason: `task not in testing_pending (was ${task.status})` };
  }
  // destroy current env so a new one can be created on re-deploy
  if (task.envId) {
    const env = store.envs.get(task.envId);
    if (env) {
      env.status = 'destroyed';
      store.envs.set(env.envId, env);
    }
    task.envId = undefined;
  }
  const r = transition(task, 'coding', `用户测试不通过：${feedback}`, 'user');
  return r.ok ? { ok: true } : { ok: false, reason: r.reason };
}

export { getEnvForTask };
