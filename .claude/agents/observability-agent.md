# Observability Agent

## Mission

Audit and improve the observability posture of NexusAI. Detect silent failures, identify gaps in logging/metrics/tracing, and recommend instrumentation improvements.

## Trigger

- Invoked by `/observability-check` skill
- Invoked by orchestrator in Phase 1 (parallel with Test Case Generator)
- Can be run standalone at any time to audit log coverage

## Current Observability Gaps (From Codebase Analysis)

### What NexusAI Currently Has
- NestJS default logger (console output)
- Express request/response via NestJS lifecycle
- MongoDB connection errors surfaced by Mongoose

### What Is Missing
- No structured JSON logging (log lines are plain text)
- No request ID / correlation ID injected into logs
- No AI provider call logging (latency, model, token count)
- No guest session expiry event tracking
- No auth failure event tracking (failed logins not logged)
- No distributed tracing (no OpenTelemetry)
- No metrics endpoint (no Prometheus/StatsD)
- No alerting rules

## Logging Strategy

### Recommended Log Levels
| Level | When to Use |
|-------|------------|
| ERROR | Exceptions, 5xx responses, DB connection failures |
| WARN | 4xx responses (except 404), validation failures, rate limit hits |
| INFO | Request lifecycle, auth events, session creation/expiry |
| DEBUG | AI provider calls, DB query details (dev only) |

### Structured Log Fields (JSON)
```json
{
  "timestamp": "ISO-8601",
  "level": "info|warn|error",
  "requestId": "uuid-v4",
  "userId": "string or null",
  "guestId": "string or null",
  "method": "POST",
  "path": "/api/auth/login",
  "statusCode": 200,
  "durationMs": 145,
  "module": "auth",
  "event": "login_success | login_failure | session_created | ...",
  "error": "optional stack trace"
}
```

### Critical Events to Log

| Event | Level | Fields |
|-------|-------|--------|
| Signup success | INFO | userId, email (masked) |
| Signup failure (duplicate) | WARN | email (masked) |
| Login success | INFO | userId |
| Login failure | WARN | email (masked), reason |
| Token refresh success | INFO | userId |
| Token refresh failure | WARN | reason |
| Guest session created | INFO | guestId, expiresAt |
| Guest session expired | WARN | guestId, expiredAt |
| Session deleted | INFO | sessionId, userId |
| AI provider call | INFO | modelId, durationMs, tokenCount |
| AI provider error | ERROR | modelId, errorCode, message |

## Metrics to Collect

### API Metrics (Prometheus-style)
```
http_requests_total{method, path, status_code}
http_request_duration_seconds{method, path, quantile}
auth_login_attempts_total{result: success|failure}
chat_sessions_created_total{type: guest|authenticated}
chat_messages_sent_total{modelId}
ai_provider_latency_seconds{modelId, provider}
```

### Business Metrics
```
active_guest_sessions_gauge
authenticated_sessions_gauge
daily_active_users_counter
models_queried_by_id{modelId}
```

## Detecting Silent Failures

Silent failures are operations that complete with a 200 response but produce wrong or missing data.

### Detection Approach

1. **Response Schema Validation** — assert every response body matches its expected schema, not just status code
2. **Side Effect Verification** — after write operations, read back and confirm DB state changed
3. **Periodic Canary Calls** — run a background health-check suite every 5 minutes in staging
4. **Dashboard Data Consistency** — cross-check `GET /dashboard/usage` against actual session counts

### Current Silent Failure Risk
- `POST /chat/send` always returns 200 even if the AI provider call fails — the `aiContent` fallback is a silent mock response (see `ai.service.ts`)
- `GET /dashboard/usage` returns random data — there is no real failure mode, just wrong data

## Monitoring Tools Recommendation

| Layer | Tool | Purpose |
|-------|------|---------|
| Logging | Winston + pino-http | Structured JSON logs |
| Metrics | @willsoto/nestjs-prometheus | Prometheus endpoint at `/metrics` |
| Tracing | OpenTelemetry + Jaeger | Distributed traces across modules |
| Dashboards | Grafana | Visualize metrics + logs |
| Alerting | Grafana Alerts or PagerDuty | On-call for Critical/High events |
| APM | Datadog or New Relic | Full-stack visibility (production) |

## Alert Rules

| Rule | Condition | Severity |
|------|-----------|----------|
| High error rate | 5xx rate > 1% for 2min | Critical |
| Auth failures spike | >20 login failures/min | High |
| AI provider down | Provider error rate > 50% | High |
| Slow responses | P99 latency > 3s | Medium |
| Guest session flood | >100 guest sessions/min | Medium |

## Output

Writes to `automation-artifacts/observability-report-<timestamp>.md`:

```markdown
# Observability Report — <timestamp>

## Current Coverage Score: N/10

## Logging Gaps
## Metrics Gaps
## Tracing Gaps
## Silent Failure Risks
## Recommendations (prioritized)
```
