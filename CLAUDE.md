# NexusAI — QA Evaluation Project

## Project Overview

NexusAI is an AI model aggregation platform. Users interact with 400+ AI models through a unified chat interface, marketplace, discover surface, and agent builder.

**Stack:**
- Backend: NestJS 11 + MongoDB + JWT auth (port 8000)
- Frontend: Next.js 15 App Router + MUI + Zustand (port 3000)
- API prefix: `/api`

## Running the Stack

```bash
# Terminal 1 — Backend
cd backend && npm run start:dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Swagger docs: `http://localhost:8000/api/docs`

## QA Agent System

This repository uses a full agentic QA workflow. All agents and skills live in `.claude/`.

| Agent | Purpose |
|-------|---------|
| `orchestrator-agent` | Coordinates all agents, produces final QA report |
| `test-case-generator-agent` | Generates test cases from API schemas and code |
| `api-testing-agent` | Executes automated API test suite |
| `bug-detection-agent` | Detects, classifies, and documents bugs |
| `regression-testing-agent` | Runs regression suite after every change |
| `observability-agent` | Monitors logs, metrics, and traces |

## Invocable Skills (Slash Commands)

| Skill | Trigger |
|-------|---------|
| `/generate-test-cases` | Generate functional, negative, boundary test cases |
| `/run-api-suite` | Execute full API test suite |
| `/detect-bugs` | Scan for bugs from logs or behavior |
| `/edge-case-discovery` | Find hidden edge cases |
| `/failure-injection` | Simulate database/API/token failures |
| `/performance-test` | Run load testing strategy |
| `/observability-check` | Check logging and monitoring coverage |
| `/orchestrate-qa` | Run all agents in sequence and produce final report |

## Critical API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | None | Register user |
| POST | `/api/auth/login` | None | Login, get JWT pair |
| GET | `/api/auth/me` | JWT | Current user profile |
| POST | `/api/auth/refresh` | None | Refresh access token |
| POST | `/api/auth/logout` | JWT | Invalidate refresh token |
| POST | `/api/chat/session` | Optional JWT | Create chat session |
| POST | `/api/chat/send` | Optional JWT | Send message to AI |
| GET | `/api/chat/history` | JWT | User chat history |
| DELETE | `/api/chat/session/:id` | JWT | Delete a session |
| POST | `/api/chat/migrate` | JWT | Migrate guest sessions |
| GET | `/api/models` | None | List all AI models |
| GET | `/api/models/:id` | None | Get model by ID |
| GET | `/api/dashboard/usage` | JWT | Usage analytics |
| GET | `/api/content/public` | None | Public content |

## Base URLs

- Backend API: `http://localhost:8000/api`
- Frontend: `http://localhost:3000`

## Global QA Rules

- Never test against production
- Always clean up test data after each run
- JWT access tokens expire in 15 minutes — refresh before long test runs
- Guest sessions expire in 3 hours
- Hardcoded fallback secrets in dev: `nexusai-secret-change-in-prod` and `nexusai-refresh-secret`
