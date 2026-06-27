import { Router } from 'express';
import { EnvRecord, nowISO, store } from '../store.js';

export const appsRouter = Router();

appsRouter.get('/apps', (_req, res) => {
  res.json({ apps: Array.from(store.apps.values()) });
});

appsRouter.get('/apps/:appId', (req, res) => {
  const app = store.apps.get(req.params.appId);
  if (!app) return res.status(404).json({ error: 'not found' });
  res.json(app);
});

appsRouter.get('/apps/:appId/aiwx-envs/count', (req, res) => {
  const app = store.apps.get(req.params.appId);
  if (!app) return res.status(404).json({ error: 'not found' });
  let current = 0;
  for (const env of store.envs.values()) {
    if (env.appId === req.params.appId && env.status !== 'destroyed') current++;
  }
  res.json({ current, limit: app.aiwxEnvLimit });
});

appsRouter.post('/apps/:appId/aiwx-envs', (req, res) => {
  const app = store.apps.get(req.params.appId);
  if (!app) return res.status(404).json({ error: 'not found' });
  const { taskId, requirementId, branchName, commitId } = req.body ?? {};
  const envId = `env-${requirementId ?? Math.floor(Math.random() * 10000)}`;
  const env: EnvRecord = {
    envId,
    envName: `AIWX-${requirementId}`,
    envUrl: `https://aiwx-${String(requirementId).toLowerCase()}.example.com`,
    appId: app.appId,
    taskId,
    branchName,
    commitId,
    status: 'running',
    createdAt: nowISO(),
  };
  store.envs.set(envId, env);
  res.json({ envId, envName: env.envName, envUrl: env.envUrl });
});

appsRouter.delete('/apps/:appId/aiwx-envs/:envId', (req, res) => {
  const env = store.envs.get(req.params.envId);
  if (!env) return res.status(404).json({ error: 'not found' });
  env.status = 'destroyed';
  store.envs.set(env.envId, env);
  res.json({ ok: true });
});

appsRouter.post('/apps/:appId/aiwx-pipelines/:pipelineId/run', (req, res) => {
  res.json({ ok: true, runId: `run-${Math.floor(Math.random() * 100000)}` });
});
