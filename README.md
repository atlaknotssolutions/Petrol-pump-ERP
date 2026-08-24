# Petrol Pump ERP

A microservices-based ERP system for petrol pump operations, built with Node.js and Express.

## Architecture

```
Client (http://localhost:5173)
        |
        v
API Gateway  (:8000)  <-- all client traffic enters here (/api/v1/...)
        |
        +-- auth-service         (:8001)   [implemented]
        +-- branch-service       (:8002)   [planned]
        +-- inventory-service    (:8003)   [planned]
        +-- sales-service        (:8004)   [planned]
        +-- purchase-service     (:8005)   [planned]
        +-- analytics-service    (:8006)   [planned]
        +-- notification-service (:8007)   [planned]
```

- **Gateway** — single entry point. Handles CORS, helmet, compression, rate limiting, JWT verification, and proxies requests to downstream services.
- **Auth service** — user registration, login, JWT access/refresh tokens, logout (single/all sessions), profile, password change, and admin-only user management.

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
    └── auth-services/     # Auth Service (:8001)
        └── src/
            ├── controllers/
            ├── models/      # User model
            ├── routes/
            ├── services/
            ├── validations/ # Joi schemas
            └── middlewares/ # authenticate, authorize (RBAC)
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
npm run dev          # nodemon: auto-restarts on file changes

# Terminal 2 - API Gateway
cd Backend/apps/gateway
npm install
npm run dev          # nodemon: auto-restarts on file changes
```

Start the **auth service first**, then the gateway.

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
curl http://localhost:8000/api/v1/health       # -> 200 when ALL services are up,
                                               #    503 degraded while placeholders are down
```

## Environment Variables

Each app reads a `.env` file from its own directory (see `.env.example` style keys below — never commit real values).

**Backend/apps/gateway/.env**

```env
NODE_ENV=development
PORT=8000
CORS_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=<same secret as auth-service>
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

> The `JWT_ACCESS_SECRET` must be identical in both apps: the gateway verifies access tokens locally before proxying.

## API Overview

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/ping` | - | Gateway self-check |
| GET | `/health` | - | Aggregated health of all services |
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

Success responses use `{ success: true, message, data }`; errors use `{ success: false, message }`.

## Testing

A ready-made Postman workspace lives in `Backend/postman/` (local only, not committed):

- Collection: `collections/erp.postman_collection.json`
- Environment: `environments/local.postman_environment.json`

Import both into Postman, select the `local` environment, and run the flow:
Register → Login → Get Me → Refresh → Get Me again → Logout.

## Roadmap

- [ ] Branch service (:8002)
- [ ] Inventory service (:8003)
- [ ] Sales service (:8004)
- [ ] Purchase service (:8005)
- [ ] Analytics service (:8006)
- [ ] Notification service (:8007)
