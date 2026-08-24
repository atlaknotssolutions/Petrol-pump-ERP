# auth-service

JWT-based authentication & role-based authorization microservice built with Express + MongoDB (Mongoose).

## Features
- Register / Login with bcrypt-hashed passwords
- Access + refresh token pair (refresh tokens rotated & stored per-user, revocable)
- `authenticate` middleware — verifies JWT and loads the live user from DB
- `authorize(...roles)` and `requirePermission(...perms)` — RBAC middleware
- Joi request validation
- Centralized error handling (Mongoose errors, JWT errors, duplicate keys → normalized JSON responses)
- Winston logging (console + file)
- Graceful shutdown on SIGINT/SIGTERM

## Setup

```bash
cp .env.example .env   # edit secrets/URI as needed
npm install
npm run dev             # nodemon
# or
npm start
```

Requires a running MongoDB instance (see `MONGO_URI` in `.env`).

## API (base path `/api/v1`)

| Method | Route                        | Auth           | Description                  |
|--------|-------------------------------|----------------|-------------------------------|
| POST   | /auth/register                | Public         | Create account                |
| POST   | /auth/login                   | Public         | Login, returns token pair     |
| POST   | /auth/refresh                 | Public         | Rotate refresh → new pair     |
| POST   | /auth/logout                  | Bearer         | Revoke one refresh token      |
| POST   | /auth/logout-all              | Bearer         | Revoke all sessions           |
| GET    | /auth/me                      | Bearer         | Current user profile          |
| PATCH  | /auth/change-password         | Bearer         | Change password               |
| GET    | /users                        | admin+         | List users (paginated)        |
| PATCH  | /users/:userId/role           | superadmin     | Change a user's role          |
| PATCH  | /users/:userId/deactivate     | admin+         | Deactivate a user              |

`GET /health` — liveness check (no auth, no /api/v1 prefix).

## Notes
- Access tokens are short-lived (default 15m); refresh tokens (default 7d) are stored on the user document and rotated on every refresh, so a stolen/reused refresh token is invalidated on next legitimate use.
- Change `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` before deploying — the app refuses to boot in production without them.
