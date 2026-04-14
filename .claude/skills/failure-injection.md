# Skill: Failure Injection

**Trigger:** `/failure-injection --target <database|api-timeout|token|provider> [--duration <seconds>]`

**Description:** Simulate real-world failure scenarios to verify NexusAI handles them gracefully with correct error responses, no data corruption, and appropriate fallback behavior.

## Usage

```bash
/failure-injection --target database       # Simulate DB downtime
/failure-injection --target api-timeout    # Simulate slow/hanging AI provider
/failure-injection --target token          # Test expired/invalid tokens
/failure-injection --target provider       # Simulate AI provider outage
/failure-injection --target all            # Run all scenarios sequentially
```

## Failure Scenarios

---

### Scenario 1: Database Downtime

**Approach:** Stop MongoDB during an active request flow

**Simulation:**
```bash
# Docker: pause the MongoDB container
docker pause <mongo-container-id>

# Then immediately run:
curl -X POST http://localhost:8000/api/chat/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"modelId":"gpt4o","content":"hello","sessionId":"<id>"}'

# Restore after test
docker unpause <mongo-container-id>
```

**Expected System Behavior:**
- NestJS should return 503 Service Unavailable (or 500 with meaningful message)
- No partial write should be committed
- No unhandled exception crash — server should remain up after DB recovers
- Error should be logged with full stack trace

**Actual Risk in NexusAI:**
- NestJS/Mongoose throws `MongooseError` which becomes unhandled 500
- No circuit breaker — all subsequent requests fail until DB reconnects
- No retry logic on DB operations

---

### Scenario 2: API / AI Provider Timeout

**Approach:** Simulate the AI provider taking longer than acceptable

**Simulation (using tc/netem or a mock proxy):**
```python
# In test: mock ai.service.ts to delay response
# Or use a proxy that delays responses
import time

def mock_ai_chat_slow(*args):
    time.sleep(30)  # Force 30s delay
    return "response"
```

**Or inject via monkey-patching in test:**
```bash
# Set AI provider to a fake slow endpoint
AI_BASE_URL=http://localhost:9999/slow npm run start:dev
```

**Expected System Behavior:**
- Request should time out after a configurable threshold (recommended: 10s)
- Return 504 Gateway Timeout or 503
- User message should NOT be saved to session if AI response never arrived
- Circuit breaker should trip after N consecutive timeouts

**Actual Risk in NexusAI:**
- No timeout configured on AI provider HTTP calls
- User message IS saved to session before AI response — message is persisted with no reply
- No circuit breaker — all chat requests hang indefinitely during provider outage

---

### Scenario 3: Invalid / Expired Tokens

**Simulation:**
```bash
# Expired access token (wait 15 min or manually forge one with past exp)
EXPIRED_TOKEN="eyJhbGciOiJIUzI1NiJ9.<expired-payload>.<sig>"

curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $EXPIRED_TOKEN"

# Tampered token (change userId in payload)
# Use jwt.io to modify sub claim

# Wrong signature (sign with different secret)
node -e "require('jsonwebtoken').sign({sub:'fake',email:'x@x.com'},'wrong-secret')"
```

**Expected System Behavior:**
- 401 Unauthorized with `{ "message": "Unauthorized" }`
- No user data leaked in error response
- Tampered token: 401 (signature verification fails)

**Actual System Behavior:**
- Correctly returns 401 for expired/invalid tokens (JwtStrategy handles this)
- BUT: the dev fallback secret `nexusai-secret-change-in-prod` is public knowledge → token forgery is trivially possible in environments without proper `.env`

---

### Scenario 4: AI Provider Outage

**Simulation:**
```bash
# Set provider URL to a non-existent host
AI_KIMI_URL=http://nonexistent-host:9999 npm run start:dev

# Or block the provider's IP via hosts file (dev machine)
echo "127.0.0.1 api.moonshot.cn" >> /etc/hosts
```

**Expected System Behavior:**
- Return 503 with message: "AI provider temporarily unavailable"
- Do not save the user message without a response
- Log the provider error with full context

**Actual Risk:**
- Mock provider is the fallback — silently returns mock data instead of erroring
- User has no way to know the real AI model wasn't used

---

## Expected vs Actual Behavior Summary

| Scenario | Expected | Actual (Current) | Risk |
|----------|----------|-----------------|------|
| DB down | 503 + no data corruption | Unhandled 500 crash | High |
| AI timeout | 504 + no partial save | Hangs indefinitely | High |
| Expired token | 401 | Correct ✓ | Low |
| Tampered token | 401 | Correct ✓ | Low |
| Forged token (wrong secret) | 401 | Correct in prod; **FORGEABLE in dev** | Critical |
| AI provider down | 503 | Silent mock fallback | Medium |

## Cleanup

After each failure injection test:
1. Restore all mocked/patched services
2. Restart backend if needed
3. Delete any test sessions created during the test
4. Verify `GET /api/auth/me` returns correctly (system health check)
