# API Checklist

## Auth

- [ ] `POST /api/v1/auth/sign-in` returns stable auth payloads
- [ ] `POST /api/v1/auth/refresh` rotates or refreshes tokens safely
- [ ] `POST /api/v1/auth/logout` invalidates the active refresh path
- [ ] `POST /api/v1/auth/upgrade-guest` merges guest history idempotently

## Guest Sessions

- [ ] `POST /api/v1/guest-sessions` creates a guest session with explicit expiry
- [ ] Expiry timestamp equals creation time plus `10800000`
- [ ] Expired guest sessions are rejected or cleaned up predictably

## Models

- [ ] `GET /api/v1/models` supports search, filter, pagination, and capability metadata
- [ ] `GET /api/v1/models/:id` returns model detail fields needed by right panel and marketplace
- [ ] `GET /api/v1/models/providers` returns provider filter data
- [ ] Capability metadata supports smart routing decisions

## Chat

- [ ] `POST /api/v1/chat/sessions` creates sessions for guest and signed-in users
- [ ] `GET /api/v1/chat/sessions/:id` returns history with active model context
- [ ] `POST /api/v1/chat/sessions/:id/messages` persists user and assistant turns
- [ ] Message payloads can include attachments metadata when needed

## Uploads

- [ ] `POST /api/v1/uploads` validates file type and size
- [ ] Upload responses include stable metadata for chat attachments

## Analytics

- [ ] `GET /api/v1/analytics/usage-overview` returns requests, latency, and cost data
- [ ] Right-panel analytics contract is lightweight and consistent

## API Quality

- [ ] DTO validation exists for mutable endpoints
- [ ] Error responses are consistent and documented
- [ ] Auth-required endpoints reject unauthorized access correctly
- [ ] Catalog endpoints are cache-friendly
