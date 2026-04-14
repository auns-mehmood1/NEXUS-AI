# NexusAI — Agentic QA System

This directory contains the complete agent-based QA infrastructure for NexusAI, designed to implement the QA Evaluation Assignment covering:

- Codebase understanding and risk analysis
- Agent-driven QA workflows
- Automated and AI-assisted testing
- Observability, failure injection, and performance thinking

## Directory Layout

```
.claude/
  README.md               ← You are here
  rules.md                ← Global constraints all agents must follow
  settings.json           ← Claude Code hook and automation config
  agents/
    orchestrator-agent.md         ← Master coordinator, runs all agents, produces QA report
    test-case-generator-agent.md  ← Generates test cases from code and schemas
    api-testing-agent.md          ← Executes API test suite against live endpoints
    bug-detection-agent.md        ← Detects, classifies, and documents bugs
    regression-testing-agent.md   ← Regression safety after every change
    observability-agent.md        ← Monitoring, logging, tracing coverage
  skills/
    test-case-generation.md   ← /generate-test-cases
    api-test-suite.md         ← /run-api-suite
    bug-reproduction.md       ← /detect-bugs
    edge-case-discovery.md    ← /edge-case-discovery
    failure-injection.md      ← /failure-injection
    performance-testing.md    ← /performance-test
    observability-qa.md       ← /observability-check
    agent-orchestration.md    ← /orchestrate-qa
  prompts/
    test-case-prompt.md       ← Structured AI prompts for test generation
    bug-detection-prompt.md   ← Prompts for bug reproduction and root cause
    edge-case-prompt.md       ← Prompts for hidden edge case discovery
  checklists/
    api-checklist.md          ← Pre-run API coverage checklist
    security-checklist.md     ← Auth, injection, token security checks
    performance-checklist.md  ← Load and concurrency checklist
    qa-checklist.md           ← Full regression QA checklist
```

## Agent Orchestration Flow

```
┌─────────────────────────────────────────────────────┐
│                  ORCHESTRATOR AGENT                  │
│  (Entry point — coordinates all agents below)        │
└──────┬──────────────────────────────────────────────┘
       │
       ├─► TEST CASE GENERATOR AGENT
       │     Reads API schemas + source code
       │     Outputs: test-cases/*.csv
       │
       ├─► API TESTING AGENT
       │     Consumes test cases from generator
       │     Runs Playwright/pytest against live API
       │     Outputs: test-results/, playwright-report/
       │
       ├─► BUG DETECTION AGENT
       │     Analyzes test results + logs
       │     Classifies severity (Critical/High/Medium/Low)
       │     Outputs: bug-report.md
       │
       ├─► REGRESSION TESTING AGENT
       │     Reruns full suite after bug fixes
       │     Compares against baseline
       │     Outputs: regression-delta.md
       │
       └─► OBSERVABILITY AGENT
             Checks log coverage, metric gaps, alert rules
             Outputs: observability-report.md
```

## Quick Start

```bash
# Run the full QA pipeline
/orchestrate-qa

# Generate test cases only
/generate-test-cases

# Run API test suite
/run-api-suite

# Check for bugs from recent logs
/detect-bugs

# Find edge cases in a specific module
/edge-case-discovery auth

# Simulate failures
/failure-injection --target database

# Load testing
/performance-test --vus 1000 --duration 60s

# Check observability coverage
/observability-check
```
