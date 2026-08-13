# Environment checklist

- `NEXT_PUBLIC_SITE_ORIGIN`: final BZMAGNET HTTPS origin.
- `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`: private admin auth.
- `INQUIRY_STORE_URL`, `INQUIRY_STORE_TOKEN`: private audit-safe enquiry persistence.
- `BZMAGNET_EMAIL_FROM`, `BZMAGNET_EMAIL_TO`: BZMAGNET-owned sender and recipient.
- `RATE_LIMIT_STORE_URL`, `RATE_LIMIT_STORE_TOKEN`: durable production rate limiter.

No variable may reuse an external brand's analytics, contact, storage or form endpoint.
