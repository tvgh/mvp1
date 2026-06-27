import { useEffect, useState } from 'react';
import { api } from '../api/client';
export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        let stop = false;
        const fetchOnce = async () => {
            try {
                const { tasks } = await api.listTasks();
                if (!stop)
                    setTasks(tasks);
            }
            catch (e) {
                if (!stop)
                    setError(e.message);
            }
        };
        fetchOnce();
        const id = setInterval(fetchOnce, 2000);
        return () => {
            stop = true;
            clearInterval(id);
        };
    }, []);
    return { tasks, error, refresh: () => api.listTasks().then((r) => setTasks(r.tasks)) };
}
