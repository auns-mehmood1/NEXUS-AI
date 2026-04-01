# Backend Skills

Use this skill pack when building the backend.

## Skill Areas

- modular NestJS decomposition
  - keep auth, guest, models, chat, uploads, analytics, and providers isolated by feature
- schema design
  - represent guest expiry, active model, token usage, and chat ownership explicitly
- auth lifecycle
  - implement access tokens, refresh tokens, logout, and guest upgrade safely
- provider abstraction
  - start with Kimi but design adapter interfaces for more providers later
- chat persistence
  - store sessions and messages separately when it improves query flexibility
- upload hardening
  - validate MIME types, size limits, and ownership before processing
- analytics support
  - expose usage overview data for requests, latency, and cost summaries
- cache strategy
  - cache stable model catalog data and invalidate predictably
