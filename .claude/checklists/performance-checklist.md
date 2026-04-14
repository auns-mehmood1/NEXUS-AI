# Performance Test Checklist

Complete performance verification for NexusAI before production release.

## Baseline Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| P50 response time | < 200ms | k6 metrics |
| P95 response time | < 2000ms | k6 metrics |
| P99 response time | < 5000ms | k6 metrics |
| Error rate under load | < 1% | k6 `http_req_failed` |
| Sustained throughput | 500 req/s | k6 VU ramp |
| Memory under 1h soak | < 512MB | `process.memoryUsage()` |

---

## Pre-Test Checks

- [ ] Backend running in production mode (`NODE_ENV=production`)
- [ ] MongoDB connection pool configured (`maxPoolSize: 50`)
- [ ] No debug logging enabled (logs add latency)
- [ ] Previous test data cleaned from DB
- [ ] Load test user accounts pre-created

---

## Database Performance

### Indexes Verified
- [ ] `sessions.userId + updatedAt` compound index exists (for `GET /chat/history`)
- [ ] `sessions.guestId` index exists (for migration queries)
- [ ] `sessions.expiresAt` TTL index exists (auto-cleanup)
- [ ] `users.email` unique index exists

### Query Analysis
- [ ] `GET /chat/history` uses index scan (not collection scan)
- [ ] `POST /chat/migrate` `updateMany` uses index
- [ ] `GET /models` served from cache (no DB hit)
- [ ] Slow query log checked after each load test

---

## API Endpoint Performance

### POST /api/chat/send
- [ ] P95 < 5000ms (accounts for AI provider latency)
- [ ] No memory growth per request (no unbounded message history in memory)
- [ ] Session with 100 messages: P95 still < 5000ms
- [ ] Concurrent sends to same session: no data corruption

### POST /api/auth/login
- [ ] P95 < 500ms (bcrypt is expensive — 12 rounds)
- [ ] 100 concurrent logins: no 503 or 500
- [ ] No connection pool exhaustion under load

### GET /api/models
- [ ] P95 < 100ms (static data, should be very fast)
- [ ] Filtering by search/type/lab/maxPrice: P95 < 200ms
- [ ] 1000 concurrent requests: handled without degradation

### GET /api/chat/history
- [ ] P95 < 500ms for users with 50 sessions
- [ ] Uses DB index (verify with `explain()`)

---

## Load Test Scenarios

### Scenario 1: Normal Load (100 VUs)
- [ ] Run `scripts/k6-ramp.js` with 100 VUs for 5 minutes
- [ ] All thresholds met: P95 < 2s, error rate < 1%
- [ ] No OOM crash
- [ ] No MongoDB timeout errors in logs

### Scenario 2: Spike (1000 VUs for 30s)
- [ ] Run spike test
- [ ] Error rate < 5% during spike (graceful degradation)
- [ ] System recovers to normal within 60s after spike

### Scenario 3: Soak (50 VUs for 1 hour)
- [ ] Memory stays stable (no leak)
- [ ] P95 doesn't degrade over time
- [ ] No MongoDB connection exhaustion

---

## Post-Test Analysis

- [ ] Check Node.js heap size before/after soak test
- [ ] Check MongoDB slow query log for queries > 100ms
- [ ] Check for any 5xx errors in logs during test
- [ ] Record baseline metrics for regression comparison
- [ ] Update `automation-artifacts/performance-baseline.json` with results

---

## Bottleneck Identification Guide

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| High P99 on /auth/login | bcrypt rounds too high | Reduce from 12 to 10 |
| Chat/send P95 > 5s | AI provider slow | Add timeout + circuit breaker |
| MongoDB connection errors | Pool too small | Increase `maxPoolSize` |
| Memory growth in soak test | Unbounded session messages | Limit history depth |
| Models endpoint slow | No caching | Add in-memory or Redis cache |
| CPU spike on login | Bcrypt on main thread | Use async bcrypt (already done) |
