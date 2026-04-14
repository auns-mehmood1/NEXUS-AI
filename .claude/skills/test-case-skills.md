# Test Case Skills

Use this skill to inspect a live URL and generate QA-ready test cases.

## Trigger
Use `test-case-agent` when user provides:
- target URL
- optional scope (flows, sections, features)

## Agent
Delegate to `.claude/agents/test-case-agent.md`.

## Must Cover
- Page inspection: layout, components, forms, navigation, states, dynamic behavior
- Frontend coverage: rendering, interactions, validations, routing
- Backend/API coverage: status codes, payload validation, auth/authz, business rules, 4xx/5xx handling, idempotency/duplicate submission, rate limiting (if observable), session behavior
- Integration coverage: UI-to-API behavior and user-visible data integrity
- Scenario depth: Positive, Negative, Edge, valid/invalid inputs

## Required Fields Per Test Case
- `Test ID` (e.g., `TC-001`)
- `Test Title`
- `Scenario Type` (`Positive` | `Negative` | `Edge`)
- `Layer` (`Frontend` | `Backend` | `Integration` | `API`)
- `Test Steps`
- `Test Data`
- `Expected Result`
- `Actual Result` (default: `Not Executed`)
- `Test Status` (default: `Pending`)

## Rules
- Inspect live page first; do not guess behavior.
- Always include all 4 layers: Frontend, Backend, Integration, API.
- Include success and failure tests for each key flow.
- Do not include database checks, generic cases, guessed internal logic, or execution summary metrics.
- No shallow/generic cases.
- Do not include or mention database validation.
- Do not include execution summaries, percentages, counts, or analytics notes.

## Output Format
1. `Page Analysis Summary`:
   - Page Title
   - Main Sections
   - Key User Flows
   - Forms / Inputs
   - API Behavior
   - Risk Areas
2. `Test Cases`:
   - Structured table/list with all required fields.
