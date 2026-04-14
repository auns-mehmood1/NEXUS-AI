# Full QA Regression Checklist

Master checklist for a complete QA pass on NexusAI. Use before any release.

## 1. Environment Verification

- [ ] Backend running: `curl http://localhost:8000/api/content/public` → 200
- [ ] Frontend running: `curl http://localhost:3000` → 200
- [ ] MongoDB connected (check `backend-dev.log` for connection success)
- [ ] No `.env` fallback secrets in use (verify `JWT_SECRET` is set)

---

## 2. Critical Flow Verification

### 2.1 Authentication Flow
- [ ] New user can sign up with valid credentials
- [ ] Duplicate email is rejected (409)
- [ ] User can log in and receive JWT pair
- [ ] Wrong password is rejected (401)
- [ ] `/auth/me` returns current user with valid token
- [ ] Access token accepted for all protected routes
- [ ] Logout invalidates refresh token
- [ ] Token refresh works before access token expiry
- [ ] Token refresh fails after logout

### 2.2 Chat Flow (Authenticated)
- [ ] Create session and send first message
- [ ] AI response is returned in message
- [ ] Session appears in `/chat/history`
- [ ] Can delete own session
- [ ] Cannot delete another user's session (403)

### 2.3 Guest Chat Flow
- [ ] Guest can create session without authentication
- [ ] Guest can send messages
- [ ] Guest session expires after 3 hours (403 returned)
- [ ] Guest can sign up and migrate sessions
- [ ] Migrated sessions appear in authenticated history

### 2.4 Models Catalog
- [ ] `/api/models` returns non-empty array
- [ ] Search filter returns matching models
- [ ] Type filter works
- [ ] Price filter works
- [ ] Invalid model ID returns 404

### 2.5 Dashboard
- [ ] Authenticated user sees usage data
- [ ] Unauthenticated request → 401

---

## 3. Security Verification (Subset)

- [ ] Invalid JWT → 401 (not 500)
- [ ] Tampered JWT → 401
- [ ] NoSQL injection in login body → 400
- [ ] Access another user's session → 403
- [ ] CORS rejects unknown origin

---

## 4. Error Handling Verification

- [ ] All 4xx errors return structured JSON: `{ statusCode, message, error }`
- [ ] 404 on non-existent routes
- [ ] Malformed JSON body → 400
- [ ] No 500 errors on any standard negative test case
- [ ] No stack traces in response bodies

---

## 5. Data Integrity Verification

- [ ] After signup: user exists in DB (confirm with login)
- [ ] After session creation: session has correct userId or guestId
- [ ] After message send: message is persisted in session history
- [ ] After delete: session is truly gone (returns 404 on retry)
- [ ] After migration: sessions have userId set, guestId null, migrated=true

---

## 6. Performance Spot Check

- [ ] `/api/models` responds in < 200ms
- [ ] `/api/auth/login` responds in < 1000ms
- [ ] `/api/chat/history` responds in < 500ms for users with < 50 sessions
- [ ] No requests hanging for > 30s

---

## 7. Observability Spot Check

- [ ] Auth failure logged at WARN level
- [ ] DB connection logged at INFO on startup
- [ ] 4xx errors appear in logs
- [ ] 5xx errors appear in logs with stack trace
- [ ] No sensitive data (passwords, raw tokens) in logs

---

## 8. Known Open Issues (Track Before Release)

| Bug ID | Title | Severity | Status |
|--------|-------|----------|--------|
| BUG-AUTH-001 | Hardcoded JWT secrets fallback | Critical | Open |
| BUG-AUTH-002 | No rate limiting on auth endpoints | High | Open |
| BUG-CHAT-001 | String vs ObjectId comparison in deleteSession | High | Open |
| BUG-CHAT-002 | Guest message ownership not enforced | High | Open |
| BUG-DASHBOARD-001 | Hardcoded mock data in dashboard | Medium | Open |
| BUG-MODELS-001 | NaN from parseFloat not handled | Medium | Open |
| BUG-UPLOAD-001 | 50MB body limit on unauthenticated routes | Medium | Open |

---

## QA Sign-Off

| Check | Owner | Status | Date |
|-------|-------|--------|------|
| API Coverage | QA Agent | — | — |
| Security Review | QA Agent | — | — |
| Performance Baseline | QA Agent | — | — |
| Observability Audit | QA Agent | — | — |
| Regression Clean | QA Agent | — | — |
| **Final Approval** | | | |
