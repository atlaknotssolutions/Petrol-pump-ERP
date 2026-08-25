# branch-service (:3002)

Manages petrol pump outlet (branch) records — creation, updates, manager assignment, status, listing/filtering. Sits behind the API gateway; does not verify JWTs itself.

## Auth model
This service **trusts the gateway**, not raw JWTs:
- The gateway verifies the access token and forwards identity via `X-User-Id`, `X-User-Email`, `X-User-Role`, `X-User-Permissions` headers.
- `trustGateway` middleware (`src/middlewares/auth.middleware.js`) reads those headers into `req.user`.
- If `GATEWAY_SHARED_SECRET` is set, it also requires a matching `x-gateway-secret` header (sent automatically by the gateway) — rejects any request that reached this service directly.

## Setup
```bash
cp .env.example .env   # set MONGO_URI and GATEWAY_SHARED_SECRET (must match gateway's)
npm install
npm run dev
```

## API (mounted at `/api/v1/branches` by the gateway)

| Method | Route                          | Roles                     | Description                    |
|--------|----------------------------------|----------------------------|----------------------------------|
| GET    | `/`                              | any authenticated          | List branches (paginated, filter by status/city/state/search) |
| GET    | `/my`                            | branch_manager, admin+     | Branches assigned to the current user as manager |
| POST   | `/`                               | admin, superadmin           | Create a branch                |
| GET    | `/:branchId`                     | any authenticated          | Get one branch                 |
| PATCH  | `/:branchId`                     | admin, superadmin           | Update branch details          |
| PATCH  | `/:branchId/assign-manager`      | admin, superadmin           | Assign a manager (userId)      |
| PATCH  | `/:branchId/status`              | admin, superadmin           | Set status (active/inactive/under_maintenance) |
| DELETE | `/:branchId`                     | superadmin                  | Permanently delete a branch    |

`GET /health` — liveness check (no auth).

## Notes
- `managerId` stores a `User._id` string from auth-service — this service does not join across databases; resolve the manager's name/email client-side via auth-service if needed.
- Branch `code` is unique and uppercased automatically.
