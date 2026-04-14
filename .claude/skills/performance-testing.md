# Skill: Performance Testing

**Trigger:** `/performance-test [--vus <n>] [--duration <s>] [--scenario <ramp|spike|soak>]`

**Description:** Design and execute load testing for NexusAI to identify bottlenecks, verify concurrent request handling, and define scaling thresholds.

## Usage

```bash
/performance-test                              # Default: 100 VUs, 60s ramp
/performance-test --vus 1000 --duration 120s  # High load test
/performance-test --scenario spike             # Spike test (sudden 10x traffic)
/performance-test --scenario soak              # Soak test (low load, long duration)
/performance-test --endpoint /api/chat/send   # Test specific endpoint
```

## Tool: k6

Primary load testing tool. Install:
```bash
# Windows
choco install k6
# or download from https://k6.io/docs/getting-started/installation/
```

## Test Scenarios

### Scenario 1: Ramp-Up (Normal Growth)
```javascript
// scripts/k6-ramp.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '60s', target: 100 },   // Hold at 100
    { duration: '30s', target: 500 },   // Ramp to 500
    { duration: '60s', target: 500 },   // Hold at 500
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% under 2s
    http_req_failed: ['rate<0.01'],     // <1% error rate
  },
};

export default function () {
  // Auth flow
  const loginRes = http.post('http://localhost:8000/api/auth/login', JSON.stringify({
    email: 'loadtest@nexusai.test',
    password: 'LoadTest123',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'login 200': (r) => r.status === 200 });
  const token = loginRes.json('accessToken');

  // Chat send
  const chatRes = http.post('http://localhost:8000/api/chat/send', JSON.stringify({
    modelId: 'gpt4o',
    content: 'Hello from load test',
  }), {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });

  check(chatRes, { 'chat 200': (r) => r.status === 200 });
  sleep(1);
}
```

### Scenario 2: Spike Test (Sudden Traffic Surge)
```javascript
export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Baseline
    { duration: '5s', target: 1000 },   // Sudden spike to 1000
    { duration: '30s', target: 1000 },  // Hold spike
    { duration: '10s', target: 10 },    // Back to baseline
  ],
};
```

### Scenario 3: Soak Test (Endurance)
```javascript
export const options = {
  stages: [
    { duration: '5m', target: 50 },    // Ramp to 50
    { duration: '2h', target: 50 },    // Hold for 2 hours (detect memory leaks)
    { duration: '5m', target: 0 },     // Ramp down
  ],
};
```

## Endpoints to Load Test (Priority Order)

| Priority | Endpoint | Reason |
|----------|----------|--------|
| 1 | POST /api/chat/send | Most expensive: DB read, AI call, DB write |
| 2 | POST /api/auth/login | Bcrypt comparison is CPU-heavy |
| 3 | GET /api/models | Static data, should be cached |
| 4 | GET /api/chat/history | DB query with sort + limit |
| 5 | POST /api/auth/refresh | Token verification + DB update |

## Traffic Simulation Strategy

### Realistic Traffic Mix (100% = 1000 VUs)
```
40% → GET /api/models (browsing catalog)
25% → POST /api/chat/send (active chatting)
15% → GET /api/chat/history (dashboard views)
10% → POST /api/auth/login (new sessions)
 5% → POST /api/auth/refresh (token rotation)
 5% → GET /api/dashboard/usage (analytics)
```

## Bottleneck Identification

Watch these metrics during tests:

```
CPU usage on backend process (should stay < 70%)
MongoDB query time (mongostats or explain())
Memory heap of Node.js process (node --inspect)
Event loop lag (add custom metric)
MongoDB connection pool exhaustion
```

Run alongside k6:
```bash
# Watch Node.js memory
node --max-old-space-size=512 backend/dist/main.js

# MongoDB slow query log
db.setProfilingLevel(1, { slowms: 100 })
```

## Scaling Approach

| Load Level | Recommended Action |
|------------|-------------------|
| < 100 VUs | Single Node process, single MongoDB instance |
| 100-500 VUs | Add MongoDB indexes, enable NestJS cluster mode (2-4 workers) |
| 500-2000 VUs | Horizontal scaling (2-4 NestJS pods), MongoDB replica set |
| 2000-10000 VUs | Load balancer (nginx/HAProxy), Redis session cache, MongoDB Atlas M30+ |
| > 10000 VUs | CDN for static model catalog, separate chat microservice, message queue (BullMQ) for AI calls |

## Key Indexes to Add for Performance

```javascript
// Session model — most queried paths
db.sessions.createIndex({ userId: 1, updatedAt: -1 })  // history query
db.sessions.createIndex({ guestId: 1 })                 // guest lookup
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })  // TTL (already exists)

// Users model
db.users.createIndex({ email: 1 }, { unique: true })    // already exists via schema
```

## SLA Targets

| Metric | Target |
|--------|--------|
| P50 response time | < 200ms |
| P95 response time | < 2000ms |
| P99 response time | < 5000ms |
| Error rate | < 1% |
| Availability | > 99.9% |
| Throughput | 500 req/s sustained |
