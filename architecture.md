# NexusAI Architecture Draft

This is the root architecture summary for the NexusAI build. The detailed working plan lives in `.claude/architecture-plan.md`.

## Repositories

- `frontend/`: Next.js App Router application that will host the landing page, chat hub, marketplace, agents, and discover surfaces
- `backend/`: NestJS API that will provide auth, guest sessions, model catalog, chat persistence, uploads, analytics, and provider integrations

## Product Shape

- Light modern UI based on `frontend/index.html` and `frontend/screenshots/`
- Core app shell with `Chat Hub`, `Marketplace`, `Agents`, and `Discover New`
- Three-column chat interface with model list, chat center, and right insights/actions panel
- Guest-first experience with exact 3-hour local session expiry and later upgrade to permanent account history
- Smart capability routing that generates facilitation prompts when the active model lacks image, audio, video, or vision support

## Frontend Draft

- Next.js App Router
- React 19
- MUI theme system
- Context API state domains for auth, guest session, active model, chat, and marketplace filters
- Browser integrations for voice-to-text, TTS, and camera snapshot input

## Backend Draft

- NestJS modular architecture
- MongoDB with Mongoose
- JWT auth plus refresh tokens
- Model catalog service and analytics service
- Chat persistence, uploads, and guest session upgrade flow
- AI provider abstraction with Kimi as the first adapter

## Delivery Notes

- Keep changes incremental and grouped logically.
- Cache model catalog data on both frontend and backend.
- Use pagination or virtualization for large marketplace/model lists.
- Do not treat compile success as done; the build must pass QA and analyzer loops.
