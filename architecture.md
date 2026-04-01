# NexusAI Architecture Draft

This is the root architecture summary for the NexusAI build. The detailed working plan lives in `.claude/architecture-plan.md`.

## Repositories

- `frontend/`: Next.js App Router application that will host the landing page, chat hub, marketplace, agents, and discover surfaces
- `backend/`: NestJS API that will provide auth, guest sessions, model catalog, chat persistence, uploads, analytics, and provider integrations

## Product Shape

- Light modern UI based on `frontend/index.html` and `frontend/screenshots/`
- Core app shell with `Chat Hub`, `Marketplace`, `Agents`, and `Discover New`
- Three-column chat interface with model list, chat center, and right insights/actions panel
- Guest-first experience with exact 3-hour local session expiry and later upgrade to permanent account history
- Smart capability routing that generates facilitation prompts when the active model lacks image, audio, video, or vision support

## Frontend Draft

- Next.js App Router
- React 19
- MUI theme system
- Context API state domains for auth, guest session, active model, chat, and marketplace filters
- Browser integrations for voice-to-text, TTS, and camera snapshot input

## Backend Draft

- NestJS modular architecture
- MongoDB with Mongoose
- JWT auth plus refresh tokens
- Model catalog service and analytics service
- Chat persistence, uploads, and guest session upgrade flow
- AI provider abstraction with Kimi as the first adapter

## Delivery Notes

- Keep changes incremental and grouped logically.
- Cache model catalog data on both frontend and backend.
- Use pagination or virtualization for large marketplace/model lists.
- Do not treat compile success as done; the build must pass QA and analyzer loops.

---

## ✅ Implementation Summary

### Status: Phases 0–3 Complete

### Frontend (Next.js 16 App Router)
```
frontend/
  src/
    app/
      page.tsx               ← Landing page
      layout.tsx             ← Root layout (Navbar + Providers)
      globals.css            ← Design tokens + global styles
      chat/page.tsx          ← Chat Hub (3-column layout)
      marketplace/page.tsx   ← Marketplace (grid + filters + modal)
      discover/page.tsx      ← Discover New models
      agents/page.tsx        ← Agent builder + wizard
      auth/login/page.tsx    ← Login
      auth/signup/page.tsx   ← Signup
      dashboard/page.tsx     ← Dashboard overview
      dashboard/layout.tsx   ← Dashboard sidebar layout
      dashboard/history/     ← Chat history
      dashboard/settings/    ← Account settings
      dashboard/billing/     ← Plans & billing
    components/
      Navbar.tsx             ← Sticky navbar + language selector (RTL)
      Providers.tsx          ← MUI theme + auth bootstrap
    lib/
      theme.ts               ← MUI theme (light only)
      api.ts                 ← Axios + auth interceptors
      models-data.ts         ← 400+ model catalog + CPANEL_DATA
      guest-session.ts       ← localStorage guest session (3h expiry)
    store/
      auth.ts                ← Zustand auth store
```

### Backend (NestJS 11 + MongoDB)
```
backend/
  src/
    auth/          ← JWT auth (bcrypt passwords + hashed refresh tokens)
    users/         ← User schema
    models/        ← Static catalog (400+ models in models.data.ts)
    chat/          ← Session schema + AI routing + guest expiry
    upload/        ← Multer file upload
    forms/         ← Contact + feedback
    dashboard/     ← Usage analytics
    ai/            ← Provider abstraction (mock default, Kimi optional)
    common/        ← JwtAuthGuard + CurrentUser decorator
```

### Data Flow
```
Browser → GET /api/models → Static catalog (no DB, cached)
Browser → POST /api/chat/session → MongoDB Session (with expiresAt for guests)
Browser → POST /api/chat/send → AI Service → mock/Kimi → saved to Session
Browser → POST /api/auth/login → JWT pair → POST /api/chat/migrate
Browser → GET /api/dashboard/usage → aggregated stats
```

### Guest Session Architecture
- 3h TTL enforced at both frontend (localStorage expiry check) and backend (session.expiresAt < now → 403)
- MongoDB TTL index auto-deletes expired guest sessions after expiry
- Migration is lossless: sessions moved to userId, `migrated=true` set to prevent duplication

### Running the Full Stack
```bash
# Terminal 1 — Backend
cd backend && npm run start:dev

# Terminal 2 — Frontend  
cd frontend && npm run dev

# Open: http://localhost:3000
```
