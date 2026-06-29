import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
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

  const breadcrumbItems = [
    { label: '首页', to: '/' },
    { label: '任务列表', to: '/' },
    { label: id ? `任务 ${id}` : '任务详情' },
  ];

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={breadcrumbItems} />
        <p className="mt-4 text-error">加载失败：{error}</p>
        <Link to="/" className="mt-2 inline-block text-sm text-primary hover:underline">
          ← 返回任务列表
        </Link>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-7xl text-sm text-on-surface-variant">
        <Breadcrumb items={breadcrumbItems} />
        <p className="mt-4">加载中…</p>
      </div>
    );
  }

  const { task, app, latestPlan, plans, review, env } = detail;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="sticky -top-margin-mobile md:-top-margin-desktop z-10 bg-background/90 backdrop-blur-md flex items-center justify-between border-b border-outline-variant -mx-margin-mobile md:-mx-margin-desktop px-margin-mobile md:px-margin-desktop pt-margin-mobile md:pt-margin-desktop pb-4 mb-4">
        <Breadcrumb items={breadcrumbItems} />
        <span className="text-xs text-on-surface-variant">每秒刷新一次</span>
      </header>

      <div className="mb-4">
        <Card title="任务进度">
          <StatusTimeline status={task.status} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <TaskMetaCard task={task} app={app} onChange={refresh} />
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
