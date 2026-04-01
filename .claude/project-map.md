# Project Map And Routing Plan

This file distinguishes the current starter state from the planned production structure.

## Current Workspace Snapshot

### Root

- `frontend/`
- `backend/`
- `.claude/`

### Frontend Exists Now

- `frontend/.claude/` local frontend coordination and execution docs
- `frontend/index.html` reference prototype
- `frontend/screenshots/` layout references
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/app/page.module.css`

### Backend Exists Now

- `backend/.claude/` local backend coordination and execution docs
- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/src/app.controller.ts`
- `backend/src/app.service.ts`
- `backend/test/app.e2e-spec.ts`

## Planned Frontend Route Map

Use Next.js App Router with route groups so the marketing shell and app shell stay separate.

### Public

- `/`
  - landing page derived from the HTML hero and marketing sections
- `/signin`
  - auth entry for sign-in and guest upgrade

### App

- `/chat`
  - default chat hub, three-column layout
- `/marketplace`
  - searchable grid, sidebar filters, chips, and model details access
- `/agents`
  - agent-building guidance and agent discovery
- `/discover`
  - research/releases/discover-new experience
- `/models/[slug]`
  - model detail route if modal content is later split into a full page

## Planned Frontend File Routing

Suggested target structure for the future build:

- `frontend/src/app/(marketing)/page.tsx`
- `frontend/src/app/(auth)/signin/page.tsx`
- `frontend/src/app/(app)/chat/page.tsx`
- `frontend/src/app/(app)/marketplace/page.tsx`
- `frontend/src/app/(app)/agents/page.tsx`
- `frontend/src/app/(app)/discover/page.tsx`
- `frontend/src/app/models/[slug]/page.tsx`
- `frontend/src/components/layout/`
- `frontend/src/components/chat/`
- `frontend/src/components/marketplace/`
- `frontend/src/components/models/`
- `frontend/src/components/agents/`
- `frontend/src/components/discover/`
- `frontend/src/components/shared/`
- `frontend/src/contexts/`
- `frontend/src/lib/`
- `frontend/src/services/`
- `frontend/src/types/`

## Planned Backend Module Map

Suggested NestJS modules:

- `auth`
  - sign-in, refresh token, logout, session upgrade
- `users`
  - account profile and preferences
- `guest-sessions`
  - temporary guest identity and 3-hour expiry support
- `models`
  - model catalog, filters, providers, capabilities
- `chat`
  - chat sessions, messages, history persistence
- `uploads`
  - file/image upload endpoints and metadata handling
- `providers`
  - AI provider adapters, with Kimi first
- `analytics`
  - usage overview metrics, latency, and cost summaries
- `health`
  - readiness and liveliness endpoints

## Planned Backend Route Map

- `POST /api/v1/auth/sign-in`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/upgrade-guest`
- `POST /api/v1/guest-sessions`
- `GET /api/v1/models`
- `GET /api/v1/models/:id`
- `GET /api/v1/models/providers`
- `POST /api/v1/chat/sessions`
- `GET /api/v1/chat/sessions/:id`
- `POST /api/v1/chat/sessions/:id/messages`
- `POST /api/v1/uploads`
- `GET /api/v1/analytics/usage-overview`
- `GET /api/v1/health`

## Ownership Routing

Use these ownership boundaries to reduce collisions:

- Frontend Agent
  - owns `frontend/src/**`, `frontend/public/**`, and frontend test files
- Backend Agent
  - owns `backend/src/**`, backend test files, and API contracts
- QA Agent
  - owns automated/manual test plans, regression outputs, and pass/fail reporting
- Analyzer Agent
  - owns gap analysis reports, screenshot comparison notes, performance/cost review, and fix-loop enforcement

## Cross-Cutting Shared Contracts

Keep these shared concerns aligned across both repos:

- model id, slug, provider, capability, pricing, rating, context size
- guest session id and expiry timestamp
- user id and auth session state
- chat session id, message id, role, attachments, active model id
- usage metrics: request count, average latency, and cost
