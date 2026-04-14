# Skill: Generate Test Cases

**Trigger:** `/generate-test-cases [module]`

**Description:** Generate comprehensive test cases (functional, negative, boundary, security) for NexusAI API modules. Reads source code and DTOs, then writes structured CSV files to `specs/`.

## Usage

```bash
/generate-test-cases           # Generate for all modules
/generate-test-cases auth      # Auth module only
/generate-test-cases chat      # Chat module only
/generate-test-cases models    # Models module only
/generate-test-cases dashboard # Dashboard module only
```

## What This Skill Does

1. Reads the relevant controller, service, and DTO files
2. Identifies all endpoints, input fields, validation rules, and guards
3. Generates test cases across four categories:
   - **Functional:** Valid inputs → correct output
   - **Negative:** Invalid/missing inputs → correct error
   - **Boundary:** Edge values (min/max length, zero, null, expiry boundaries)
   - **Security:** Injection, token forgery, cross-user access
4. Writes CSV files to `specs/<module>-test-cases.csv`
5. Prints a summary of generated test count per category

## CSV Output Schema

```
TestCaseID, Module, TestName, Type, Method, Endpoint, Headers, RequestBody, ExpectedStatus, ExpectedResponse, Priority
```

Example row:
```
TC-AUTH-001, auth, Valid signup with all fields, functional, POST, /api/auth/signup, "{}", "{\"name\":\"Test User\",\"email\":\"tc001@test.com\",\"password\":\"pass123\"}", 201, "{\"accessToken\":\"...\",\"refreshToken\":\"...\"}", High
```

## Priority Assignment

| Type | Default Priority |
|------|----------------|
| Security (Critical paths) | Critical |
| Functional (happy path) | High |
| Negative | High |
| Boundary | Medium |
| Security (non-critical) | Medium |

## AI Prompt Template Used

See `.claude/prompts/test-case-prompt.md` for the full structured prompt.

## Modules Covered

- `auth`: signup, login, refresh, logout, me
- `chat`: createSession, sendMessage, getHistory, deleteSession, migrateGuest
- `models`: findAll (with filters), findOne
- `dashboard`: getUsage
- `content`: getPublicContent
