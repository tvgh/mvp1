# AIWX Coding Agent MVP

Mock backend + React frontend prototype of the AIWX Coding Agent automated development flow.

## Run

```bash
npm install
npm run dev
```

- Backend: http://localhost:4000
- Frontend: http://localhost:5173

Open the frontend URL. The seeded tasks will auto-advance through the state machine; user gates (Plan confirm, code review, test result) are interactive in the UI.

## Layout

- `server/` — Express mock backend with in-memory store and a simulator that auto-advances tasks.
- `web/` — Vite + React + Tailwind + shadcn UI.

State is in-memory only and resets on server restart.
