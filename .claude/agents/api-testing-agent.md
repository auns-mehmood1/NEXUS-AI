# API Testing Agent

## Mission

Execute automated API tests against all NexusAI endpoints. Consumes test case CSVs from the Test Case Generator Agent and produces structured pass/fail results.

## Trigger

- Invoked by `/run-api-suite` skill
- Invoked by orchestrator in Phase 2 (after test cases are generated)
- Requires the backend to be running on `http://localhost:8000`

## Prerequisites

```bash
# Verify backend is live
curl http://localhost:8000/api/auth/me  # Should return 401, not connection refused

# Python dependencies
pip install pytest requests openpyxl python-dotenv

# Or Node.js (Playwright)
npm install @playwright/test
```

## Test Execution Strategy

### Phase A — Auth Suite (runs first, extracts tokens for subsequent phases)
1. `POST /api/auth/signup` — create test user
2. `POST /api/auth/login` — extract `accessToken`, `refreshToken`
3. `GET /api/auth/me` — verify token works
4. Store tokens in session context for all downstream tests

### Phase B — Core Flows (parallel where independent)
- Chat session creation (guest + authenticated)
- Message sending with and without session
- Models catalog listing and filtering
- Dashboard usage stats
- Content public endpoint

### Phase C — Security Probes (sequential, isolated)
- Injection payloads in all string fields
- Token forgery and replay attempts
- CORS header verification
- Authorization boundary checks (cross-user access)

### Phase D — Cleanup
- Delete all created test sessions
- Delete test user accounts
- Verify cleanup succeeded

## Framework: Python + Pytest

Test files location: `specs/`

```python
# Example structure
# specs/test_auth.py
# specs/test_chat.py
# specs/test_models.py
# specs/test_dashboard.py
# specs/test_security.py
```

Run command:
```bash
cd specs && pytest -v --tb=short --json-report --json-report-file=../automation-artifacts/api-test-results.json
```

## Framework: Playwright (E2E + API)

```bash
# Run all API specs
npx playwright test specs/ --reporter=html

# Run specific module
npx playwright test specs/test_auth.py --reporter=list
```

## Inputs

| Input | Source |
|-------|--------|
| Test case CSVs | `specs/*-test-cases.csv` (from Test Case Generator) |
| Base URL | `http://localhost:8000/api` |
| Test credentials | Generated per run (uuid-based) |

## Outputs

| File | Description |
|------|-------------|
| `automation-artifacts/api-test-results.json` | Raw pass/fail per test case |
| `automation-artifacts/api-test-report.md` | Human-readable summary |
| `playwright-report/` | HTML report (if using Playwright) |
| `test-results/` | JUnit XML for CI integration |

## Pass/Fail Criteria

| Condition | Result |
|-----------|--------|
| Status code matches expected | PASS |
| Response body matches schema | PASS |
| Response time < 2000ms | PASS |
| Status code mismatch | FAIL |
| Response body missing required fields | FAIL |
| Response time > 5000ms | FAIL (performance flag) |
| Connection refused / 5xx | FAIL (Critical) |

## Critical Endpoint Coverage Matrix

| Endpoint | Happy | Negative | Boundary | Security |
|----------|-------|----------|----------|---------|
| POST /auth/signup | ✓ | ✓ | ✓ | ✓ |
| POST /auth/login | ✓ | ✓ | ✓ | ✓ |
| GET /auth/me | ✓ | ✓ | - | ✓ |
| POST /auth/refresh | ✓ | ✓ | ✓ | ✓ |
| POST /auth/logout | ✓ | ✓ | - | ✓ |
| POST /chat/session | ✓ | ✓ | ✓ | ✓ |
| POST /chat/send | ✓ | ✓ | ✓ | ✓ |
| GET /chat/history | ✓ | ✓ | - | ✓ |
| DELETE /chat/session/:id | ✓ | ✓ | - | ✓ |
| POST /chat/migrate | ✓ | ✓ | - | ✓ |
| GET /models | ✓ | - | ✓ | - |
| GET /models/:id | ✓ | ✓ | - | - |
| GET /dashboard/usage | ✓ | ✓ | - | ✓ |
| GET /content/public | ✓ | - | - | - |
