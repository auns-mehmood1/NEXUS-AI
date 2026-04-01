# Frontend Build Instructions

Use this file together with `.claude/rules.md`, `.claude/project-map.md`, `.claude/architecture-plan.md`, and `.claude/conventions.md`.

## Mission

Build the NexusAI frontend in the existing Next.js App Router repo. Do not create a parallel frontend.

## Required Stack

- Next.js App Router
- React 19
- MUI theme system
- Context API for cross-route state

## Required UX Rules

- Keep a light modern theme only.
- Base the layout and behavior on `frontend/index.html` and `frontend/screenshots/`.
- Main navigation must expose `Chat Hub`, `Marketplace`, `Agents`, and `Discover New`.
- Include a language selector, `Sign In`, and `Get Started` or `Try Free` CTA.
- Build the chat hub as a three-column layout.
- Left column: searchable model list with 400+ models.
- Center: chat stream, active model context, attachments, voice entry, and action prompts.
- Right column: active model card, usage overview, graph, and grouped quick actions.
- Marketplace must include a grid, chips filters, left sidebar filters, and token limit slider.
- Active model switching must update chat context and visible model metadata.
- Guest chat history must persist locally and expire after exactly 3 hours.
- Add voice-to-text with Web Speech API, TTS with `SpeechSynthesis`, and camera snapshot UI.
- If a model lacks image, audio, video, or vision support, show a facilitation prompt flow instead of a dead end.

## Guardrails

- No dark theme.
- No dead buttons.
- No fake toasts for final actions that should really work.
- Cache model catalog data.
- Use pagination or virtualization for long lists.
- Keep browser-only APIs in client components.
- Do not move backend business logic into the frontend.

## Suggested Ownership

Own future edits inside:

- `frontend/src/app/**`
- `frontend/src/components/**`
- `frontend/src/contexts/**`
- `frontend/src/lib/**`
- `frontend/src/services/**`
- `frontend/src/types/**`
- `frontend/public/**`

## Definition Of Done

- UI matches the reference structure closely.
- Responsive behavior is intentional.
- Every visible CTA has a working destination or action.
- Guest and signed-in flows are ready to connect to the backend contracts.

---

## ✅ Implementation Status (Phase 1 Complete)

### Setup & Run
```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev                  # http://localhost:3000
npm run build                # production build
```

### Environment Variables
| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Backend API base URL |

### Routes Built
| Path | Description | Auth |
|---|---|---|
| `/` | Landing page with stats, featured models, CTA | No |
| `/chat` | Chat Hub (3-column: models / chat / details) | Guest or user |
| `/marketplace` | Model grid + sidebar filters + chips + modal | No |
| `/discover` | New & trending model discovery | No |
| `/agents` | Agent templates + 5-step creation wizard | No |
| `/auth/login` | Login with guest migration on success | No |
| `/auth/signup` | Signup | No |
| `/dashboard` | Usage KPIs + 24h chart + top models | JWT |
| `/dashboard/history` | Paginated chat sessions | JWT |
| `/dashboard/settings` | Profile + preferences | JWT |
| `/dashboard/billing` | Plans comparison + usage | JWT |

### Guest Session Logic
- `src/lib/guest-session.ts` — all localStorage operations
- Session created on first Chat Hub visit (if not logged in)
- Key: `nexus_guest_history` in localStorage
- Expires exactly **3 hours** after `createdAt` (`+10800000ms`)
- Banner in Chat Hub shows remaining time and prompts signup
- On login: `POST /api/chat/migrate` moves guestId sessions to userId
- `clearGuestSession()` called after successful migration

### Language Selector
- In `src/components/Navbar.tsx`
- Sets `document.documentElement.dir = 'rtl'` for `AR`, `UR`
- Resets to `ltr` for all other languages

### Chat Hub Features
- Left: 200 models shown (virtualized scroll), searchable
- Center: messages, typing indicator, voice (Web Speech API), TTS, camera modal, file attach, CPANEL prompt tabs (7 categories × 6 prompts)
- Right: model card, context/rating/price/reviews grid, 24h sparkline, quick actions grouped in 3 categories
- Active model shown in input bar badge
