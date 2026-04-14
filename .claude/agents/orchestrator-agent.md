# Orchestrator Agent

## Mission

Master coordinator for the NexusAI QA pipeline. Runs all agents in the correct sequence, aggregates their outputs, and produces a final unified QA report.

## Trigger

Invoked by the `/orchestrate-qa` skill or directly when a full QA cycle is needed.

## Pipeline Sequence

```
Phase 1 (Parallel):
  ├── test-case-generator-agent   → produces test case CSVs
  └── observability-agent         → audits current logging/metric gaps

Phase 2 (Sequential, depends on Phase 1):
  └── api-testing-agent           → consumes test cases, runs suite

Phase 3 (Sequential, depends on Phase 2):
  └── bug-detection-agent         → analyzes failures from test results

Phase 4 (Sequential, after bug fixes applied):
  └── regression-testing-agent    → validates fixes, checks no regressions

Phase 5 (Parallel with Phase 4, or standalone):
  - performance-smoke             -> pytest TestPerformance class (6 tests, in-suite)
  - performance-load              -> k6 ramp/spike/soak (on demand or nightly)

Phase 6 (Sequential, finalization):
  - qa-report-export              -> generate final QA report as Excel workbook
```

## Inputs

- `--scope` (optional): `auth`, `chat`, `models`, `dashboard`, `performance`, `full` (default: `full`)
- `--env` (optional): `local`, `staging` (default: `local`)
- `--fail-fast` (optional): stop on first Critical bug (default: false)
- `--perf-scenario` (optional): `smoke`, `ramp`, `spike`, `soak` (default: `smoke`)
- `--perf-vus` (optional): override VU count for k6 scenarios (default: per-script)

## Outputs

| File | Description |
|------|-------------|
| `automation-artifacts/qa-final-report-<timestamp>.md` | Merged report from all agents |
| `automation-artifacts/qa-summary.json` | Machine-readable pass/fail/severity counts |
| `automation-artifacts/regression-baseline.json` | Baseline results including PERF-001–006 |
| `automation-artifacts/qa-test-results.xlsx` | Full Excel workbook with Performance Tests sheet |
| `automation-artifacts/k6-ramp-results.json` | k6 ramp-up raw metrics (if run) |
| `automation-artifacts/k6-spike-results.json` | k6 spike raw metrics (if run) |
| `automation-artifacts/k6-soak-results.json` | k6 soak raw metrics (if run) |

## Decision Logic

```
IF any Critical severity bug found:
  → mark pipeline as BLOCKED
  → escalate immediately in final report
  → skip regression phase

IF all tests pass with zero High+ bugs:
  → mark pipeline as GREEN
  → produce green-gate report

IF only Medium/Low bugs found:
  → mark pipeline as YELLOW
  → list findings with recommendations
  → proceed to regression phase

IF any performance smoke test fails (PERF-001–006):
  → append PERF_DEGRADATION flag to pipeline status (e.g. YELLOW+PERF)
  → document which SLA was breached and measured value
  → do NOT block pipeline unless p95 > 5000ms or error rate > 10%

IF k6 thresholds breached (p95 > SLA or error rate > threshold):
  → append LOAD_FAIL flag
  → include k6 summary metrics in final report
```

## Performance SLA Targets

| Metric | Target | Notes |
|--------|--------|-------|
| p50 (lightweight endpoints) | < 200ms | Models, history, content |
| p50 (auth/bcrypt endpoints) | < 1000ms | Login, signup, refresh |
| p95 (all endpoints) | < 2000ms | Hard SLA |
| p99 (all endpoints) | < 5000ms | Soft SLA |
| Burst error rate (20 VUs) | < 5% | Smoke concurrency test |
| Sustained error rate | < 1% | k6 ramp/soak |
| Spike error rate | < 5% | k6 spike scenario |

## Performance Test Inventory

### Pytest Smoke Tests (run every CI pass)

| Test | Endpoint | Assertion | Script |
|------|----------|-----------|--------|
| PERF-001 | GET /api/models | p50<200ms, p95<2000ms | `specs/test_nexusai_suite.py` |
| PERF-002 | POST /api/auth/login | p50<1000ms, p95<2000ms | `specs/test_nexusai_suite.py` |
| PERF-003 | POST /api/chat/send | p95<2000ms | `specs/test_nexusai_suite.py` |
| PERF-004 | GET /api/models ×20 concurrent | error rate <5% | `specs/test_nexusai_suite.py` |
| PERF-005 | POST /api/auth/login ×20 concurrent | error rate <5% | `specs/test_nexusai_suite.py` |
| PERF-006 | GET /api/chat/history | p95<2000ms | `specs/test_nexusai_suite.py` |

Run command:
```bash
py -m pytest specs/test_nexusai_suite.py -v -k "TestPerformance"
```

### k6 Load Scenarios (on demand / nightly)

| Script | Scenario | VU Profile | Duration | Thresholds |
|--------|----------|-----------|---------|------------|
| `scripts/k6-ramp.js` | Ramp-Up | 0→100→500→0 | ~3.5 min | p95<2000ms, errors<1% |
| `scripts/k6-spike.js` | Spike | 10→1000 in 5s | ~65s | p95<5000ms, errors<5% |
| `scripts/k6-soak.js` | Soak (CI) | 20 VUs, 8 min | 10 min | p95<2000ms, errors<1% |
| `scripts/k6-soak.js --env FULL_SOAK=1` | Soak (Full) | 50 VUs, 2h | ~2h 10m | p95<2000ms, errors<1% |

Run commands:
```bash
k6 run --out json=automation-artifacts/k6-ramp-results.json  scripts/k6-ramp.js
k6 run --out json=automation-artifacts/k6-spike-results.json scripts/k6-spike.js
k6 run --out json=automation-artifacts/k6-soak-results.json  scripts/k6-soak.js
```

## Final Report Structure

```markdown
# NexusAI QA Final Report — <timestamp>

## Executive Summary
- Pipeline status: GREEN / YELLOW / BLOCKED / YELLOW+PERF / LOAD_FAIL
- Total tests run: N (functional) + 6 (performance smoke)
- Pass rate: N%
- Critical bugs: N | High: N | Medium: N | Low: N

## Agent Results
### Test Case Generator
### API Testing
### Bug Detection
### Regression Testing
### Observability
### Performance Testing
  #### Smoke Results (PERF-001–006)
  #### k6 Load Results (if run)
  #### SLA Breaches (if any)
  #### Known Performance Risks

## Risk Register
## Recommendations
## Next Steps
```

## Collaboration

- Reads rules from `.claude/rules.md`
- Delegates to all agents in `.claude/agents/`
- Writes all artifacts to `automation-artifacts/`
- Surfaces blocking issues to the user before proceeding
- Performance smoke tests self-bootstrap (no prior auth state required — `setup_class` handles signup)
`r`n## Phase 6: QA Final Report Excel

After Phases 1-5 complete, build the final Excel report at:
- `automation-artifacts/qa-final-report-<timestamp>.xlsx`

Minimum workbook tabs:
- `Executive Summary`
- `Functional Results`
- `Bug Register`
- `Regression Results`
- `Observability`
- `Performance (Smoke + k6)`

Excel generation rules:
- Reuse pipeline status and severity counts from `automation-artifacts/qa-summary.json`.
- Include per-test rows with: test id, endpoint, status, latency metrics, and notes.
- Include bug rows with: bug id, severity, component, repro status, and owner (if available).
- Include performance SLA columns (`p50`, `p95`, `p99`, `error_rate`) and pass/fail flags.
- Keep the existing markdown report output unchanged; Excel is an additional final artifact.

