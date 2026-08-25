# Petrol Pump ERP

A microservices-based ERP system for petrol pump operations, built with Node.js and Express.

## Architecture

```
Client (http://localhost:5173)
        |
        v
API Gateway  (:8000)  <-- all client traffic enters here (/api/v1/...)
        |   (JWT verified + x-gateway-secret injected)
        |
        +-- auth-service         (:8001)   [implemented] — users, JWT, RBAC
        +-- branch-service       (:8002)   [implemented] — petrol pump outlet management
        +-- inventory-service    (:8003)   [placeholder]
        +-- sales-service        (:8004)   [placeholder]
        +-- purchase-service     (:8005)   [placeholder]
        +-- analytics-service    (:8006)   [placeholder]
        +-- notification-service (:8007)   [placeholder]
```

- **Gateway** — single entry point. Handles CORS, helmet, compression, rate limiting, JWT verification, and proxies requests to downstream services. Injects `x-gateway-secret` and `X-User-*` identity headers for downstream trust.
- **Auth service** — user registration, login, JWT access/refresh tokens, logout (single/all sessions), profile, password change, and admin-only user management.
- **Branch service** — full CRUD for petrol pump outlets (branches). Uses a trust model: gateway verifies JWT and forwards identity via headers; branch-service verifies the shared secret and trusts those headers.

## Tech Stack

| Layer | Tools |
|---|---|
| Runtime | Node.js, Express 4 |
| Database | MongoDB via Mongoose 8 |
| Auth | JSON Web Tokens (access + refresh), bcryptjs |
| Validation | Joi |
| Security | helmet, cors, express-rate-limit |
| Logging | winston + morgan |
| Proxying | http-proxy-middleware |
| Dev tooling | nodemon (auto-restart), ESLint |

## Project Structure

```
Backend/
└── apps/
    ├── gateway/           # API Gateway (:8000)
    │   └── src/
    │       ├── config/    # services registry, env config
    │       ├── middlewares/ # auth (JWT), rate limiter, errors
    │       ├── routes/    # health aggregator + proxy mounts
    │       └── utils/     # proxy builder, logger, helpers
    ├── auth-services/     # Auth Service (:8001)
    │   └── src/
    │       ├── controllers/
    │       ├── models/      # User model
    │       ├── routes/
    │       ├── services/
    │       ├── validations/ # Joi schemas
    │       └── middlewares/ # authenticate, authorize (RBAC)
    └── branch-service/    # Branch Service (:8002)
        └── src/
            ├── controllers/
            ├── models/      # Branch model (address, geo, hours)
            ├── routes/
            ├── services/
            ├── validations/ # Joi schemas
            └── middlewares/ # trustGateway, authorize
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally **or** an Atlas connection string

### Install & Run

```bash
# Terminal 1 - Auth Service
cd Backend/apps/auth-services
npm install
npm run dev

# Terminal 2 - Branch Service
cd Backend/apps/branch-service
npm install
npm run dev

# Terminal 3 - API Gateway
cd Backend/apps/gateway
npm install
npm run dev
```

**Start order:** `auth-service → branch-service → gateway`

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Runs with **nodemon** — watches `src/` and restarts automatically on any file change |
| `npm start` | Plain `node src/index.js` — no auto-restart (use for stable manual testing) |
| `npm run lint` | ESLint over `src/` |

Tips while running under nodemon: type `rs` + Enter in the terminal to force a manual restart, and Ctrl+C stops it cleanly.

### Verify

```bash
curl http://localhost:8000/ping                # -> 200 {"status":"ok","service":"gateway"}
curl http://localhost:8001/health              # -> 200 {"status":"ok","service":"auth-service"}
curl http://localhost:8002/health              # -> 200 {"status":"ok","service":"branch-service"}
curl http://localhost:8000/api/v1/health       # -> 503 degraded while 8003-8007 are down,
                                               #    200 ok once ALL services are up
```

## Environment Variables

Each app reads a `.env` file from its own directory (see `.env.example` style keys below — never commit real values).

**Backend/apps/gateway/.env**

```env
NODE_ENV=development
PORT=8000
CORS_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=<same secret as auth-service>
GATEWAY_SHARED_SECRET=<shared secret for downstream services>
AUTH_SERVICE_URL=http://localhost:8001
BRANCH_SERVICE_URL=http://localhost:8002
INVENTORY_SERVICE_URL=http://localhost:8003
SALES_SERVICE_URL=http://localhost:8004
PURCHASE_SERVICE_URL=http://localhost:8005
ANALYTICS_SERVICE_URL=http://localhost:8006
NOTIFICATION_SERVICE_URL=http://localhost:8007
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=300
PROXY_TIMEOUT_MS=15000
```

**Backend/apps/auth-services/.env**

```env
NODE_ENV=development
PORT=8001
MONGO_URI=mongodb://localhost:27017/auth_service
JWT_ACCESS_SECRET=<random 64+ char string>
JWT_REFRESH_SECRET=<different random 64+ char string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
```

**Backend/apps/branch-service/.env**

```env
NODE_ENV=development
PORT=8002
MONGO_URI=mongodb://localhost:27017/branch_service
CORS_ORIGIN=http://localhost:5173
GATEWAY_SHARED_SECRET=<same shared secret as gateway>
```

> **Secrets note:** `JWT_ACCESS_SECRET` must be identical in gateway + auth-service. `GATEWAY_SHARED_SECRET` must be identical in gateway + branch-service. Never commit real values.

## API Overview

Base URL: `http://localhost:8000/api/v1`

### Gateway

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/ping` | - | Gateway self-check |
| GET | `/health` | - | Aggregated health of all services |

### Authentication & Users (auth-service :8001)

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | - | name, email, password (min 8, upper+lower+digit) |
| POST | `/auth/login` | - | Returns access + refresh tokens |
| POST | `/auth/refresh` | - | Rotates both tokens |
| POST | `/auth/logout` | Bearer | Revokes one refresh session |
| POST | `/auth/logout-all` | Bearer | Revokes all sessions |
| GET | `/auth/me` | Bearer | Current user profile |
| PATCH | `/auth/change-password` | Bearer | currentPassword, newPassword |
| GET | `/users` | Bearer + admin/superadmin | Paginated user list |
| PATCH | `/users/:userId/role` | Bearer + superadmin | role: user \| admin \| superadmin |
| PATCH | `/users/:userId/deactivate` | Bearer + admin/superadmin | Disables login, kills sessions |

### Branches (branch-service :8002)

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/branches` | Bearer + admin/superadmin | Create branch (name, code, address, phone required) |
| GET | `/branches` | Bearer | Paginated list; filter: status, city, state, search |
| GET | `/branches/my` | Bearer + branch_manager/admin/superadmin | Branches assigned to logged-in manager |
| GET | `/branches/:branchId` | Bearer | Single branch by ID |
| PATCH | `/branches/:branchId` | Bearer + admin/superadmin | Partial update (name, address, phone, etc.) |
| PATCH | `/branches/:branchId/assign-manager` | Bearer + admin/superadmin | Body: { managerId } |
| PATCH | `/branches/:branchId/status` | Bearer + admin/superadmin | Body: { status: active\|inactive\|under_maintenance } |
| DELETE | `/branches/:branchId` | Bearer + superadmin | Hard-delete |

Success responses use `{ success: true, message, data }`; errors use `{ success: false, message }`.

## Testing

A ready-made Postman workspace lives in `Backend/postman/` (local only, not committed):

- Collection: `collections/erp.postman_collection.json`
- Environment: `environments/local.postman_environment.json`

Import both into Postman, select the `local` environment, and run the flow:
Register -> Login -> Get Me -> Create Branch -> List Branches -> Refresh -> Logout.

## Authentication Flow

```
POST /auth/register  or  POST /auth/login
         |
         v
   { accessToken, refreshToken }
         |
    +----+----+
    |         |
    v         v
 Bearer    Refresh
 header    token
    |         |
    v         v
 Protected  POST /auth/refresh
 endpoint   (rotates both)
```

- **Access token** (15m default): sent as `Authorization: Bearer <token>` header. Gateway verifies locally before proxying.
- **Refresh token** (7d default): sent in request body for `/auth/refresh` and `/auth/logout`. Stored server-side; supports rotation and revocation.
- **Downstream trust**: gateway injects `X-User-Id`, `X-User-Email`, `X-User-Role`, `X-User-Permissions` headers + `x-gateway-secret`. Branch-service trusts these headers instead of verifying JWT itself.

## Test Results

| Date & Time (IST) | Request | Endpoint | Status | Result |
|---|---|---|---|---|
| 2026-08-25 16:23 | GET | `/ping` | 200 | PASS |
| 2026-08-25 16:26 | GET | `/api/v1/health` | 503 | PASS |
| 2026-08-25 16:30 | POST | `/api/v1/auth/register` | 201 | PASS |
| 2026-08-25 16:31 | POST | `/api/v1/auth/login` | 200 | PASS |
| 2026-08-25 16:32 | GET | `/api/v1/auth/me` | 200 | PASS |
| 2026-08-25 16:35 | GET | `/api/v1/auth/me` | 200 | PASS |
| 2026-08-25 16:44 | GET | `/api/v1/users` | 200 | PASS |
| 2026-08-25 16:48 | PATCH | `/api/v1/users/:userId/role` | 200 | PASS |
| 2026-08-25 16:50 | POST | `/api/v1/branches` | 400 | FAIL |
| 2026-08-25 16:52 | POST | `/api/v1/branches` | 201 | PASS |
| 2026-08-25 16:54 | GET | `/api/v1/branches` | 400 | FAIL |
| 2026-08-25 16:56 | GET | `/api/v1/branches` | 200 | PASS |
| 2026-08-25 16:57 | GET | `/api/v1/branches/my` | 200 | PASS |
| 2026-08-25 17:01 | PATCH | `/api/v1/branches/:branchId/assign-manager` | 200 | PASS |
| 2026-08-25 17:02 | GET | `/api/v1/branches/my` | 200 | PASS |
| 2026-08-25 17:03 | GET | `/api/v1/branches/:branchId` | 200 | PASS |
| 2026-08-25 17:04 | PATCH | `/api/v1/branches/:branchId` | 200 | PASS |
| 2026-08-25 17:05 | PATCH | `/api/v1/branches/:branchId/status` | 200 | PASS |
| 2026-08-25 17:06 | POST | `/api/v1/auth/refresh` | 200 | PASS |
| 2026-08-25 17:07 | PATCH | `/api/v1/auth/change-password` | 200 | PASS |
| 2026-08-25 17:08 | POST | `/api/v1/auth/logout` | 200 | PASS |
| 2026-08-25 17:09 | POST | `/api/v1/auth/logout-all` | 401 | FAIL |
| 2026-08-25 17:10 | POST | `/api/v1/auth/login` | 200 | PASS |
| 2026-08-25 17:11 | POST | `/api/v1/auth/logout-all` | 200 | PASS |

## Roadmap

- [x] Branch service (:8002)
- [ ] Inventory service (:8003)
- [ ] Sales service (:8004)
- [ ] Purchase service (:8005)
- [ ] Analytics service (:8006)
- [ ] Notification service (:8007)
