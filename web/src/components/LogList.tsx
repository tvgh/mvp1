import type { LogEntry } from '../api/types';
import { Card } from './Card';

function color(status: LogEntry['status']) {
  if (status === 'fail') return 'text-red-600';
  if (status === 'success') return 'text-green-600';
  return 'text-gray-600';
}

function actor(a: LogEntry['actor']) {
  return {
    user: '用户',
    coding_agent: 'Coding Agent',
    gitlab: 'GitLab',
    app_center: '应用中心',
    system: '系统',
  }[a];
}

export function LogList({ logs }: { logs: LogEntry[] }) {
  return (
    <Card title={`操作记录 (${logs.length})`}>
      <ol className="max-h-[420px] space-y-1.5 overflow-auto text-xs">
        {logs
          .slice()
          .reverse()
          .map((l, i) => (
            <li
              key={`${l.createdAt}-${i}`}
              className="grid grid-cols-[150px_100px_90px_1fr] gap-2 border-b border-gray-50 py-1"
            >
              <span className="font-mono text-gray-400">
                {new Date(l.createdAt).toLocaleTimeString()}
              </span>
              <span className="text-gray-500">{actor(l.actor)}</span>
              <span className={`font-mono ${color(l.status)}`}>{l.action}</span>
              <span className="text-gray-700">{l.message}</span>
            </li>
          ))}
        {logs.length === 0 && <li className="text-gray-400">暂无日志</li>}
      </ol>
    </Card>
  );
}
