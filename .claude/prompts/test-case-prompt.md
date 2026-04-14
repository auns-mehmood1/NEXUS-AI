# AI Prompt: Test Case Generation

Use these structured prompts with any LLM (Claude, GPT-4, etc.) to generate test cases for NexusAI modules.

---

## Prompt 5.1A — Functional Test Cases

```
You are a QA engineer generating functional test cases for a NestJS REST API.

Repository context:
- Backend: NestJS 11 + MongoDB
- Auth: JWT (access 15min, refresh 7d) + bcrypt passwords
- Global prefix: /api
- Validation: NestJS ValidationPipe with whitelist:true

Here is the controller and DTO code to test:
<PASTE CONTROLLER AND DTO CODE HERE>

Generate a comprehensive list of FUNCTIONAL (happy path) test cases.

For each test case provide:
1. Test Case ID (format: TC-<MODULE>-<SEQ>, e.g. TC-AUTH-001)
2. Test Name (brief description)
3. HTTP Method
4. Endpoint (full path with /api prefix)
5. Request Headers (JSON)
6. Request Body (JSON)
7. Expected HTTP Status Code
8. Expected Response Body (key fields that must be present)
9. Priority (Critical / High / Medium / Low)

Format the output as a markdown table.
Focus on: successful creation, retrieval, update, delete operations.
Include at least one test per distinct endpoint.
```

---

## Prompt 5.1B — Negative Test Cases

```
You are a QA engineer generating negative test cases for a NestJS REST API.

Here is the controller and DTO code:
<PASTE CONTROLLER AND DTO CODE HERE>

Generate NEGATIVE test cases covering all failure scenarios.

Categories to cover:
1. Missing required fields (each field individually)
2. Wrong data types (number where string expected, etc.)
3. Invalid format (bad email, too-short password, etc.)
4. Unauthorized access (no token, wrong token, expired token)
5. Forbidden access (valid token but wrong user's resource)
6. Not found (valid format ID but no record exists)
7. Conflict (duplicate unique field like email)

For each test case provide:
- Test Case ID, Test Name, HTTP Method, Endpoint,
  Request Headers, Request Body, Expected Status Code,
  Expected Error Message (partial match OK), Priority

Format as a markdown table.
```

---

## Prompt 5.1C — Boundary Test Cases

```
You are a QA engineer generating boundary value test cases.

Here is the DTO with validation rules:
<PASTE DTO CODE HERE>

Generate BOUNDARY test cases that probe the exact edges of each constraint.

For each validated field, generate:
1. Value at exactly the minimum allowed (should pass)
2. Value at minimum - 1 (should fail)
3. Value at exactly the maximum allowed (should pass)
4. Value at maximum + 1 (should fail)
5. Null value (if not explicitly allowed, should fail)
6. Empty string (if MinLength > 0, should fail)
7. Whitespace-only string (should fail for name/email fields)

Special cases for this API:
- Password: MinLength(6) — test 5, 6, 7 characters
- Email: test with/without @, with subdomain, with + alias
- Guest session TTL: test sending at exactly 3h, 3h+1s

Format as a markdown table with: Test ID, Field, Value Tested, Expected Result, Reason.
```

---

## Prompt 5.1D — Security Test Cases

```
You are a security-focused QA engineer testing a NestJS API for vulnerabilities.

Application context:
- JWT auth (HS256) with fallback hardcoded secret
- MongoDB backend (Mongoose ODM)
- No rate limiting currently configured
- ValidationPipe with whitelist:true (extra fields stripped)

Here is the auth and chat controller code:
<PASTE CODE HERE>

Generate SECURITY test cases for the following attack categories:

1. NoSQL Injection: Test JSON payloads with MongoDB operators in string fields
   Example: {"email": {"$gt": ""}, "password": "anything"}

2. JWT Attacks:
   - Token with alg:none
   - Token signed with a different secret
   - Token with tampered userId in payload
   - Expired token reuse
   - Refresh token used as access token

3. Authorization Bypass:
   - Access another user's chat session (use their sessionId with your token)
   - Delete another user's session
   - Access protected route without any Authorization header

4. Input Validation:
   - XSS payload in name field: <script>alert(1)</script>
   - Long string attack: 10,000 character name
   - Null byte injection: name=test\x00injection

5. CORS:
   - Request with Origin: https://evil.com
   - Preflight OPTIONS with disallowed origin

For each test case:
- Attack type
- HTTP request (method, endpoint, headers, body)
- Expected response (should be 400/401/403, never 200 or 500)
- What a PASS means vs. what a FAIL (vulnerability confirmed) means
```
