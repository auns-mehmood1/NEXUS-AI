# Security Checklist

## Authentication And Session Security

- [ ] Access tokens have explicit expiry
- [ ] Refresh tokens are hashed before persistence
- [ ] Refresh token rotation or revocation strategy is defined
- [ ] Guest upgrade flow prevents account takeover or duplicate imports
- [ ] Logout invalidates refresh capability for the current session

## Input And Payload Safety

- [ ] DTO validation is enforced on write endpoints
- [ ] File upload MIME types and size limits are validated
- [ ] Uploaded filenames and metadata are sanitized
- [ ] Prompt or message content is handled safely in rendered UI to avoid XSS

## Data Protection

- [ ] Secrets are kept out of source control
- [ ] Provider API keys remain server-side
- [ ] Sensitive auth fields are excluded from normal API responses
- [ ] Guest and user data are separated clearly in persistence rules

## Transport And Access Control

- [ ] Protected endpoints require valid auth where expected
- [ ] CORS policy is intentional
- [ ] Rate limiting is considered for auth, chat, and upload endpoints
- [ ] Role or ownership checks exist for private history and uploads

## Operational Safety

- [ ] Expired guest sessions are not treated as active
- [ ] Error messages do not leak secrets or stack traces in production mode
- [ ] Audit-friendly logs exist for important auth and upgrade actions
