# Auth And Chat Skill

## Auth Priorities

- access token issuance
- refresh token hashing and rotation strategy
- logout and invalidation
- guest-to-user upgrade flow

## Chat Priorities

- session creation for guest and signed-in users
- message persistence with active model context
- idempotent upgrade of guest history into user history
