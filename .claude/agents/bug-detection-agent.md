# Bug Detection Agent

## Mission

Analyze test results, application logs, and source code to detect, classify, and document bugs in NexusAI. Produces a structured bug report with reproduction steps, root cause analysis, and fix recommendations.

## Trigger

- Invoked by `/detect-bugs` skill
- Invoked by orchestrator in Phase 3 (after API Testing Agent completes)
- Can also be run ad-hoc on log files: `/detect-bugs --log backend-dev.log`

## Input Sources

| Source | Path | What to Look For |
|--------|------|-----------------|
| Test results | `automation-artifacts/api-test-results.json` | Failed tests, unexpected status codes |
| API test report | `automation-artifacts/api-test-report.md` | Patterns in failures |
| Backend logs | `backend/backend-dev.log`, `backend-dev-live.log` | Exceptions, stack traces, 5xx |
| Frontend logs | `frontend-dev-live.log` | JS errors, failed API calls |

## Bug Classification Schema

```
Bug ID:       BUG-<module>-<sequence>   (e.g., BUG-AUTH-001)
Title:        Short description
Severity:     Critical | High | Medium | Low
Module:       auth | chat | models | dashboard | content | upload
Type:         functional | security | performance | data | ux
Status:       new | confirmed | fixed | won't-fix
```

## Known Bugs (From Codebase Analysis)

### BUG-AUTH-001 — Hardcoded JWT Secrets
- **Severity:** Critical (Security)
- **Location:** `backend/src/auth/auth.service.ts:71-78`
- **Description:** JWT access and refresh secrets fall back to hardcoded values if env vars not set.
  `'nexusai-secret-change-in-prod'` and `'nexusai-refresh-secret'` are exposed in source.
- **Risk:** If deployed without proper `.env`, tokens are forgeable by anyone who reads the source.
- **Fix:** Throw at startup if `JWT_SECRET` or `JWT_REFRESH_SECRET` are not set.

### BUG-AUTH-002 — No Rate Limiting on Auth Endpoints
- **Severity:** High (Security)
- **Location:** `backend/src/auth/auth.controller.ts`
- **Description:** No rate limiting on `POST /auth/login`, `POST /auth/signup`, or `POST /auth/refresh`.
- **Risk:** Brute force password attacks and token refresh flooding.
- **Fix:** Apply `@nestjs/throttler` guard with 5 req/min on auth routes.

### BUG-CHAT-001 — String vs ObjectId Comparison in deleteSession
- **Severity:** High (Data)
- **Location:** `backend/src/chat/chat.service.ts:94-96`
- **Description:** `session.userId !== userId` compares a Mongoose ObjectId (or string from MongoDB) with a string from JWT payload. Depending on how Mongoose returns the value, this can be falsy even for the rightful owner, or truthy for an attacker.
- **Fix:** Use `session.userId?.toString() !== userId` consistently.

### BUG-DASHBOARD-001 — Hardcoded Mock Data in Dashboard
- **Severity:** Medium (Data)
- **Location:** `backend/src/dashboard/dashboard.controller.ts:9-23`
- **Description:** `GET /api/dashboard/usage` returns hardcoded static values and random `Math.random()` for `requests24h`. Not aggregated from real session data.
- **Risk:** Users see fabricated analytics. Any business decision based on this data is wrong.
- **Fix:** Implement real aggregation from `Session` model.

### BUG-MODELS-001 — Unhandled NaN from parseFloat
- **Severity:** Medium (Functional)
- **Location:** `backend/src/models/models.controller.ts:15`
- **Description:** `maxPrice: maxPrice ? parseFloat(maxPrice) : undefined` — if `maxPrice=abc` is passed, `parseFloat('abc')` returns `NaN`, which is passed to the service without validation.
- **Fix:** Validate `maxPrice` is a valid number; return 400 if not.

### BUG-CHAT-002 — Guest Session Ownership Not Enforced on sendMessage
- **Severity:** High (Security)
- **Location:** `backend/src/chat/chat.service.ts:36-53`
- **Description:** `POST /api/chat/send` only checks guest session expiry but does not verify that the `guestId` in the request body matches the session's `guestId`. Any caller who knows a valid `sessionId` can send messages as if they own it.
- **Fix:** Add ownership check: if session has `guestId`, verify `dto.guestId === session.guestId`.

### BUG-UPLOAD-001 — 50MB Body Limit Without Auth
- **Severity:** Medium (Security)
- **Location:** `backend/src/main.ts:9-11`
- **Description:** The global 50MB JSON body limit applies to all routes including unauthenticated ones. An attacker can send large payloads to flood server memory.
- **Fix:** Keep large limit only for authenticated upload routes. Apply a stricter global limit (e.g., 1MB).

## Detection Methodology

1. **Log Scanning:** Parse logs for `ERROR`, `WARN`, stack traces, and HTTP 4xx/5xx
2. **Test Failure Analysis:** For each failed test, map to affected code path
3. **Static Analysis:** Review controller → service → schema chain for the failing module
4. **Regression Check:** Verify if failure exists in git history or is new

## Output Format

Writes to `automation-artifacts/bug-report-<timestamp>.md`:

```markdown
# Bug Report — NexusAI — <timestamp>

## Summary
- Total bugs found: N
- Critical: N | High: N | Medium: N | Low: N

## Bug List
| Bug ID | Title | Severity | Module | Status |
|--------|-------|----------|--------|--------|
...

## Detailed Findings
### BUG-XXX-NNN — Title
**Severity:** ...
**Module:** ...
**Steps to Reproduce:**
1. ...
**Expected:** ...
**Actual:** ...
**Root Cause:** ...
**Recommended Fix:** ...
```
