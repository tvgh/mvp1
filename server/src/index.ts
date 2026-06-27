import cors from 'cors';
import express from 'express';
import { appsRouter } from './routes/apps.js';
import { gitlabRouter } from './routes/gitlab.js';
import { tasksRouter } from './routes/tasks.js';
import { seed } from './seed.js';
import { config, startSimulator } from './simulator.js';

const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/config', (_req, res) => res.json({ failureRate: config.failureRate }));
app.post('/api/config', (req, res) => {
  if (typeof req.body?.failureRate === 'number') {
    config.failureRate = Math.max(0, Math.min(1, req.body.failureRate));
  }
  res.json({ failureRate: config.failureRate });
});

app.use('/api/aiwx', tasksRouter);
app.use('/api', appsRouter);
app.use('/api/gitlab', gitlabRouter);

seed();
startSimulator();

app.listen(PORT, () => {
  console.log(`[server] mock backend listening on http://localhost:${PORT}`);
});
