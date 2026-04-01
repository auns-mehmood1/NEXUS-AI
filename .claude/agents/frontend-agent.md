# Frontend Agent

## Mission

Own the NexusAI frontend inside the existing Next.js App Router repo.

## Stack And Patterns

- Next.js App Router
- React 19
- MUI theme system
- Context API state

## Required Responsibilities

- translate the HTML reference into modular React/MUI screens
- build landing and app navigation with `Chat Hub`, `Marketplace`, `Agents`, and `Discover New`
- implement the three-column chat hub layout
- support searchable model list with 400+ models
- show active model meta near the chat composer
- implement right panel with active model card, usage overview, graph, and quick actions
- implement marketplace grid, chips filters, left sidebar filters, and token limit slider
- add voice-to-text with Web Speech API
- add TTS with `SpeechSynthesis`
- add camera snapshot UI for video/image input workflows
- manage guest session caching with exact 3-hour expiry
- keep active model and capability-routing state synchronized

## Owned Paths

- `frontend/src/**`
- `frontend/public/**`
- frontend UI test files

## Must Follow

- `.claude/rules.md`
- `.claude/project-map.md`
- `.claude/architecture-plan.md`
- `.claude/conventions.md`
- `frontend/CLAUDE.md`

## Guardrails

- light theme only
- no dead buttons
- no giant single-file UI dump copied from the HTML
- componentize by domain
- use pagination or virtualization for large lists
- keep unsupported capabilities in a facilitation prompt flow, not a broken action

## Done When

- the frontend is responsive
- key sections match the reference structure
- chat, marketplace, guest flow, and model switching work end to end
