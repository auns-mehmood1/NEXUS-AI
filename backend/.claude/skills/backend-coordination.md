# Backend Coordination Skill

Use this skill when backend work affects shared contracts or cross-repo flows.

## Check Before Changing Contracts

- which frontend route or component consumes this field
- whether guest expiry math remains exact
- whether auth, chat, upload, or analytics payloads stay backward-compatible

## Shared Contract Areas

- auth payloads
- guest session payloads
- model catalog fields
- chat session and message fields
- upload metadata
- usage overview fields

## Rule

If a response shape changes, update the coordination note and make the frontend implication explicit.
