# Architecture Plan Draft

This is the draft implementation architecture for the full build that follows this setup step.

## 1. Frontend Architecture

### Stack

- Next.js App Router
- React 19
- MUI theme system
- Context API for app-wide state

### Layout Model

- marketing shell for landing content
- app shell for `Chat Hub`, `Marketplace`, `Agents`, and `Discover New`
- three-column chat layout:
  - left: searchable model list
  - center: chat stream and composer
  - right: active model, usage, graph, and quick actions

### Frontend State Domains

- auth state
- guest session state with exact expiry timestamp
- model catalog cache
- active model selection
- chat session/messages
- marketplace filters and sorting
- UI preferences such as language and panel visibility

### Frontend Browser APIs

- Web Speech API for voice-to-text
- `SpeechSynthesis` for TTS
- camera snapshot UI via media devices and image capture workflow
- localStorage/sessionStorage/cookie support for guest continuity

## 2. Backend Architecture

### Stack

- NestJS modular architecture
- MongoDB with Mongoose
- JWT access token plus refresh token flow

### Core Services

- auth service for sign-in, refresh, logout, and guest upgrade
- guest session service with 3-hour expiry logic
- model catalog service with capability metadata and caching
- chat service for sessions, messages, and history persistence
- uploads service for file endpoints and metadata validation
- provider abstraction layer with Kimi as the first provider adapter
- analytics service for request, latency, and cost aggregation

## 3. Data Model Draft

### Collections

- `users`
  - profile, auth metadata, preferences
- `guest_sessions`
  - guest id, created at, expires at, upgrade status
- `models`
  - catalog metadata, capabilities, pricing, provider, tags
- `chat_sessions`
  - owner reference, guest or user mode, active model, title, status
- `chat_messages`
  - session id, role, content, attachments, model id, token usage, cost
- `uploads`
  - file metadata, storage key, owner, MIME type, scan status
- `usage_metrics`
  - per-session or aggregated request counts, latency, token totals, cost
- `refresh_tokens`
  - hashed token, user id, expiry, device/session metadata

## 4. Capability Routing Logic

The reference HTML includes capability-aware action routing. The production architecture must preserve that behavior.

### Rule

- if a selected model supports the requested capability, execute the action normally
- if not, generate a facilitation prompt template
- include a better model recommendation
- keep the user in-flow instead of returning an error

### Capability Families

- language
- vision
- code
- image generation
- audio
- video
- open-source/self-hosted friendly

## 5. Guest-To-User Upgrade Flow

1. Create guest session locally and, when needed, on the backend.
2. Cache messages locally with `expiresAt = createdAt + 10800000`.
3. Let guest user browse, filter, and chat without sign-in friction.
4. On sign-in, send guest session id and local history digest to the backend.
5. Merge guest messages into permanent user chat history.
6. Mark guest session upgraded to prevent duplicate imports.

## 6. Performance Plan

- cache model catalog on frontend and backend
- use pagination or virtualization for large lists
- lazy-load heavy modals and detail panes
- keep right-panel analytics lightweight
- precompute common marketplace filters
- avoid refetching static catalog data on every route switch

## 7. Delivery Phases

### Phase A

- establish App Router route groups, MUI theme, layout shell, and NestJS modules

### Phase B

- build chat hub, model switching, guest cache, and marketplace filtering

### Phase C

- add auth, chat persistence, uploads, analytics, and provider adapter integration

### Phase D

- run QA and analyzer loops until the product closely matches the reference set
