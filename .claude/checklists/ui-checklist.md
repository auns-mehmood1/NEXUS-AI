# UI Checklist

Use this checklist against the HTML reference and screenshot set.

## Global Navigation

- [ ] Navbar exposes `Chat Hub`, `Marketplace`, `Agents`, and `Discover New`
- [ ] Language selector is visible and usable
- [ ] `Sign In` action exists
- [ ] `Get Started` or `Try Free` CTA exists
- [ ] Navigation works on desktop and mobile

## Landing And Marketing

- [ ] Landing experience reflects the reference information hierarchy from `frontend/index.html`
- [ ] Featured models and guided discovery messaging are present or intentionally adapted
- [ ] Visual style stays light, modern, and production-ready

## Chat Hub

- [ ] Three-column layout exists on desktop
- [ ] Left sidebar contains a searchable model list with 400+ models
- [ ] Center column supports sending messages and seeing history
- [ ] Active model name is visible near chat meta or composer context
- [ ] Voice-to-text entry exists
- [ ] TTS output control exists where appropriate
- [ ] Camera snapshot UI exists for visual input workflow
- [ ] Right panel shows active model card
- [ ] Right panel shows usage overview
- [ ] Right panel shows graph or sparkline
- [ ] Right panel shows grouped quick actions

## Marketplace

- [ ] Model card grid exists
- [ ] Chips exist for `language`, `vision`, `code`, `image gen`, `audio`, and `open source`
- [ ] Left sidebar supports provider and pricing filtering
- [ ] Token limit slider exists and affects results
- [ ] Long lists use pagination or virtualization
- [ ] Model details are accessible from the grid

## Guest And Auth UX

- [ ] Guest can start chatting without signing in
- [ ] Guest history persists locally
- [ ] Guest history expires after exactly 3 hours
- [ ] Sign-in upgrades guest history without data loss
- [ ] Signed-in history is retrievable after refresh

## Behavioral Quality

- [ ] Model switching changes the active chat model
- [ ] Unsupported capabilities produce facilitation prompts instead of dead ends
- [ ] No dead buttons remain
- [ ] Empty, loading, and error states are intentional
- [ ] Mobile layout preserves key actions and context
