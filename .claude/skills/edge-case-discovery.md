# Skill: Edge Case Discovery

**Trigger:** `/edge-case-discovery [module]`

**Description:** Systematically discover hidden edge cases, unusual system behaviors, and stress scenarios that standard functional testing misses. Uses AI-driven analysis of the codebase to find corner conditions.

## Usage

```bash
/edge-case-discovery              # Discover across all modules
/edge-case-discovery auth         # Auth-specific edge cases
/edge-case-discovery chat         # Chat edge cases
/edge-case-discovery guest        # Guest session lifecycle edge cases
```

## Discovery Categories

### 1. Concurrency Edge Cases
- Two simultaneous signups with the same email — which one wins? Both 409?
- Concurrent `POST /chat/send` on the same session — message ordering?
- Simultaneous guest session migration from two different requests
- Token refresh called twice before first response — double token rotation?

### 2. Boundary & Limit Cases
- Password exactly 6 characters (minimum) — should pass
- Password exactly 5 characters — should fail with 400
- Name field as empty string `""` — DTO requires `@IsString()`, does empty pass?
- Email with `+` alias: `user+alias@domain.com`
- Email with subdomain: `user@mail.domain.co.uk`
- Name with Unicode/emoji: `Ü$€r 🤖`
- Message content as empty string (only attachment)
- Message with 10,000 character content
- Session with 0 messages then history call

### 3. State Machine Edge Cases
- Logout then attempt to use the same access token (still valid for 15min)
- Guest session that expires exactly at the 3-hour boundary (race condition)
- `POST /chat/migrate` with guestId that has already been migrated
- `POST /chat/migrate` with a guestId belonging to a different user's sessions
- Delete a session that was already deleted — should 404, not 500

### 4. Injection & Encoding Edge Cases
- Email: `admin@test.com' OR '1'='1`
- Name: `<script>alert(1)</script>`
- Name: `{"$gt": ""}` — NoSQL injection attempt
- Message content: `\x00\x01\x02` (binary/null bytes)
- Path param ID: `../../../etc/passwd`
- Path param ID: `507f1f77bcf86cd799439011` (valid ObjectId format but no record)
- Path param ID: `not-an-object-id` (invalid format → 400 vs 404?)

### 5. Auth Token Edge Cases
- Using an access token as a refresh token
- Using a refresh token as an access token
- JWT with `alg: none` (algorithm confusion)
- JWT with future `iat` (issued at) timestamp
- JWT with extremely far future `exp`
- Malformed JWT (missing `.` separators)
- Empty `Authorization: Bearer ` header (no token after Bearer)

### 6. Guest Session Edge Cases
- Create guest session, then authenticate — can you still use the guest session?
- Create guest session with `isGuest: false` (what guestId is returned?)
- Two requests to `POST /chat/session` with same body — creates two sessions?
- Guest session with no messages — migrate it — does it succeed?

## AI Prompt for Edge Case Discovery

```
You are a QA engineer analyzing the following NestJS controller and service code.

<paste code>

Your task:
1. Identify all edge cases NOT covered by standard happy/sad path tests
2. Focus on: concurrency, boundary values, state machine violations, 
   encoding issues, and implicit assumptions in the code
3. For each edge case:
   - Describe the scenario
   - Write the exact HTTP request to reproduce it
   - State what the expected behavior SHOULD be
   - State what the ACTUAL behavior might be (and why it's risky)
4. Rank by severity (Critical → Low)
```

## Output

Writes to `specs/<module>-edge-cases.csv` and `automation-artifacts/edge-case-report.md`.
