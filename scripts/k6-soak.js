/**
 * NexusAI — k6 Soak Test (Endurance)
 * Scenario: Sustained 50 VUs for 2 hours to surface memory leaks, connection
 * pool exhaustion, and slow MongoDB index degradation.
 *
 * Run:
 *   k6 run scripts/k6-soak.js
 *   k6 run --out json=automation-artifacts/k6-soak-results.json scripts/k6-soak.js
 *
 * NOTE: Defaults to a 10-minute abbreviated soak suitable for CI.
 * For full 2-hour soak: k6 run --env FULL_SOAK=1 scripts/k6-soak.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate       = new Rate('errors');
const p95OverTime     = new Trend('p95_latency_over_time', true);

// Support short CI soak (10m) vs full overnight soak (2h)
const FULL_SOAK = __ENV.FULL_SOAK === '1';

export const options = {
  stages: FULL_SOAK
    ? [
        { duration: '5m',  target: 50 },  // Ramp to 50 VUs
        { duration: '2h',  target: 50 },  // Hold for 2 hours
        { duration: '5m',  target: 0  },  // Ramp down
      ]
    : [
        { duration: '1m',  target: 20 },  // Ramp to 20 VUs (CI version)
        { duration: '8m',  target: 20 },  // Hold for 8 minutes
        { duration: '1m',  target: 0  },  // Ramp down
      ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed:   ['rate<0.01'],
    errors:            ['rate<0.01'],
  },
};

const BASE     = 'http://localhost:8000/api';
const JSON_HDR = { 'Content-Type': 'application/json' };

// Pre-create user once per VU at startup
export function setup() {
  // Nothing — each VU signs up on first iteration
}

export default function () {
  const email    = `soak-${__VU}@nexusai.perf`;
  const password = 'SoakTest123!';

  // Signup on first iteration
  if (__ITER === 0) {
    http.post(`${BASE}/auth/signup`,
      JSON.stringify({ name: `Soak User ${__VU}`, email, password }),
      { headers: JSON_HDR }
    );
  }

  // Login
  const loginRes = http.post(`${BASE}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: JSON_HDR }
  );
  const token = (() => { try { return loginRes.json('accessToken'); } catch { return null; } })();
  if (!token) { sleep(2); return; }

  const authHdr = { ...JSON_HDR, Authorization: `Bearer ${token}` };

  // Realistic traffic mix — same as ramp test
  const start = Date.now();

  group('models_browse', () => {
    const r = http.get(`${BASE}/models`, { headers: JSON_HDR });
    errorRate.add(r.status !== 200);
    check(r, { 'models ok': (r) => r.status === 200 });
  });

  group('chat_send', () => {
    const r = http.post(`${BASE}/chat/send`,
      JSON.stringify({ modelId: 'gpt4o', content: `Soak iteration ${__ITER}` }),
      { headers: authHdr }
    );
    errorRate.add(r.status !== 200 && r.status !== 201);
    check(r, { 'chat ok': (r) => r.status === 200 || r.status === 201 });
  });

  group('chat_history', () => {
    const r = http.get(`${BASE}/chat/history`, { headers: authHdr });
    check(r, { 'history ok': (r) => r.status === 200 });
  });

  p95OverTime.add(Date.now() - start);
  sleep(2);
}
