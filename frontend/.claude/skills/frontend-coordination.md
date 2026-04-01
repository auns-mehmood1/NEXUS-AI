# Frontend Coordination Skill

Use this skill when frontend work depends on the root plan or backend contracts.

## Check Before Building

- required route exists in root plan
- required UI section exists in HTML/screenshots
- backend payload shape is known for the data being rendered

## Shared Contract Areas

- auth session state
- guest session id and expiry timestamp
- model catalog fields
- chat session and message fields
- uploads metadata
- usage overview fields

## Rule

If frontend needs to invent a field, stop and document it in the coordination flow before implementation spreads.
