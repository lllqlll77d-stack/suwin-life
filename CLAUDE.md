# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (port 3000, uses webpack)
npm run build    # Production build (uses webpack)
npm run start    # Start production server
npm run lint     # Run ESLint (Next.js core-web-vitals + typescript configs)
```

No test runner is configured yet.

## Architecture

This is a **Next.js 16 App Router** app — a personal AI companion called "Suwin's Cosmos". It's a chat-based journal where the user shares daily experiences and the AI (DeepSeek) responds conversationally, classifies entries, extracts long-term memories, and generates daily summaries.

**Three client-side pages** (all `'use client'`, Y2K pink aesthetic with glass morphism):
- `/` — Loading/enter screen with animated progress bar → navigates to `/chat`
- `/chat` — Main chat interface with streaming AI responses
- `/history` — Timeline of past records with category filtering
- `/summary` — Daily AI-generated summaries with date picker

**Password protection** — `PasswordGate` client component (`src/components/auth/PasswordGate.tsx`) wraps the entire app in the root layout. On first visit, shows a password input page; on correct entry, stores a hashed token in `localStorage` so repeat visits skip the gate. Password is verified server-side via `POST /api/auth` against the `SITE_PASSWORD` env var. If `SITE_PASSWORD` is unset, the gate is skipped entirely.

**Three API routes** (server-side via App Router route handlers):
- `POST /api/chat` — Main chat: SSE streaming. Injects relevant memories into the system prompt, streams the DeepSeek response token-by-token, parses a `<<<CLASSIFY>>>` block from the response for category tagging, and fires background memory extraction.
- `POST /api/summarize` — Takes a date + array of records, asks DeepSeek for a structured JSON summary (content, highlights, suggestions).
- `POST /api/auth` — Verifies a password against `SITE_PASSWORD` env var, returns a hashed token for localStorage persistence. `GET /api/auth` returns whether password protection is configured.

**Data layer** — client-side IndexedDB via Dexie.js (`src/lib/db.ts`) with three tables:
- `records` — Every user message + AI response, indexed by timestamp and categories
- `dailySummaries` — Cached AI-generated daily summaries, keyed by date string
- `memories` — Extracted long-term facts about the user, with key-based upsert

**AI pipeline** (DeepSeek Chat via `src/lib/deepseek.ts`):
1. `buildChatSystemPrompt()` injects relevant memories (bigram-overlap scored, `src/lib/memory.ts`)
2. Response is streamed via SSE; the model appends `<<<CLASSIFY>>>{"categories": [...]}<<<END>>>` at the end
3. `parseClassification()` strips the classify block from displayed text and extracts categories
4. After response completes, `extractAndStoreMemories()` runs as a non-blocking background side-effect — asks DeepSeek to extract key facts and upserts them into the `memories` table

**State management** — `ChatContext.tsx` uses `useReducer` for chat state (messages, streaming flag, pet state). The `sendMessage` function handles the full lifecycle: add user message → fetch SSE → dispatch chunks → parse classification → save to IndexedDB.

## Key dependencies

- **`deepseek-chat`** model via its OpenAI-compatible API (key in `.env.local` as `DEEPSEEK_API_KEY`)
- **Tailwind CSS v4** with `@tailwindcss/postcss` — custom pink/lavender design tokens in `globals.css`
- **Dexie.js** for IndexedDB — all data is client-side, no backend database
