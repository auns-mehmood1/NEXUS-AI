# NexusAI Build Rules

These rules are mandatory for every future build pass.

## Hard Boundaries

- Do not create a new repository.
- Treat `frontend/` and `backend/` as the only app repos.
- Do not dump large files or long generated code into chat unless explicitly requested.
- Modify only necessary files for the current task.
- Prefer incremental commits grouped by feature or layer.
- Always summarize changes in short form after each pass.
- Avoid duplicate code, duplicate styles, and duplicated business logic.

## Reference-First Rule

- `frontend/index.html` is the canonical feature and interaction reference.
- `frontend/screenshots/` is the canonical layout and composition reference.
- Improvements are allowed only if the required sections, actions, and flows remain present.
- Final UI must stay in a light modern theme. Dark theme is out of scope.

## Required Navigation

Every build must preserve visible access to:

- `Chat Hub`
- `Marketplace`
- `Agents`
- `Discover New`
- language selector
- `Sign In`
- `Get Started` or `Try Free`

## Required Chat Hub Shape

- Use a three-column app shell.
- Left sidebar contains a searchable model list with at least 400 models. Match the reference more closely by targeting 525+ if feasible.
- Center column contains chat history, message composer, active model meta, attachments, and action prompts.
- Right panel must show:
  - active model card with context, rating, and price
  - usage overview with requests, average latency, and cost
  - a graph or sparkline
  - grouped quick actions

## Required Marketplace Shape

- model card grid
- chip filters for `language`, `vision`, `code`, `image gen`, `audio`, and `open source`
- left sidebar filters for provider and pricing
- token limit slider
- pagination or virtualization for long lists

## Required Guest And Auth Rules

- Guest users can chat without signing in.
- Guest history must be stored locally with exact 3 hour expiry.
- Use a layered strategy:
  - localStorage for cached conversation payloads
  - sessionStorage for active transient UI state
  - cookie for guest session id and expiry marker when useful
- Expiry must be exactly `10800000` milliseconds from guest session creation.
- Signing in upgrades guest history into permanent backend history.
- Upgrade flow must avoid data loss and duplicate messages.

## Required Model Switching Rules

- Selecting a model changes the active model for the next chat turns.
- The active model name must appear near chat meta and composer context.
- Right-panel stats must update when the active model changes.

## Smart Capability Routing Rule

If the selected model does not natively support image, audio, video, or vision work:

- do not silently fail
- do not show a dead button
- generate a facilitation prompt template instead
- recommend a better-suited model
- explain the capability gap in plain language

This rule must mirror the intent of `getActionPrompt()` from `frontend/index.html`.

## Performance And Token Rules

- Cache model metadata on the frontend and backend.
- Use pagination or virtualization for large model lists and marketplace grids.
- Keep route payloads lean.
- Lazy-load non-critical detail panels and heavy modals.
- Avoid repeated network fetches for stable reference data.
- Prefer derived selectors over repeated traversal of large arrays.
- Keep prompts and generated summaries compact unless detail is explicitly requested.

## Delivery Quality Rules

- No dead buttons, empty routes, or fake success states.
- Responsive on desktop and mobile.
- Accessible focus states, semantic headings, and keyboard support.
- Backend endpoints must return consistent errors and typed contracts.
- Analyzer and QA findings must be resolved before a pass is considered complete.

## Fix Loop Rule

The build is not done when it merely compiles. It is done when:

1. required sections exist
2. required flows work
3. QA passes the checklists
4. Analyzer reports a close visual and behavioral match with no critical gaps
