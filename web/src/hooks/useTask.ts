import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { LogEntry, TaskDetail } from '../api/types';

const TERMINAL: ReadonlySet<string> = new Set(['completed', 'cancelled']);

export function useTask(id: string | undefined) {
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let stop = false;

    const fetchOnce = async () => {
      try {
        const [d, l] = await Promise.all([api.getTask(id), api.getLogs(id)]);
        if (!stop) {
          setDetail(d);
          setLogs(l.logs);
          if (TERMINAL.has(d.task.status)) {
            clearInterval(timer);
          }
        }
      } catch (e: any) {
        if (!stop) setError(e.message);
      }
    };

    fetchOnce();
    const timer = setInterval(fetchOnce, 1000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [id]);

  const refresh = async () => {
    if (!id) return;
    const [d, l] = await Promise.all([api.getTask(id), api.getLogs(id)]);
    setDetail(d);
    setLogs(l.logs);
  };

  return { detail, logs, error, refresh };
}
