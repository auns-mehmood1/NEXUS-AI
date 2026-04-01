# Prompt 2: Start Build

Continue the NexusAI project after Step 1 setup.

## Read First

- `.claude/README.md`
- `.claude/rules.md`
- `.claude/project-map.md`
- `.claude/architecture-plan.md`
- `.claude/conventions.md`
- `frontend/CLAUDE.md`
- `backend/CLAUDE.md`

## References

- Functional and UI reference: `frontend/index.html`
- Screenshot reference set: `frontend/screenshots/`

## Objective

Build the actual NexusAI product inside the existing `frontend/` and `backend/` repos. Follow the documented 4-agent workflow and keep changes incremental.

## Agent Roles

- Frontend Agent
  - build Next.js App Router UI, MUI light theme, Context API state, chat hub, marketplace, voice/TTS/camera UI, and guest cache UX
- Backend Agent
  - build NestJS modules, MongoDB/Mongoose schemas, JWT auth, guest session flow, chat persistence, uploads, analytics, and Kimi-first provider integration
- QA Agent
  - test routes, buttons, chat behavior, marketplace filters, auth/guest history, and regressions
- Analyzer Agent
  - compare implementation to `frontend/index.html` and screenshots, detect missing sections/flows, review cost and performance, and enforce fix loops

## Mandatory Product Rules

- keep a light modern theme only
- include `Chat Hub`, `Marketplace`, `Agents`, and `Discover New`
- include language selector, `Sign In`, and `Get Started` or `Try Free`
- implement a three-column chat hub
- keep a searchable 400+ model list, preferably close to the 525 reference target
- implement marketplace chips and sidebar filters
- support guest chat with exact 3-hour expiry
- upgrade guest history into permanent DB history on login
- reflect active model changes in chat meta
- use facilitation prompts when the active model lacks image/audio/video/vision support
- no dead buttons
- cache model list on frontend and backend
- use pagination or virtualization for large lists

## Build Order

1. Extract the required UI sections, panels, routes, and flows from the HTML and screenshots.
2. Scaffold the frontend route groups and backend modules.
3. Build chat hub, model switching, guest session flow, and marketplace filtering.
4. Connect auth, chat persistence, uploads, analytics, and provider integration.
5. Run QA pass.
6. Run analyzer pass.
7. Fix every critical and high-severity gap.
8. Repeat QA and analyzer until the result is a close match.

## Output Style

- Do not dump huge files unless requested.
- Summarize changes in short form.
- Group changes logically.
- Call out unresolved risks explicitly.
