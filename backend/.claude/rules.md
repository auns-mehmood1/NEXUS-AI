# Backend Local Rules

## Primary Objective

Build the NexusAI API inside the existing NestJS repo with production-oriented structure and contracts that support the planned frontend.

## Required Backend Outcomes

- NestJS modular architecture
- MongoDB and Mongoose integration
- JWT access token plus refresh token flow
- guest session support with exact 3-hour expiry
- guest-to-user history upgrade without duplication
- chat history persistence
- upload endpoints
- model catalog and provider metadata endpoints
- usage overview endpoint for the right panel
- Kimi-first provider integration through an abstraction layer

## Backend Guardrails

- controllers stay thin
- business logic lives in services
- DTO validation on mutable endpoints
- refresh tokens are hashed before storage
- expiry uses explicit timestamps
- provider adapters stay isolated
- catalog reads should be cache-friendly

## Coordination Rules

- read `/.claude/skills/workspace-coordination.md` when changing shared contracts
- do not rename fields without reflecting them in frontend coordination docs
- keep guest expiry and capability metadata consistent with root rules
