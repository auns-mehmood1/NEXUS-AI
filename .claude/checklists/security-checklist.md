# Security Test Checklist

Complete security verification for NexusAI. Run before any production deployment.

## Authentication Security

### JWT Configuration
- [ ] `JWT_SECRET` env var is set and not the fallback `nexusai-secret-change-in-prod`
- [ ] `JWT_REFRESH_SECRET` env var is set and not the fallback `nexusai-refresh-secret`
- [ ] Application throws/exits at startup if either secret is missing
- [ ] Access token expiry is 15 minutes (not longer)
- [ ] Refresh token expiry is 7 days (not longer)

### JWT Attack Resistance
- [ ] Token signed with wrong secret → 401 (not 200 or 500)
- [ ] Token with `alg: none` → 401
- [ ] Token with tampered `sub` (userId) → 401
- [ ] Token with future `iat` timestamp → 401
- [ ] Expired token → 401
- [ ] Token with no `exp` claim → 401

### Refresh Token Security
- [ ] Refresh token is hashed in DB (bcrypt, not stored plain)
- [ ] After logout, refresh token is nullified in DB
- [ ] Old refresh token rejected after rotation
- [ ] Replay attack: use previous refresh token → 401

---

## Authorization Security

### Cross-User Access Prevention
- [ ] User A cannot delete User B's chat session (403)
- [ ] User A cannot read User B's chat history (responses only include own sessions)
- [ ] Guest session: unknown sessionId cannot be used to send messages

### Route Guard Coverage
- [ ] Every route with user-specific data requires `JwtAuthGuard`
- [ ] `GET /auth/me` requires auth ✓
- [ ] `GET /chat/history` requires auth ✓
- [ ] `DELETE /chat/session/:id` requires auth ✓
- [ ] `POST /chat/migrate` requires auth ✓
- [ ] `GET /dashboard/usage` requires auth ✓

---

## Input Validation & Injection

### NoSQL Injection
- [ ] Login: `{"email": {"$gt": ""}, "password": "anything"}` → 400 (not 200)
- [ ] Signup: `{"email": {"$ne": null}}` → 400
- [ ] Chat message: `{"content": {"$where": "this.userId"}}` → stored as string literal

### XSS Prevention
- [ ] Name field with `<script>alert(1)</script>` → stored but NOT executed by API
- [ ] Chat content with HTML tags → stored as plain text

### Path Traversal
- [ ] `GET /api/models/../../../../etc/passwd` → 404 or 400 (not 500 or file read)
- [ ] `DELETE /api/chat/session/../other-id` → normalized by framework

### Large Payload Handling
- [ ] Request body > 50MB → 413 Payload Too Large
- [ ] Query string > 10,000 chars → handled without crash
- [ ] Name field > 1000 chars → 400 (if MaxLength added) or stored safely

---

## Transport Security (Production)

- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] HSTS header present: `Strict-Transport-Security`
- [ ] No sensitive data in URL parameters (passwords, tokens)
- [ ] `Authorization` header used for tokens (not cookies without SameSite)

---

## Information Disclosure

- [ ] Error messages don't reveal database structure
- [ ] Error messages don't reveal user existence (login: always "Invalid credentials")
- [ ] Stack traces not returned in API responses (production mode)
- [ ] No secrets in response headers
- [ ] No sensitive fields in JWT payload (only sub + email)

---

## Rate Limiting (Gap — Needs Implementation)

- [ ] `POST /auth/login` rate limited (e.g., 5/min per IP)
- [ ] `POST /auth/signup` rate limited (e.g., 3/min per IP)
- [ ] `POST /auth/refresh` rate limited (e.g., 10/min per IP)
- [ ] `POST /chat/send` rate limited per user

---

## CORS

- [ ] `Access-Control-Allow-Origin` only allows configured frontend URL
- [ ] Request from `https://evil.com` → CORS blocked
- [ ] Credentials mode works correctly with `credentials: true`

---

## Severity of Open Items

| Item | Current State | Severity |
|------|--------------|----------|
| Hardcoded JWT secrets | In source code fallback | Critical |
| No rate limiting | All auth endpoints unbounded | High |
| Session ownership check | String vs ObjectId comparison bug | High |
| Guest message ownership | guestId not verified on send | High |
| No startup secret validation | App starts with weak dev secrets | Critical |
