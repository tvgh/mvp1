import type { TaskStatus } from '../api/types';
import { STATUS_LABEL } from './StatusBadge';

const HAPPY: TaskStatus[] = [
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

function stepClass(idx: number, currentIdx: number, isFailed: boolean) {
  if (isFailed && idx === currentIdx) return 'bg-red-500 text-white border-red-500';
  if (idx < currentIdx) return 'bg-green-500 text-white border-green-500';
  if (idx === currentIdx) return 'bg-blue-500 text-white border-blue-500 animate-pulse';
  return 'bg-white text-gray-400 border-gray-300';
}

export function StatusTimeline({ status }: { status: TaskStatus }) {
  const isFailed = status.startsWith('failed_');
  const failureMap: Partial<Record<TaskStatus, TaskStatus>> = {
    failed_baseline: 'locking_baseline',
    failed_plan: 'planning',
    failed_patch: 'patch_checking',
    failed_push: 'pushing_branch',
    failed_pipeline: 'deploying',
    failed_mr: 'creating_mr',
    failed_destroy_env: 'destroying_env',
  };
  const effective = (failureMap[status] ?? status) as TaskStatus;
  const currentIdx = HAPPY.indexOf(effective);

  return (
    <div className="overflow-x-auto pb-2">
      <ol className="flex items-center gap-1 min-w-max">
        {HAPPY.map((s, i) => (
          <li key={s} className="flex items-center gap-1">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold ${stepClass(i, currentIdx, isFailed)}`}
            >
              {i + 1}
            </div>
            <div className="text-[11px] whitespace-nowrap text-gray-600 max-w-[88px] truncate">
              {STATUS_LABEL[s]}
            </div>
            {i < HAPPY.length - 1 && (
              <div
                className={`h-px w-4 ${i < currentIdx ? 'bg-green-400' : 'bg-gray-300'}`}
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
