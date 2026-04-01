# Performance Checklist

## Frontend

- [ ] Model catalog is cached and not refetched unnecessarily
- [ ] Large model lists use pagination or virtualization
- [ ] Marketplace filters update efficiently on large datasets
- [ ] Heavy panels, charts, and modals are lazy-loaded when practical
- [ ] Route transitions feel responsive on desktop and mobile
- [ ] Browser-only APIs do not block initial render

## Backend

- [ ] Model catalog data is cache-friendly
- [ ] High-read endpoints avoid unnecessary database work
- [ ] Query patterns support provider, pricing, capability, and token filtering efficiently
- [ ] Chat persistence writes are scoped and indexed sensibly
- [ ] Upload flow avoids blocking unrelated request paths

## Cost And Token Discipline

- [ ] Provider calls are not duplicated accidentally
- [ ] Message payloads stay lean
- [ ] Usage metrics aggregation is lightweight
- [ ] Stable reference data is reused instead of recomputed repeatedly
- [ ] Status updates and reports stay concise unless deeper output is requested

## UX Performance

- [ ] The right panel stays responsive while chat updates
- [ ] Search and filter interactions remain smooth with 400+ models
- [ ] Mobile layout does not load unnecessary desktop-only UI weight
