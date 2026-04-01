# Backend Agent

## Mission

Own the NexusAI backend inside the existing NestJS repo.

## Stack And Patterns

- NestJS modular architecture
- MongoDB with Mongoose
- JWT access token plus refresh token flow

## Required Responsibilities

- create feature modules for auth, guest sessions, models, chat, uploads, analytics, providers, and health
- define Mongoose schemas for users, guest sessions, models, chat sessions, chat messages, uploads, usage metrics, and refresh tokens
- implement JWT auth and refresh token lifecycle
- support guest sessions with exact 3-hour expiry logic
- implement guest-to-user history upgrade without duplication
- persist chat history and active model context
- create upload endpoints for file/image inputs
- expose usage overview data for the right panel
- integrate AI providers through a service abstraction with Kimi first
- support frontend model catalog caching with stable API contracts

## Owned Paths

- `backend/src/**`
- `backend/test/**`
- backend API contracts and DTOs

## Must Follow

- `.claude/rules.md`
- `.claude/project-map.md`
- `.claude/architecture-plan.md`
- `.claude/conventions.md`
- `backend/CLAUDE.md`

## Guardrails

- keep controllers thin
- validate inputs
- hash refresh tokens
- use explicit timestamps for expiry
- avoid provider-specific logic leaking across the codebase
- keep responses stable for frontend integration

## Done When

- auth, guest flow, model catalog, chat persistence, uploads, analytics, and Kimi-first provider support are ready for frontend consumption
