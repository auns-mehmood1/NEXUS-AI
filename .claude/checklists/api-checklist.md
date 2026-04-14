# API Test Coverage Checklist

Run this checklist before marking the API test suite as complete.

## Auth Module

### POST /api/auth/signup
- [ ] Valid signup (name, email, password) → 201 + accessToken + refreshToken
- [ ] Duplicate email → 409 Conflict
- [ ] Missing name → 400
- [ ] Missing email → 400
- [ ] Missing password → 400
- [ ] Invalid email format → 400
- [ ] Password shorter than 6 chars → 400
- [ ] Extra fields stripped (whitelist:true) → 201 (extra fields ignored)
- [ ] NoSQL injection in email → 400 (not 500)
- [ ] XSS in name → 201 (stored safely, not executed)

### POST /api/auth/login
- [ ] Valid credentials → 200 + token pair
- [ ] Wrong password → 401
- [ ] Non-existent email → 401
- [ ] Missing email → 400
- [ ] Missing password → 400

### GET /api/auth/me
- [ ] Valid access token → 200 + user object
- [ ] No Authorization header → 401
- [ ] Expired access token → 401
- [ ] Tampered token → 401

### POST /api/auth/refresh
- [ ] Valid refresh token → 200 + new token pair
- [ ] Expired refresh token → 401
- [ ] Invalid refresh token → 401
- [ ] After logout, old refresh token → 401

### POST /api/auth/logout
- [ ] Valid token → 200 (or 204)
- [ ] After logout, old refresh token rejected → 401
- [ ] No token → 401

---

## Chat Module

### POST /api/chat/session
- [ ] Guest session (isGuest: true) → 201 + guestId + expiresAt
- [ ] Authenticated session → 201 + sessionId (no guestId)
- [ ] No body → 400

### POST /api/chat/send
- [ ] New message (no sessionId) → auto-creates session → 200
- [ ] Message to existing session → 200 + AI response
- [ ] Message to expired guest session → 403
- [ ] Valid message → response.message.role === 'assistant'

### GET /api/chat/history
- [ ] Authenticated user → 200 + array (can be empty)
- [ ] No token → 401

### DELETE /api/chat/session/:id
- [ ] Valid own session → 200 (or 204)
- [ ] Non-existent session → 404
- [ ] Another user's session → 403
- [ ] No token → 401

### POST /api/chat/migrate
- [ ] Valid guestId → 200 + { migrated: N }
- [ ] Already migrated guestId → 200 + { migrated: 0 }
- [ ] No token → 401

---

## Models Module

### GET /api/models
- [ ] No params → 200 + array with items
- [ ] ?search=gpt → filtered results
- [ ] ?type=text → filtered results
- [ ] ?maxPrice=0.5 → filtered results
- [ ] ?maxPrice=abc → should not 500 (invalid input handled)
- [ ] ?lab=openai → filtered results

### GET /api/models/:id
- [ ] Valid model ID → 200 + model object
- [ ] Non-existent ID → 404
- [ ] Invalid format ID → 404 (not 500)

---

## Dashboard Module

### GET /api/dashboard/usage
- [ ] Valid token → 200 + usage object (totalRequests, avgLatency, etc.)
- [ ] No token → 401

---

## Content Module

### GET /api/content/public
- [ ] No auth → 200 + array
- [ ] Response is array (not null, not undefined)

---

## Cross-Cutting Concerns

- [ ] CORS allows `http://localhost:3000` origin
- [ ] CORS rejects other origins
- [ ] All protected routes return 401 without token
- [ ] Error responses follow NestJS format: `{ statusCode, message, error }`
- [ ] No stack traces exposed in production-mode error responses
- [ ] Large payloads (>1MB) on chat/send handled gracefully
