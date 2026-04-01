# NexusAI Claude Workspace

This folder is the operating system for the later build. It defines agent roles, shared rules, routing plans, architecture drafts, checklists, and reusable prompts so the frontend and backend can be built in disciplined passes instead of ad hoc edits.

## Step 1 Scope

- Create documentation and workflow only.
- Do not implement product features in this step.
- Do not rewrite `frontend/` or `backend/` source code in this step beyond instruction files.

## Canonical Product References

- Functional and visual reference: `frontend/index.html`
- Layout accuracy reference: `frontend/screenshots/`
- Current frontend baseline: Next.js App Router starter in `frontend/src/app/`
- Current backend baseline: NestJS starter in `backend/src/`

## Required Product Shape

- Light modern experience based on the HTML and screenshots, with tasteful improvement allowed.
- Main navigation must include `Chat Hub`, `Marketplace`, `Agents`, and `Discover New`.
- Core app must use a three-column chat layout: left model list, center chat, right insights/actions panel.
- Guest chat must work before authentication and expire after exactly 3 hours.
- Login must upgrade guest history into permanent database history.
- Smart capability routing must convert unsupported image/audio/video/vision requests into facilitation prompts.

## Agent System

- Frontend Agent: owns Next.js App Router UI, MUI theme, Context API state, chat shell, voice/TTS/camera UI, guest cache UX, and marketplace UX.
- Backend Agent: owns NestJS modules, Mongo/Mongoose design, auth, guest sessions, chat persistence, uploads, and AI provider integrations with Kimi first.
- QA Agent: owns route/button/chat/filter/auth regression testing and checklist-based validation.
- Analyzer Agent: owns HTML/screenshot comparison, missing-flow detection, performance/cost review, and fix-loop enforcement.

## Working Order

1. Read `.claude/rules.md`, `.claude/project-map.md`, and `.claude/architecture-plan.md`.
2. Run the analyzer pass first to extract UI and flow targets from the HTML and screenshots.
3. Let frontend and backend agents implement only within their owned paths.
4. Run the QA pass against routes, buttons, chat, guest flow, and filters.
5. Run the analyzer again and keep looping until the output is a close match with no critical gaps.

## What Lives Here

- `rules.md`: non-negotiable delivery and workflow rules
- `project-map.md`: current file map, planned routes, and path ownership
- `architecture-plan.md`: draft solution architecture and phased build plan
- `conventions.md`: naming, design, state, API, and editing conventions
- `prompts/`: reusable prompts for orchestration, QA, and analyzer passes
- `agents/`: explicit job descriptions for each agent
- `skills/`: practical capability checklists per agent
- `checklists/`: UI, API, security, and performance acceptance criteria

## Repo-Local Claude Folders

- `frontend/.claude/`: frontend-only workflow, rules, skills, and checklists for the Next.js app
- `backend/.claude/`: backend-only workflow, rules, skills, and checklists for the NestJS API
- `.claude/skills/workspace-coordination.md`: shared coordination guide across root, frontend, and backend Claude folders

When a task is repo-specific, read the matching repo-local `.claude/` folder after reading this root folder.

## Success Criteria For The Later Build

- Production-ready structure
- No dead buttons
- Responsive across mobile and desktop
- Light theme only
- Close behavioral match to `frontend/index.html` and the screenshot set
