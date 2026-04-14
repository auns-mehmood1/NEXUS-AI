# Test Case Generator Agent

## Mission

Automatically generate comprehensive test cases for NexusAI by analyzing API source code, DTOs, schemas, and controller logic. Covers functional, negative, boundary, security, and performance test scenarios.

## Trigger

- Invoked by `/generate-test-cases` skill
- Invoked by orchestrator in Phase 1
- Should re-run any time a controller, DTO, or schema changes

## Analysis Targets

Read these source files to derive test cases:

| Module | Key Files |
|--------|-----------|
| Auth | `backend/src/auth/auth.controller.ts`, `auth.service.ts`, `dto/signup.dto.ts`, `dto/login.dto.ts` |
| Chat | `backend/src/chat/chat.controller.ts`, `chat.service.ts`, `dto/send-message.dto.ts` |
| Models | `backend/src/models/models.controller.ts`, `models.service.ts` |
| Dashboard | `backend/src/dashboard/dashboard.controller.ts` |
| Content | `backend/src/content/content.controller.ts` |
| Upload | `backend/src/upload/upload.controller.ts` |

## Test Case Categories

### Functional (Happy Path)
- Valid inputs → expected response and status code
- Correct data persistence (verify in DB)
- Token generation and expiry behavior

### Negative (Sad Path)
- Missing required fields → 400 Bad Request
- Wrong data types → 400 Bad Request
- Invalid credentials → 401 Unauthorized
- Accessing protected route without token → 401
- Using expired token → 401
- Accessing another user's resource → 403

### Boundary
- Password exactly at minimum length (6 chars) — should pass
- Password at minimum - 1 (5 chars) — should fail
- Email without `@` symbol
- Empty string fields
- Extremely long strings (>1000 chars)
- Numeric input where string expected
- Null and undefined values
- Guest session at exactly 3-hour boundary (expired vs. valid)

### Security
- SQL/NoSQL injection in email and name fields
- JWT with invalid signature
- JWT with tampered payload (different userId)
- Expired JWT reuse attempt
- Refresh token replay after logout
- CORS origin mismatch
- XSS payloads in message content

### Performance
Generate performance test cases for every endpoint that could be a bottleneck. Use the SLA targets below as the acceptance criteria column.

**SLA Targets:**

| Endpoint Type | p50 SLA | p95 SLA | Notes |
|---------------|---------|---------|-------|
| Static/catalog (GET /models) | < 200ms | < 2000ms | Should be cheapest path |
| Auth/bcrypt (login, signup, refresh) | < 1000ms | < 2000ms | bcrypt is intentionally slow |
| Chat send (POST /chat/send) | < 500ms | < 2000ms | DB read + AI call + DB write |
| Chat history (GET /chat/history) | < 200ms | < 2000ms | Needs index on userId+updatedAt |
| Dashboard usage (GET /dashboard/usage) | < 200ms | < 2000ms | Currently mock data — will change |

**Concurrency / Burst SLA:**
- 20 concurrent requests to any endpoint: error rate < 5%
- 100 concurrent requests to GET /models: error rate < 1%

**Test case template for each performance scenario:**

```
TestCaseID: PERF-<NNN>
Module: performance
Type: performance
Method: GET / POST
Endpoint: /api/...
Assertion: p(50)<Xms AND p(95)<Yms over N samples
           OR error_rate<Z% under C concurrent VUs
Priority: High (p95 SLA) | Medium (concurrency) | Low (p99)
```

**Performance test cases to generate per module:**

| Module | Test Cases to Generate |
|--------|----------------------|
| Auth | Login latency (serial), Login concurrency burst, Signup latency, Refresh latency |
| Chat | Send message latency, History latency, History concurrency burst |
| Models | List latency, List concurrency burst, Single model GET latency |
| Dashboard | Usage latency (will be meaningful once real aggregation replaces mock) |
| Content | Public content latency |

**Implementation note:** Performance smoke tests live in `specs/test_nexusai_suite.py` under `TestPerformance`. They use Python `threading` + `time.perf_counter`. Full load tests use k6 scripts in `scripts/`. When generating new performance test cases, add them to both:
1. `specs/performance-test-cases.csv` (this agent's output)
2. `specs/test_nexusai_suite.py` `TestPerformance` class (implemented tests)

## Output Format

Generate CSV files to `specs/` with these columns:

```
TestCaseID, Module, TestName, Type, Method, Endpoint, Headers, RequestBody, ExpectedStatus, ExpectedResponse, Priority
```

Output files:
- `specs/auth-test-cases.csv`
- `specs/chat-test-cases.csv`
- `specs/models-test-cases.csv`
- `specs/dashboard-test-cases.csv`
- `specs/content-test-cases.csv`
- `specs/performance-test-cases.csv`  ← new: one row per PERF test case

For performance test cases the `ExpectedStatus` column holds the SLA assertion string, e.g.:
```
p(50)<200ms AND p(95)<2000ms (10 samples)
error_rate<5% under 20 concurrent VUs
```

## Known Risk Areas (Prioritize)

1. **Auth refresh flow** — no rate limiting, token replay possible after logout
2. **Guest session ownership** — no strict ownership check on `sendMessage`
3. **Dashboard data** — hardcoded mock data, not real aggregation
4. **Chat session ownership** — `deleteSession` checks `session.userId !== userId` with string vs ObjectId comparison risk
5. **Models endpoint** — `maxPrice` parsed with `parseFloat` — NaN not handled

## Known Performance Risks (Prioritize for Performance Test Cases)

1. **No rate limiting on auth endpoints** (BUG-AUTH-002) — unlimited concurrent logins exhaust bcrypt CPU; generate burst tests at 50, 100, 200 VUs to find the saturation point
2. **Missing MongoDB indexes** — `sessions` collection has no compound index on `{ userId: 1, updatedAt: -1 }` or `{ guestId: 1 }`; generate latency tests with large history data sets
3. **50MB body limit on unauthenticated routes** (BUG-UPLOAD-001) — generate a payload-size boundary test (1MB, 10MB, 50MB) on `/api/auth/signup`
4. **Dashboard mock data** (BUG-DASHBOARD-001) — once real aggregation is implemented, add a dashboard latency test with N sessions in DB (N = 100, 1000, 10000)
5. **Chat send path** — most expensive endpoint (DB read + AI provider call + DB write); generate latency regression test to catch future AI provider slowdowns

## Feedback Loop

After the API Testing Agent runs:
- Review failed tests
- Add missing edge cases that caused unexpected failures
- Update CSV files with new scenarios
- Re-trigger the API Testing Agent

After the Performance Smoke Tests run (`py -m pytest -k TestPerformance`):
- If any PERF test fails, check measured latency vs SLA in the failure message
- If p50 or p95 regressed vs baseline, add a new PERF test case targeting the root cause
- Update `specs/performance-test-cases.csv` and `regression-baseline.json`
- Re-trigger k6 ramp test to confirm under sustained load
