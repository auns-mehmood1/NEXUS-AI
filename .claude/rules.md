# Global QA Rules

All agents and skills must follow these rules unconditionally.

## Environment

- Backend runs on `http://localhost:8000/api`
- Frontend runs on `http://localhost:3000`
- Database: MongoDB (local or Atlas, see `backend/.env`)
- Never run tests against a production environment
- Never commit `.env` files or tokens to the repository

## Test Data

- Create isolated test users with emails like `qa-test-<uuid>@nexusai.test`
- Clean up all created test users, sessions, and data after each test run
- Never reuse data across test suites — each suite manages its own state
- Use predictable seeds when you need deterministic results

## Authentication

- JWT access tokens expire in `15m` — refresh before long-running suites
- Refresh tokens expire in `7d`
- Dev fallback secrets (from source): `nexusai-secret-change-in-prod`, `nexusai-refresh-secret`
- Guest sessions expire after `3 hours` — do not rely on guest state across runs

## API Conventions

- All endpoints are prefixed with `/api`
- Validation is via NestJS `ValidationPipe` with `whitelist: true`
- Extra fields in request bodies are silently stripped
- Errors follow NestJS default: `{ statusCode, message, error }`

## Risk Classification

All bugs and findings must be classified:

| Severity | Criteria |
|----------|----------|
| Critical | Security breach, data loss, auth bypass, service crash |
| High | Core flow broken, incorrect data returned, data leak |
| Medium | Non-critical feature broken, degraded UX, unexpected behavior |
| Low | Minor UI inconsistency, non-blocking edge case |

## Reporting

- Each agent outputs its results to `automation-artifacts/`
- All reports must include: timestamp, agent name, pass/fail counts, severity breakdown
- The orchestrator merges all reports into `automation-artifacts/qa-final-report.md`
- Never overwrite a prior report — append a timestamp suffix

## Security Testing Boundaries

- Authorized to test: auth bypass, JWT forgery, input injection (non-destructive payloads), token replay
- NOT authorized to: DoS attacks, mass data deletion, anything that could harm a shared environment
- If testing injection: use innocuous payloads like `' OR 1=1 --` in isolated test accounts
