# Backend Build Instructions

Use this file together with `.claude/rules.md`, `.claude/project-map.md`, `.claude/architecture-plan.md`, and `.claude/conventions.md`.

## Mission

Build the NexusAI backend in the existing NestJS repo. Do not create a parallel backend.

## Required Stack

- NestJS modular architecture
- MongoDB with Mongoose
- JWT access token plus refresh token flow

## Required Capabilities

- sign-in and refresh-token support
- guest session support with exact 3-hour expiry logic
- guest-to-user history upgrade
- model catalog endpoints with provider, pricing, rating, context, and capability metadata
- chat session creation and message persistence
- file upload endpoints
- analytics usage overview endpoints
- AI provider integration service with Kimi first and extension points for more providers later

## Guardrails

- Keep controllers thin and services focused.
- Use DTO validation and consistent error shapes.
- Hash refresh tokens before persistence.
- Keep guest expiry explicit with timestamps.
- Prevent duplicate history on guest upgrade.
- Separate provider adapters from chat orchestration logic.
- Cache model catalog data where helpful.
- Do not leak frontend-only concerns into API design.

## Suggested Ownership

Own future edits inside:

- `backend/src/**`
- `backend/test/**`
- backend module contracts and DTOs

## Definition Of Done

- Frontend can authenticate, browse models, create guest sessions, chat, upload files, and fetch usage overview data through stable APIs.
- Guest upgrade path is lossless and idempotent.
- API behavior is testable, typed, and production-oriented.

---

## ✅ Implementation Status (Phase 2 Complete)

### Setup & Run
```bash
cd backend
npm install
cp .env.example .env      # fill in MongoDB URI + JWT secrets
npm run start:dev         # http://localhost:3001 (watch mode)
npm run build             # production build
npm run start:prod        # production start
```

### Required: MongoDB
Start MongoDB locally or use Atlas. Set `MONGODB_URI` in `.env`.

### Environment Variables
| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/nexusai` | MongoDB connection |
| `JWT_SECRET` | `nexusai-dev-secret-changeme` | JWT access token secret |
| `JWT_REFRESH_SECRET` | `nexusai-dev-refresh-secret-changeme` | Refresh token secret |
| `PORT` | `3001` | Server port |
| `AI_PROVIDER` | `mock` | `mock` or `kimi` |
| `KIMI_API_KEY` | — | Moonshot AI API key |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |

### API Endpoints
All endpoints prefixed with `/api/`

**Auth:** POST signup, POST login, GET me, POST refresh, POST logout

**Models:** GET /models (search/type/lab/maxPrice query params), GET /models/:id

**Chat:** POST /chat/session, POST /chat/send, GET /chat/history (JWT), DELETE /chat/session/:id (JWT), POST /chat/migrate (JWT)

**Upload:** POST /upload (multipart, field: "file")

**Forms:** POST /forms/contact, POST /forms/feedback

**Dashboard:** GET /dashboard/usage (JWT)

### Guest Session Flow
1. Frontend calls `POST /chat/session { modelId, isGuest: true }`
2. Backend sets `expiresAt = now + 3h`, returns `guestId` + `sessionId`
3. Subsequent sends: pass `guestId` in body; backend validates not expired
4. On login: frontend calls `POST /chat/migrate { guestId }`; backend bulk-updates sessions to userId

### Module Architecture
- `auth/` — signup/login/refresh/logout + JWT strategy
- `users/` — User schema (email, hashed password, hashed refresh token)
- `models/` — Static catalog (400+ models), no DB needed
- `chat/` — Session schema + message persistence + AI routing
- `upload/` — Multer disk storage
- `forms/` — Contact + feedback logging
- `dashboard/` — Aggregated usage stats
- `ai/` — Provider abstraction: mock (default) or Kimi API
