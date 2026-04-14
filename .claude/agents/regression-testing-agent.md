# Regression Testing Agent

## Mission

After bugs are fixed, validate that fixes work correctly and that no previously passing tests have broken. Maintain a regression baseline and detect new failures introduced by changes.

## Trigger

- Invoked by `/regression-test` skill
- Invoked by orchestrator in Phase 4 (after bug fixes are applied)
- Should run automatically on every pull request to `main`

## Baseline Strategy

The regression baseline is stored in `automation-artifacts/regression-baseline.json`. It contains:
- List of all test case IDs
- Expected pass/fail status at the time of last green run
- Timestamps and git commit hash

```json
{
  "commit": "abc1234",
  "timestamp": "2026-04-14T10:00:00Z",
  "results": {
    "TC-AUTH-001": "pass",
    "TC-AUTH-002": "pass",
    "TC-CHAT-001": "fail",
    ...
  }
}
```

## Regression Detection Logic

```
FOR each test in current run:
  IF test was PASS in baseline AND is now FAIL:
    → REGRESSION DETECTED — flag as High severity
  IF test was FAIL in baseline AND is now PASS:
    → BUG FIXED — flag as resolved
  IF test is new (not in baseline):
    → NEW TEST — record result, do not flag as regression
```

## Critical Regression Scenarios for NexusAI

### Auth Regression Suite
- Signup with valid data must succeed (201)
- Login with correct credentials must return JWT pair
- Accessing `/auth/me` with valid token must return user profile
- Expired access token must return 401
- Refresh with valid refresh token must issue new pair
- After logout, refresh token must be rejected

### Chat Regression Suite
- Authenticated user can create and send to a session
- Guest session creation assigns guestId and expiresAt
- Guest session expired → 403 on send
- Deleting own session succeeds (200)
- Deleting another user's session is forbidden (403)
- Migrating guest sessions attaches them to user

### Models Regression Suite
- `GET /models` returns array with at least 1 item
- `GET /models/:id` with valid ID returns model object
- `GET /models/:id` with invalid ID returns 404

### Dashboard Regression Suite
- `GET /dashboard/usage` with valid JWT returns usage object
- `GET /dashboard/usage` without JWT returns 401

## Delta Report Format

Writes to `automation-artifacts/regression-delta-<timestamp>.md`:

```markdown
# Regression Delta Report — <timestamp>

## Baseline Commit: <sha>
## Current Commit: <sha>

## Regressions Introduced (FAIL now, was PASS)
| Test ID | Description | Severity |
|---------|-------------|----------|

## Fixes Confirmed (PASS now, was FAIL)
| Test ID | Description | Bug ID |
|---------|-------------|--------|

## Unchanged Failures (Still Failing)
| Test ID | Description |
|---------|-------------|

## New Tests Added
| Test ID | Description | Result |
|---------|-------------|--------|

## Verdict: CLEAN / REGRESSION DETECTED
```

## Baseline Update Policy

- Only update the baseline after a manual review and sign-off
- Never auto-update the baseline on a failing run
- Tag baseline updates with the commit hash and reviewer name

## CI Integration

```yaml
# .github/workflows/regression.yml (example)
on:
  pull_request:
    branches: [main]
jobs:
  regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Start backend
        run: cd backend && npm install && npm run start:dev &
      - name: Wait for backend
        run: sleep 10
      - name: Run regression suite
        run: cd specs && pytest test_regression.py -v
```
