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
