# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root — npm workspaces fan out to `server/` and `web/`.

- `npm install` — install both workspaces
- `npm run dev` — run server (`:4000`) and web (`:5173`) concurrently; Vite proxies `/api` → server
- `npm run dev:server` / `npm run dev:web` — run one side only
- `npm run build` — typecheck + build both workspaces
- `npm --workspace server run start` — run the built server from `dist/`

There is no test runner and no lint config. Type-checking is the only static check: `cd server && npx tsc --noEmit` or `cd web && npx tsc --noEmit`.

Stray compiled `.js` files exist next to `.tsx`/`.ts` sources in `web/src/` — ignore them, edit only the TypeScript.

## Architecture

This is a **mock backend + React frontend prototype** of an AI coding-agent automation flow. All state is in-memory; restart the server to reset.

### Server (`server/`, Express + tsx)

Three pieces drive the entire task lifecycle:

1. **`store.ts`** — single in-memory store (`Map`s for tasks, apps, plans, reviews, envs, logs). The `TaskStatus` union is the source of truth for the state machine; mirror any change in `web/src/api/types.ts`.

2. **`stateMachine.ts`** — `ALLOWED: Record<TaskStatus, TaskStatus[]>` defines every legal transition. `transition()` enforces it and writes a log entry. New statuses **must** be added to `ALLOWED` (it's exhaustive on `TaskStatus`) and considered in the simulator's switch.

3. **`simulator.ts`** — `setInterval` ticks every 1500ms; one `switch` per `TaskStatus` advances each task one step. User-gated states (`plan_pending_confirm`, `code_pending_review`, `testing_pending`, `mr_pending_merge`) `return` and wait for the matching helper (`confirmPlan`, `rejectReview`, `testPass`, …) called from a route. `config.failureRate` injects random failures into pickFailure-checked steps.

Routes in `server/src/routes/` (`tasks.ts`, `apps.ts`, `gitlab.ts`) are thin: validate input → call `transition()` or a simulator helper → return `{ ok: true }` or `{ error }`. The simulator and the routes are the **only** writers to `task.status` — both must go through `transition()`.

`seed.ts` populates demo apps/tasks on startup.

### Web (`web/`, Vite + React 18 + Tailwind)

- **Routes** (`App.tsx`): `/` → `TaskList`, `/tasks/:id` → `TaskDetail`
- **Data layer**: `api/client.ts` (typed fetch wrappers) + `hooks/useTask.ts` (polls a single task every 1s, stops at terminal states) + `hooks/useTasks.ts` (polls list every 2s)
- **Detail page composition** (`pages/TaskDetail.tsx`): `StatusTimeline` + `TaskMetaCard` + `MRPanel` + `PlanPanel` + `CodeReviewPanel` + `TestEnvPanel` + `LogList`. Each panel renders/acts based on `task.status`; pass `onChange={refresh}` so user actions trigger an immediate refetch instead of waiting for the next poll.
- **Status display** lives in two places that must stay in sync with `TaskStatus`:
  - `components/StatusBadge.tsx` — `LABEL` map (Chinese labels) + `getBadgeConfig` (badge color group)
  - `components/StatusTimeline.tsx` — `HAPPY` ordered array + `failureMap` (folds failed_X back onto its happy-path step)

### Adding or changing a status — checklist

A status change touches both packages. Miss any of these and TypeScript will complain or the UI will silently drop the state:

1. `server/src/store.ts` — add to `TaskStatus` union
2. `web/src/api/types.ts` — same addition
3. `server/src/stateMachine.ts` — add row to `ALLOWED`; consider `HAPPY_PATH`/`TERMINAL`/`USER_GATES` if relevant
4. `server/src/simulator.ts` — add a case to the `step()` switch (or `return` for a user-gated state)
5. `web/src/components/StatusBadge.tsx` — add to `LABEL` and assign a badge group in `getBadgeConfig`
6. `web/src/components/StatusTimeline.tsx` — insert into `HAPPY` if it's on the happy path; map failure→step in `failureMap` if it's a `failed_X`

### Conventions

- All log/UI strings are Chinese (this is an internal-tools demo).
- Server uses ESM (`"type": "module"`) — relative imports must include `.js` extensions even in `.ts` files.
- The state machine and UI labels assume the happy path is linear; branching gates (reject/retry) loop back to an earlier status via explicit `ALLOWED` entries.
