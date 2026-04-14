/**
 * NexusAI — k6 Spike Test
 * Scenario: Sudden 100x traffic surge to simulate viral/marketing event.
 * Validates the system doesn't crash or degrade catastrophically under instant load.
 *
 * Run:
 *   k6 run scripts/k6-spike.js
 *   k6 run --out json=automation-artifacts/k6-spike-results.json scripts/k6-spike.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 10   },   // Baseline — 10 VUs
    { duration: '5s',  target: 1000 },   // Sudden spike to 1000 VUs
    { duration: '30s', target: 1000 },   // Hold spike for 30s
    { duration: '10s', target: 10   },   // Back to baseline
    { duration: '10s', target: 0    },   // Ramp down
  ],
  thresholds: {
    // Spike test — relaxed thresholds (system may slow but must not crash)
    http_req_duration: ['p(95)<5000'],
    http_req_failed:   ['rate<0.05'],   // Allow up to 5% errors during spike
    errors:            ['rate<0.05'],
  },
};

const BASE        = 'http://localhost:8000/api';
const JSON_HDR    = { 'Content-Type': 'application/json' };

export default function () {
  // Focus spike test on the two most expensive endpoints
  group('spike_login', () => {
    const r = http.post(`${BASE}/auth/login`,
      JSON.stringify({
        email:    `spike-${__VU}@nexusai.perf`,
        password: 'SpikeTest123!',
      }),
      { headers: JSON_HDR }
    );
    // During a spike, 401 (user doesn't exist) is acceptable — we care about 500s
    errorRate.add(r.status === 500);
    check(r, { 'not 500': (r) => r.status !== 500 });
  });

  group('spike_models', () => {
    const r = http.get(`${BASE}/models`, { headers: JSON_HDR });
    errorRate.add(r.status !== 200);
    check(r, { 'models 200': (r) => r.status === 200 });
  });

  sleep(0.5);
}
