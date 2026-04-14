# AI Prompt: Edge Case Discovery

Use these prompts to discover hidden edge cases, unusual behaviors, and stress scenarios in NexusAI.

---

## Prompt 5.3A — Comprehensive Edge Case Discovery

```
You are an expert QA engineer specializing in finding hidden edge cases that standard
functional testing misses.

Here is the source code for a NestJS module:
<PASTE CONTROLLER + SERVICE + SCHEMA CODE>

Your mission: Find edge cases in these categories:

1. **Concurrency:**
   - What happens if two identical requests arrive simultaneously?
   - What if the same resource is modified by two users at the same time?
   - Are there any TOCTOU (time-of-check-time-of-use) race conditions?

2. **State Transitions:**
   - What are all the valid states this entity can be in?
   - Are there invalid state transitions that the code allows?
   - What happens when an operation is performed on an entity in an unexpected state?

3. **Implicit Assumptions:**
   - What does the code assume about input that it doesn't validate?
   - What does it assume about the database state?
   - What does it assume about the calling context?

4. **Boundary Values:**
   - What happens at exactly the boundary of each numeric/string constraint?
   - What happens with empty collections, zero counts, null references?

5. **Error Recovery:**
   - What happens if a downstream call (DB, AI provider) fails halfway through?
   - Does the system leave data in an inconsistent state?

For each edge case:
- Describe the scenario in one sentence
- Provide the exact HTTP request(s) to trigger it
- State your hypothesis of what ACTUALLY happens (and why it's a bug)
- State what SHOULD happen
- Severity: Critical / High / Medium / Low
```

---

## Prompt 5.3B — Guest Session Edge Cases (NexusAI Specific)

```
NexusAI has a guest session system where unauthenticated users can chat for 3 hours,
then upgrade to a permanent account. The session has these fields:
- userId: null for guests
- guestId: UUID assigned to guest
- expiresAt: 3 hours from creation
- migrated: false initially

Here is the relevant service code:
<PASTE chat.service.ts CODE>

Find edge cases specifically in the guest session lifecycle:

1. What happens when a guest session expires exactly at the boundary (expiresAt == now)?
2. What if two migration requests arrive simultaneously for the same guestId?
3. What if the user account is deleted after the guest session is migrated?
4. What if `guestId` in the request body doesn't match the session's `guestId`?
5. What if `isGuest: true` is sent by an authenticated user?
6. Can a guest session ID be reused after migration (migrated=true)?
7. What happens when a guest tries to view chat history (requires JWT)?
8. If MongoDB TTL index deletes the expired session, what does sendMessage return?

For each case: scenario, HTTP request, actual behavior, expected behavior.
```

---

## Prompt 5.3C — Stress & Unusual System Behaviors

```
You are stress-testing a NestJS + MongoDB production system under unusual conditions.

System: NexusAI API at http://localhost:8000/api
Typical load: 100 concurrent users

Simulate and analyze these unusual conditions:

1. **Memory pressure:** What happens when MongoDB returns very large session documents?
   (Session with 1000 messages, each message 10KB)
   - Test: POST /chat/send with a session that has 1000 prior messages
   - What is the memory impact? Any 413 or 500?

2. **Malformed ObjectIds:** What status code does each endpoint return for these ID formats?
   - /api/chat/session/notanid → ?
   - /api/chat/session/000000000000000000000000 → ?
   - /api/chat/session/507f1f77bcf86cd799439011 → ?
   - /api/models/undefined → ?

3. **Character encoding:** Test these in message content:
   - Right-to-left text: "مرحبا"
   - Emoji: "Hello 👋🏽"
   - Null byte: "test\x00injection"
   - Newlines and tabs: "line1\nline2\ttab"

4. **Large payloads:** The backend allows 50MB JSON bodies globally.
   - Send a 49MB base64 string as `content` to POST /chat/send
   - What is the response? Does it crash? What's the latency?

5. **Query parameter abuse:** For GET /api/models
   - ?maxPrice=999999999999
   - ?maxPrice=-1
   - ?search=<50,000 character string>
   - ?type=<injected value with special chars>

For each test: exact request, expected response, potential risk if handled incorrectly.
```
