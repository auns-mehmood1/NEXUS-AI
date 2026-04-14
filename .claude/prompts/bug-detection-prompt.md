# AI Prompt: Bug Detection & Reproduction

Use these prompts to analyze logs, test failures, and code for bugs in NexusAI.

---

## Prompt 5.2A — Bug Reproduction from Logs

```
You are a backend debugging expert. Analyze the following NestJS application log excerpt
and identify the root cause of the error.

Application context:
- NestJS 11 + MongoDB (Mongoose)
- JWT auth with JwtAuthGuard
- API prefix: /api

Log excerpt:
<PASTE LOG LINES HERE>

Your task:
1. Identify the error type and its root cause
2. Point to the specific source file and approximate line number (based on the stack trace)
3. Write the minimal HTTP request that would reproduce this error:
   - Method, URL, Headers, Body
4. Explain what the correct behavior SHOULD be
5. Suggest a code fix (show the change as a before/after diff)
6. Rate the severity: Critical / High / Medium / Low
```

---

## Prompt 5.2B — Root Cause Analysis from Test Failure

```
A test case has failed in the NexusAI API test suite. Here is the failure report:

Test: <TEST NAME>
Request: <METHOD> <ENDPOINT>
Headers: <HEADERS JSON>
Body: <BODY JSON>
Expected Status: <N>
Actual Status: <N>
Expected Response: <JSON>
Actual Response: <JSON>

Here is the relevant source code for this endpoint:
<PASTE CONTROLLER + SERVICE CODE>

Your task:
1. Identify why the request returned an unexpected status/response
2. Trace through the code logic step-by-step showing where it diverges from expected behavior
3. Classify the bug type: logic error / validation gap / authorization bug / data type mismatch / missing guard
4. Provide the exact fix
5. Are there other endpoints or code paths with the same root cause? List them.
```

---

## Prompt 5.2C — Proactive Bug Hunt (Code Review)

```
You are a security and quality engineer performing a bug hunt on this NestJS codebase.

Here is the module code:
<PASTE FULL MODULE CODE — controller, service, schema, DTOs>

Without running the code, identify all potential bugs in these categories:

1. **Logic Bugs:** Wrong conditions, off-by-one errors, incorrect comparisons
2. **Type Safety:** String vs ObjectId comparisons, undefined/null not handled
3. **Security Bugs:** Missing auth guards, injection-vulnerable queries, exposed secrets
4. **Async Bugs:** Missing await, unhandled promise rejections, race conditions
5. **Validation Gaps:** Fields accepted without proper constraint, extra fields not stripped
6. **Error Handling Gaps:** Exceptions that would cause 500 instead of proper 4xx
7. **Data Integrity:** Operations that could leave data in inconsistent state

For each bug found:
- File name and approximate line
- Bug description
- Severity: Critical / High / Medium / Low
- Proof-of-concept request (if exploitable)
- Recommended fix
```

---

## Prompt 5.2D — Silent Failure Investigation

```
The following NestJS endpoint returns HTTP 200 but the data seems wrong.

Endpoint: <METHOD> <PATH>
Response received: <JSON>
Expected response: <JSON>

Here is the service code that handles this request:
<PASTE SERVICE CODE>

Investigate:
1. Why does this endpoint return 200 when the data is wrong/incomplete?
2. Is there a missing error check that lets the request "succeed" silently?
3. What would need to fail for this endpoint to return a non-200 status?
4. How can I detect this class of silent failure in automated tests?
   - What additional assertions should the test make beyond status code?
5. Suggest how to add proper error handling so the bug becomes visible.
```
