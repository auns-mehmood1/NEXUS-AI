# Skill: Orchestrate QA Pipeline

**Trigger:** `/orchestrate-qa [--scope <full|auth|chat|models>] [--fail-fast]`

**Description:** Run the complete NexusAI QA pipeline. Coordinates all agents in the correct sequence, aggregates outputs, and produces a unified final QA report.

## Usage

```bash
/orchestrate-qa                    # Full pipeline, all modules
/orchestrate-qa --scope auth       # Auth module only
/orchestrate-qa --fail-fast        # Stop on first Critical bug
/orchestrate-qa --scope chat --fail-fast
```

## Pipeline Execution

### Phase 1 — Parallel Setup (both start simultaneously)

**Agent A: Test Case Generator**
```
Input:  backend/src/**/*.ts (controllers, DTOs, services)
Output: specs/*-test-cases.csv
Time:   ~30s
```

**Agent B: Observability Audit**
```
Input:  backend/src/**, .claude/rules.md
Output: automation-artifacts/observability-report-<ts>.md
Time:   ~20s
```

### Phase 2 — API Test Execution (starts after Phase 1)

**Agent: API Testing**
```
Input:  specs/*-test-cases.csv + live backend
Output: automation-artifacts/api-test-results.json
        automation-artifacts/api-test-report.md
        playwright-report/
Time:   ~2-5 min
```

### Phase 3 — Analysis (starts after Phase 2)

**Agent: Bug Detection**
```
Input:  automation-artifacts/api-test-results.json
        backend/backend-dev.log
Output: automation-artifacts/bug-report-<ts>.md
Time:   ~30s
```

### Phase 4 — Regression (after bug fixes applied)

**Agent: Regression Testing**
```
Input:  automation-artifacts/regression-baseline.json
        current test run results
Output: automation-artifacts/regression-delta-<ts>.md
Time:   ~2-3 min
```

### Phase 5 — Final Report Assembly

**Orchestrator merges all outputs:**
```
Input:  All agent reports
Output: automation-artifacts/qa-final-report-<ts>.md
        automation-artifacts/qa-summary.json
```

## Orchestration Script

The skill generates `scripts/orchestrate-qa.py`:

```python
#!/usr/bin/env python3
"""NexusAI QA Orchestration Script"""

import subprocess, json, datetime, os

ARTIFACTS = "automation-artifacts"
os.makedirs(ARTIFACTS, exist_ok=True)
ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

results = {}

# Phase 1: Generate test cases
print("[ Phase 1 ] Generating test cases...")
r = subprocess.run(["python", "specs/generate_test_cases.py"], capture_output=True)
results["test_case_generator"] = "pass" if r.returncode == 0 else "fail"

# Phase 2: Run API suite
print("[ Phase 2 ] Running API test suite...")
r = subprocess.run(
    ["pytest", "specs/", "-v", "--tb=short",
     f"--json-report", f"--json-report-file={ARTIFACTS}/api-test-results.json"],
    capture_output=True
)
results["api_testing"] = "pass" if r.returncode == 0 else "fail"

# Phase 3: Bug detection
print("[ Phase 3 ] Detecting bugs...")
r = subprocess.run(["python", "scripts/detect_bugs.py", f"--results={ARTIFACTS}/api-test-results.json"],
    capture_output=True)
results["bug_detection"] = "pass" if r.returncode == 0 else "fail"

# Phase 4: Regression check
print("[ Phase 4 ] Running regression checks...")
r = subprocess.run(["pytest", "specs/test_regression.py", "-v"], capture_output=True)
results["regression"] = "pass" if r.returncode == 0 else "fail"

# Phase 5: Generate final report
print("[ Phase 5 ] Generating final report...")
status = "GREEN" if all(v == "pass" for v in results.values()) else "YELLOW"

with open(f"{ARTIFACTS}/qa-summary.json", "w") as f:
    json.dump({"timestamp": ts, "status": status, "phases": results}, f, indent=2)

print(f"\n{'='*50}")
print(f"QA Pipeline Complete — Status: {status}")
print(f"Report: {ARTIFACTS}/qa-final-report-{ts}.md")
print('='*50)
```

Run it:
```bash
python scripts/orchestrate-qa.py
```

## Final Report Template

`automation-artifacts/qa-final-report-<timestamp>.md`:

```markdown
# NexusAI QA Final Report
**Date:** <timestamp>
**Branch:** <git branch>
**Commit:** <git sha>
**Status:** GREEN / YELLOW / BLOCKED

## Executive Summary
| Metric | Value |
|--------|-------|
| Total Tests | N |
| Passed | N |
| Failed | N |
| Pass Rate | N% |
| Critical Bugs | N |
| High Bugs | N |
| Medium Bugs | N |
| Low Bugs | N |

## Phase Results
| Phase | Agent | Status | Duration |
|-------|-------|--------|----------|
| 1A | Test Case Generator | PASS | 28s |
| 1B | Observability Audit | PASS | 18s |
| 2  | API Testing | FAIL | 4m12s |
| 3  | Bug Detection | PASS | 22s |
| 4  | Regression | PASS | 2m44s |

## Bug Summary
[From bug-detection-agent output]

## Observability Gaps
[From observability-agent output]

## Recommendations
1. [Highest priority fix]
2. [Second priority]
...

## Next Steps
- [ ] Fix Critical: BUG-AUTH-001 (hardcoded JWT secrets)
- [ ] Fix High: BUG-CHAT-001 (string vs ObjectId comparison)
- [ ] Fix High: BUG-AUTH-002 (add rate limiting)
- [ ] Fix Medium: BUG-DASHBOARD-001 (real aggregation)
```
