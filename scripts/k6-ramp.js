/**
 * NexusAI — k6 Ramp-Up Load Test
 * Scenario: Gradual ramp from 0 → 100 → 500 VUs, then ramp down.
 * SLA thresholds: p(95) < 2000ms, error rate < 1%
 *
 * Run:
 *   k6 run scripts/k6-ramp.js
 *   k6 run --out json=automation-artifacts/k6-ramp-results.json scripts/k6-ramp.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Custom metrics ─────────────────────────────────────────────────────────
const authErrorRate   = new Rate('auth_errors');
const chatErrorRate   = new Rate('chat_errors');
const modelErrorRate  = new Rate('model_errors');
const chatLatency     = new Trend('chat_send_latency', true);
const loginLatency    = new Trend('login_latency', true);

// ── Options ────────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 100 },   // Ramp up to 100 VUs
    { duration: '60s', target: 100 },   // Hold at 100
    { duration: '30s', target: 500 },   // Ramp up to 500
    { duration: '60s', target: 500 },   // Hold at 500
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration:   ['p(50)<200', 'p(95)<2000', 'p(99)<5000'],
    http_req_failed:     ['rate<0.01'],
    auth_errors:         ['rate<0.01'],
    chat_errors:         ['rate<0.05'],
    model_errors:        ['rate<0.01'],
  },
};

const BASE = 'http://localhost:8000/api';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ── Helpers ────────────────────────────────────────────────────────────────
function loginUser(email, password) {
  const start = Date.now();
  const res = http.post(`${BASE}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: JSON_HEADERS }
  );
  loginLatency.add(Date.now() - start);
  authErrorRate.add(res.status !== 200 && res.status !== 201);
  check(res, { 'login success': (r) => r.status === 200 || r.status === 201 });
  try { return res.json('accessToken'); } catch { return null; }
}

// ── Default function (one VU iteration) ───────────────────────────────────
export default function () {
  // Each VU uses a unique email derived from its ID + iteration to avoid
  // hitting duplicate-email validation during signup.
  const email    = `loadtest-${__VU}-${__ITER}@nexusai.perf`;
  const password = 'LoadTest123!';

  // ── 1. Signup (first iteration only per VU) ──────────────────────────
  if (__ITER === 0) {
    group('auth_signup', () => {
      const r = http.post(`${BASE}/auth/signup`,
        JSON.stringify({ name: `LoadUser ${__VU}`, email, password }),
        { headers: JSON_HEADERS }
      );
      authErrorRate.add(r.status !== 201);
      check(r, { 'signup 201': (r) => r.status === 201 });
    });
  }

  // ── 2. Login ──────────────────────────────────────────────────────────
  let token;
  group('auth_login', () => {
    token = loginUser(email, password);
  });

  if (!token) { sleep(1); return; }

  const authHeaders = { ...JSON_HEADERS, Authorization: `Bearer ${token}` };

  // ── 3. Browse models (40% of realistic traffic) ───────────────────────
  group('models_list', () => {
    const r = http.get(`${BASE}/models`, { headers: JSON_HEADERS });
    modelErrorRate.add(r.status !== 200);
    check(r, { 'models 200': (r) => r.status === 200 });
  });

  // ── 4. Send chat message (25% of traffic — most expensive path) ───────
  group('chat_send', () => {
    const start = Date.now();
    const r = http.post(`${BASE}/chat/send`,
      JSON.stringify({ modelId: 'gpt4o', content: 'Load test message from k6' }),
      { headers: authHeaders }
    );
    chatLatency.add(Date.now() - start);
    chatErrorRate.add(r.status !== 200 && r.status !== 201);
    check(r, { 'chat 200/201': (r) => r.status === 200 || r.status === 201 });
  });

  // ── 5. Fetch chat history (15% of traffic) ────────────────────────────
  group('chat_history', () => {
    const r = http.get(`${BASE}/chat/history`, { headers: authHeaders });
    check(r, { 'history 200': (r) => r.status === 200 });
  });

  // ── 6. Dashboard usage (5% of traffic) ───────────────────────────────
  group('dashboard_usage', () => {
    const r = http.get(`${BASE}/dashboard/usage`, { headers: authHeaders });
    check(r, { 'dashboard 200': (r) => r.status === 200 });
  });

  sleep(1);
}
