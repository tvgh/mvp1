async function jsonFetch(url, init) {
    const res = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });
    if (!res.ok) {
        let detail = '';
        try {
            detail = JSON.stringify(await res.json());
        }
        catch {
            /* ignore */
        }
        throw new Error(`${res.status} ${res.statusText} ${detail}`);
    }
    return (await res.json());
}
export const api = {
    listTasks: () => jsonFetch('/api/aiwx/tasks'),
    getTask: (id) => jsonFetch(`/api/aiwx/tasks/${id}`),
    getLogs: (id) => jsonFetch(`/api/aiwx/tasks/${id}/logs`),
    listApps: () => jsonFetch('/api/apps'),
    createTask: (body) => jsonFetch('/api/aiwx/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
    }),
    confirmPlan: (id) => jsonFetch(`/api/aiwx/tasks/${id}/plan/confirm`, { method: 'POST' }),
    rejectPlan: (id, feedback) => jsonFetch(`/api/aiwx/tasks/${id}/plan/reject`, {
        method: 'POST',
        body: JSON.stringify({ feedback }),
    }),
    confirmReview: (id) => jsonFetch(`/api/aiwx/tasks/${id}/review/confirm`, { method: 'POST' }),
    rejectReview: (id, feedback) => jsonFetch(`/api/aiwx/tasks/${id}/review/reject`, {
        method: 'POST',
        body: JSON.stringify({ feedback }),
    }),
    testPass: (id) => jsonFetch(`/api/aiwx/tasks/${id}/test/pass`, { method: 'POST' }),
    testFail: (id, feedback) => jsonFetch(`/api/aiwx/tasks/${id}/test/fail`, {
        method: 'POST',
        body: JSON.stringify({ feedback }),
    }),
    startTask: (id) => jsonFetch(`/api/aiwx/tasks/${id}/start`, { method: 'POST' }),
};
