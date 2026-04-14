# Skill: Run API Test Suite

**Trigger:** `/run-api-suite [--module <name>] [--type <functional|negative|security>]`

**Description:** Execute the automated API test suite against the live NexusAI backend. Consumes test case CSVs and runs tests using Python pytest + requests.

## Usage

```bash
/run-api-suite                          # Run all test cases
/run-api-suite --module auth            # Auth tests only
/run-api-suite --type security          # Security tests only
/run-api-suite --module chat --type negative  # Chat negative cases
```

## Prerequisites

Backend must be running:
```bash
cd backend && npm run start:dev
```

Python dependencies:
```bash
pip install pytest requests python-dotenv pytest-json-report
```

## Execution Steps

1. Verify `http://localhost:8000/api/auth/me` returns 401 (backend is up)
2. Create a test user: `POST /api/auth/signup` with `qa-<uuid>@nexusai.test`
3. Login and extract `accessToken` + `refreshToken`
4. Read test cases from `specs/<module>-test-cases.csv`
5. Execute each test case:
   - Build request (method, url, headers, body)
   - Send request
   - Assert status code matches `ExpectedStatus`
   - Assert response body matches `ExpectedResponse` (partial match allowed)
   - Record pass/fail and response time
6. Clean up: delete all created test sessions and the test user
7. Write results to `automation-artifacts/api-test-results.json`
8. Print summary to console

## Test Runner Script

The skill generates and runs `specs/run_api_suite.py`:

```python
import pytest, requests, csv, json, uuid
BASE = "http://localhost:8000/api"

def create_test_user():
    uid = str(uuid.uuid4())[:8]
    r = requests.post(f"{BASE}/auth/signup", json={
        "name": "QA Test", "email": f"qa-{uid}@nexusai.test", "password": "QaTest123"
    })
    return r.json()

# Test cases loaded from CSV
# Each row becomes a parametrized test
```

## Report Format

Console output:
```
============================= test session starts ==============================
specs/test_auth.py::test_signup_valid PASSED          [  8%]
specs/test_auth.py::test_signup_duplicate PASSED      [ 16%]
specs/test_auth.py::test_login_valid PASSED           [ 25%]
specs/test_chat.py::test_send_without_session PASSED  [ 50%]
...
======================= 42 passed, 3 failed in 8.23s ==========================
```

JSON results written to `automation-artifacts/api-test-results.json`.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | One or more tests failed |
| 2 | Backend not reachable |
| 3 | Test data setup failed |
