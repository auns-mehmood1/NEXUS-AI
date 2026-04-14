# Skill: Observability Check

**Trigger:** `/observability-check [--module <name>] [--audit logs|metrics|traces|all]`

**Description:** Audit NexusAI's observability coverage. Detect silent failures, identify logging gaps, check metric instrumentation, and produce an actionable improvement plan.

## Usage

```bash
/observability-check                     # Full audit
/observability-check --audit logs        # Logs only
/observability-check --audit metrics     # Metrics only
/observability-check --module auth       # Auth module only
```

## Audit Checklist

### Logging Audit
- [ ] Is structured JSON logging configured (Winston/Pino)?
- [ ] Is a correlation/request ID injected into every log?
- [ ] Are auth events logged (login success, login failure, logout)?
- [ ] Are guest session lifecycle events logged?
- [ ] Are AI provider calls logged with latency and model ID?
- [ ] Are all 4xx errors logged at WARN level?
- [ ] Are all 5xx errors logged at ERROR level with stack trace?
- [ ] Are sensitive fields (passwords, tokens) excluded from logs?

### Metrics Audit
- [ ] Is a `/metrics` endpoint exposed (Prometheus format)?
- [ ] Is `http_requests_total` tracked by method/path/status?
- [ ] Is `http_request_duration_seconds` tracked with percentiles?
- [ ] Are business metrics tracked (sessions created, messages sent)?
- [ ] Are AI provider call metrics tracked (latency, failures)?

### Tracing Audit
- [ ] Is OpenTelemetry configured?
- [ ] Are spans created for DB calls?
- [ ] Are spans created for AI provider calls?
- [ ] Is trace context propagated across async boundaries?

### Alerting Audit
- [ ] Is there an alert for 5xx error rate > 1%?
- [ ] Is there an alert for auth failure spike?
- [ ] Is there an alert for AI provider unavailability?
- [ ] Is there an alert for P95 latency > 2s?

## Silent Failure Detection Methods

### Method 1: Response Schema Assertion
Add response body schema validation to all automated tests.
Don't just check status code — check that required fields exist and have expected types.

```python
# Bad (only checks status)
assert response.status_code == 200

# Good (checks content)
data = response.json()
assert "accessToken" in data
assert isinstance(data["accessToken"], str)
assert len(data["accessToken"]) > 20
```

### Method 2: Side Effect Verification
After write operations, read back the state.

```python
# After signup
signup_response = client.post("/api/auth/signup", json={...})
assert signup_response.status_code == 201

# Verify user is actually in DB by logging in
login_response = client.post("/api/auth/login", json={...})
assert login_response.status_code == 200  # Confirms user persisted
```

### Method 3: Canary Health Checks
Run a lightweight health check every 5 minutes in staging:

```bash
# scripts/canary.sh
#!/bin/bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/content/public)
if [ "$STATUS" != "200" ]; then
  echo "CANARY FAILED: /content/public returned $STATUS"
  exit 1
fi
echo "Canary OK: $STATUS"
```

## Current Gaps in NexusAI (Summary)

| Gap | Severity | Recommended Fix |
|-----|----------|----------------|
| No structured logging | High | Add Winston with JSON transport |
| No request correlation ID | Medium | Add UUID middleware to inject requestId |
| No metrics endpoint | High | Add @willsoto/nestjs-prometheus |
| Auth failures not logged | High | Add logger.warn() in auth.service.ts:33 |
| AI provider calls untracked | Medium | Log every call in ai.service.ts |
| Dashboard returns random data | High | Replace Math.random() with real aggregation |
| No OpenTelemetry | Medium | Add @opentelemetry/sdk-node |
| No alerting rules | High | Configure Grafana alerts or PagerDuty |

## Output

Writes to `automation-artifacts/observability-report-<timestamp>.md` with:
- Coverage score (N/10)
- Prioritized list of gaps
- Specific code locations to fix
- Sample implementations for top-priority fixes
