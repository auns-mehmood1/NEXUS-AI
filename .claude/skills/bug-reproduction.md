# Skill: Bug Detection & Reproduction

**Trigger:** `/detect-bugs [--log <file>] [--results <file>] [--module <name>]`

**Description:** Analyze test results and application logs to detect bugs, reproduce them with minimal steps, identify root causes, and produce a prioritized bug report.

## Usage

```bash
/detect-bugs                                          # Analyze latest test results + logs
/detect-bugs --log backend/backend-dev.log            # From specific log file
/detect-bugs --results automation-artifacts/api-test-results.json
/detect-bugs --module auth                            # Auth module only
```

## Detection Process

### Step 1 — Collect Evidence
```
Sources analyzed:
  - automation-artifacts/api-test-results.json  (failed tests)
  - backend/backend-dev.log                     (server errors)
  - backend-dev-live.log                        (live server output)
  - frontend-dev-live.log                       (client-side errors)
```

### Step 2 — Pattern Classification

Look for these error signatures:

| Pattern | Likely Bug Type |
|---------|----------------|
| `UnauthorizedException` on valid token | Auth/JWT issue |
| `ForbiddenException` on own resource | Authorization logic bug |
| `CastError: Cast to ObjectId failed` | ID type mismatch |
| `ValidationPipe` rejection on valid data | DTO validation bug |
| 500 on specific input | Unhandled exception |
| Response time > 5s | Performance regression |
| `undefined` in response body | Missing field or null propagation |

### Step 3 — Reproduce with Minimal Steps

For each detected failure:
1. Identify the exact request (method, endpoint, headers, body)
2. Send the same request with `curl` or test script
3. Confirm reproduction
4. Simplify to the minimum failing case

### Step 4 — Root Cause Analysis

Map failure to source code:
- Controller → Service → Schema → Provider
- Check DTO validation rules
- Check guard logic
- Check service conditional logic

### Step 5 — Write Bug Report

See `.claude/agents/bug-detection-agent.md` for report format.

## AI Prompt for Bug Reproduction

When analyzing a log extract, use this prompt pattern:

```
Given this error log from a NestJS + MongoDB application:
<paste log excerpt>

1. Identify the root cause
2. Identify which source file and line number is likely responsible
3. Write the minimal HTTP request that would reproduce this error
4. Suggest a code fix
```

## Known Bug Patterns in NexusAI

1. **String/ObjectId mismatch** — `session.userId` compared with `===` to JWT string
2. **Hardcoded secrets** — JWT secrets fall back to dev values if env not set
3. **No rate limiting** — all auth endpoints are unbounded
4. **Mock dashboard data** — `Math.random()` in response body
5. **NaN from parseFloat** — `maxPrice=abc` passes into service as `NaN`
6. **Silent AI failure** — AI provider errors may be swallowed and return empty response
