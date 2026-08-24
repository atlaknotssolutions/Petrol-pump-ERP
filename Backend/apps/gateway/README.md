# gateway

Single entry point (`:8000`) for the esh-petrol-pump-erp microservices. Handles CORS, security headers, rate limiting, centralized JWT verification, and reverse-proxies requests to each downstream service.

## Responsibilities
- **Single entry point** — clients only ever talk to the gateway, never to individual services directly.
- **Centralized auth** — verifies the JWT access token once (`JWT_ACCESS_SECRET` must match `auth-service`'s), then forwards trusted identity via `X-User-Id` / `X-User-Email` / `X-User-Role` / `X-User-Permissions` headers so downstream services skip re-verifying JWTs. Any client-supplied versions of these headers are stripped first to prevent spoofing.
- **Public-path allowlist** — `/auth/register`, `/auth/login`, `/auth/refresh` bypass auth (see `src/config/services.js`).
- **Rate limiting** — global per-user/IP limiter on `/api/v1/*`, plus a stricter limiter on `/api/v1/auth/*` to slow brute-force attempts.
- **Reverse proxy** — routes `/api/v1/<prefix>/*` to the matching service using `http-proxy-middleware`.
- **Aggregated health check** — `GET /api/v1/health` pings every registered service's `/health` and reports overall status.

## Setup

```bash
cp .env.example .env   # point *_SERVICE_URL vars at your running services
npm install
npm run dev
```

## Route map

| Gateway path              | Forwarded to        | Auth      |
|----------------------------|----------------------|-----------|
| `/api/v1/auth/*`           | auth-service (:8001) | public paths bypass; rest need Bearer |
| `/api/v1/users/*`          | auth-service (:8001) | Bearer    |
| `/api/v1/branches/*`       | branch-service (:8002) | Bearer  |
| `/api/v1/inventory/*`      | inventory-service (:8003) | Bearer |
| `/api/v1/sales/*`          | sales-service (:8004) | Bearer   |
| `/api/v1/purchases/*`      | purchase-service (:8005) | Bearer |
| `/api/v1/analytics/*`      | analytics-service (:8006) | Bearer |
| `/api/v1/notifications/*`  | notification-service (:8007) | Bearer |
| `/api/v1/health`           | (aggregated check)   | none      |
| `/ping`                    | gateway itself        | none      |

## Adding a new service

Add an entry to `src/config/services.js` with `name`, `prefix`, `target`, `pathRewrite`, and any `public` paths — the router picks it up automatically on boot.

## Notes
- Downstream services should not be publicly reachable — only the gateway should have network access to them, since they trust the `X-User-*` headers without re-verifying the JWT.
- `PROXY_TIMEOUT_MS` controls how long the gateway waits on a downstream service before returning a 502.
