# Workspace Coordination Skill

Use this skill when work spans the root `.claude/`, `frontend/.claude/`, and `backend/.claude/` folders.

## Purpose

Keep the three Claude layers synchronized so the frontend and backend can move independently without drifting away from the shared product plan.

## Read Order

1. Root `.claude/README.md`
2. Root `.claude/rules.md`
3. Repo-local `.claude/README.md`
4. Repo-local `rules.md`
5. Repo-local `workflow.md`
6. Repo-local skills and checklists relevant to the task

## Coordination Rules

- Root `.claude/` defines product-wide truth, architecture, routing, and acceptance rules.
- `frontend/.claude/` defines frontend-only execution details.
- `backend/.claude/` defines backend-only execution details.
- If a local rule conflicts with the root rule, the root rule wins unless the local rule is a stricter specialization.
- Shared contracts must be updated in both layers when one side changes.

## Handshake Between Frontend And Backend

- frontend owns UI composition, local guest cache, client state, and route behavior
- backend owns auth, database persistence, uploads, analytics, and provider integration
- both sides must agree on:
  - model metadata shape
  - guest session ids and expiry timestamps
  - auth payloads
  - chat session and message contracts
  - usage overview payloads

## Change Protocol

1. Start from the root plan.
2. Open the relevant repo-local `.claude/` folder.
3. Make only repo-owned changes unless the task explicitly spans both repos.
4. If a shared contract changes, reflect it in the other repo's local docs or implementation plan.
5. Run the repo-local checklist first, then the root QA/analyzer passes.

## Drift Prevention

- Do not let frontend invent API fields that backend has not agreed to expose.
- Do not let backend rename contracts without updating frontend consumers and docs.
- Keep guest expiry fixed at exactly 3 hours everywhere.
- Keep capability-routing behavior consistent with the root rules and HTML reference.
