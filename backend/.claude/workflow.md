# Backend Workflow

## Build Sequence

1. Establish feature modules and shared config patterns.
2. Define schemas and DTOs for auth, guest sessions, models, chat, uploads, analytics, and providers.
3. Implement auth and guest lifecycle.
4. Implement model catalog and caching strategy.
5. Implement chat sessions, messages, and uploads.
6. Implement analytics usage overview.
7. Implement Kimi adapter and provider abstraction.
8. Run backend checklist, then root QA/analyzer passes where relevant.

## When Frontend Coordination Is Required

- auth payload shape changes
- guest session response shape changes
- model catalog response changes
- chat session/message response changes
- upload metadata changes
- usage overview response changes
