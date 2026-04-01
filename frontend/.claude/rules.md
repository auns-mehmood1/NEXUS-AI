# Frontend Local Rules

## Primary Objective

Build the NexusAI UI inside the existing Next.js App Router app with a strong match to the reference HTML and screenshots.

## Required Frontend Outcomes

- light theme only
- `Chat Hub`, `Marketplace`, `Agents`, and `Discover New` available in navigation
- language selector, `Sign In`, and `Get Started` or `Try Free` CTA
- three-column chat hub on desktop
- searchable model list with 400+ models
- right panel with active model card, usage overview, graph, and quick actions
- marketplace grid with chips filters, sidebar filters, and token slider
- guest chat continuity with exact 3-hour local expiry
- active model name visible near chat meta
- facilitation prompts for unsupported image/audio/video/vision actions

## Frontend Guardrails

- do not paste the HTML reference into one giant React file
- split UI by domain and layout responsibility
- keep MUI tokens centralized
- keep client-only APIs behind client boundaries
- no dead buttons or fake final-action placeholders
- use pagination or virtualization for long lists
- keep filters and search responsive

## Coordination Rules

- read `/.claude/skills/workspace-coordination.md` when changing shared contracts
- do not assume backend fields that are not documented
- align guest expiry math with backend and root docs
