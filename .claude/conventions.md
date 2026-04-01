# Conventions

## General

- Build from the existing repos. Do not create parallel apps.
- Keep documentation and implementation aligned with `.claude/`.
- Favor small, reviewable changes over broad rewrites.

## Design Conventions

- Light theme only
- Modern but grounded visual language
- Preserve the reference information architecture
- Prefer the reference typography direction from `frontend/index.html`
  - display/headings: `Syne` or a close equivalent
  - body/UI text: `Instrument Sans` or a close equivalent
- Keep spacing airy and card surfaces readable
- Make desktop and mobile behavior explicit, not incidental

## Frontend Code Conventions

- Use Next.js App Router patterns, not Pages Router
- Use MUI for theming, layout primitives, and consistent tokens
- Use Context API for cross-route app state
- Keep feature code grouped by domain
- Prefer typed service wrappers for API access
- Keep browser-only APIs behind client component boundaries
- Centralize guest cache utilities and expiry math
- Centralize capability routing helpers

## Backend Code Conventions

- Use modular NestJS structure by feature
- Keep controllers thin and services responsible for business logic
- Use DTO validation for incoming requests
- Keep provider integrations behind a unified interface
- Hash refresh tokens before storage
- Represent expiry using explicit timestamps, not inferred durations
- Separate catalog reads from chat write paths

## Naming Conventions

- Route names should match product wording: `chat`, `marketplace`, `agents`, `discover`
- Use `guestSession`, `activeModel`, `usageOverview`, and `capabilityRouting` naming consistently
- Keep model capability labels normalized:
  - `language`
  - `vision`
  - `code`
  - `image_gen`
  - `audio`
  - `video`
  - `open_source`

## Testing Conventions

- Every visible route gets at least one happy-path test
- Every visible CTA must have a working action and test coverage
- Guest history expiry and upgrade logic need dedicated tests
- Marketplace filters need unit and integration coverage
- Regression reports must be short, specific, and reproducible

## Token Optimization Conventions

- Never paste whole large files into status updates unless asked
- Summaries first, diffs second
- Reuse helpers instead of repeating view-model logic
- Keep prompts compact and task-specific
- Favor file-local edits over churn across many unrelated files
