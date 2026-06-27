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
  const { id } = useParams<{ id: string }>();
  const { detail, logs, error, refresh } = useTask(id);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← 返回任务列表
        </Link>
        <p className="mt-4 text-red-600">加载失败：{error}</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-gray-500">
        <Link to="/" className="text-blue-600 hover:underline">
          ← 返回任务列表
        </Link>
        <p className="mt-4">加载中…</p>
      </div>
    );
  }

  const { task, app, latestPlan, plans, review, env } = detail;

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← 返回任务列表
        </Link>
        <span className="text-xs text-gray-500">每秒刷新一次</span>
      </header>

      <div className="mb-4">
        <Card title="任务进度">
          <StatusTimeline status={task.status} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <TaskMetaCard task={task} app={app} />
          <MRPanel task={task} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <PlanPanel
            task={task}
            latestPlan={latestPlan}
            plans={plans}
            onChange={refresh}
          />
          <CodeReviewPanel task={task} review={review} onChange={refresh} />
          <TestEnvPanel task={task} env={env} review={review} onChange={refresh} />
          <LogList logs={logs} />
        </div>
      </div>
    </div>
  );
}
