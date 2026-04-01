# Frontend Workflow

## Build Sequence

1. Extract route and panel targets from `frontend/index.html` and `frontend/screenshots/`.
2. Establish App Router route groups and layout shells.
3. Add MUI theme, typography, spacing, and shared UI primitives.
4. Build navigation and landing structure.
5. Build chat hub with model list, composer, right panel, and active model behavior.
6. Build marketplace grid, chips, sidebar filters, and token slider.
7. Add guest cache, voice-to-text, TTS, and camera snapshot flows.
8. Connect to backend contracts.
9. Run frontend checklist, then root QA/analyzer passes.

## When Backend Coordination Is Required

- auth payload changes
- guest session shape changes
- chat session/message schema changes
- uploads metadata changes
- model catalog or usage overview response changes
