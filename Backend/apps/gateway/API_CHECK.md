# API Check Guide

Use the gateway for client requests:

```text
http://localhost:8000
```

Open three terminals and start the services in this order:

```powershell
# Terminal 1
cd apps/auth-services
npm install
npm start

# Terminal 2
cd apps/branch-service
npm install
npm start

# Terminal 3
cd apps/gateway
npm install
npm start
```

MongoDB must be reachable through `MONGO_URI`. Keep these values aligned:

```text
auth-services/.env: JWT_ACCESS_SECRET
gateway/.env:       JWT_ACCESS_SECRET
gateway/.env:       GATEWAY_SHARED_SECRET
branch-service/.env: GATEWAY_SHARED_SECRET
```

## 1. Health checks

```http
GET http://localhost:8000/ping
GET http://localhost:8000/api/v1/health
GET http://localhost:8001/health
GET http://localhost:8002/health
```

`/api/v1/health` reports the status of every configured downstream service. Inventory, sales, purchase, analytics, and notification services are currently proxy registrations only; their applications are not present in this workspace, so those entries will report `down` until their services are running.

## 2. Register and login

```http
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Password123"
}
```

```http
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Password123"
}
```

Save `data.accessToken` and `data.refreshToken` from the login response. Use the access token as:

```http
Authorization: Bearer <accessToken>
```

## 3. Auth APIs

| Method | URL                                | Auth             | Body                                       |
| ------ | ---------------------------------- | ---------------- | ------------------------------------------ |
| POST   | `/api/v1/auth/register`            | Public           | `name`, `email`, `password`                |
| POST   | `/api/v1/auth/login`               | Public           | `email`, `password`                        |
| POST   | `/api/v1/auth/refresh`             | Public           | `refreshToken`                             |
| GET    | `/api/v1/auth/me`                  | Bearer           | none                                       |
| POST   | `/api/v1/auth/logout`              | Bearer           | `refreshToken`                             |
| POST   | `/api/v1/auth/logout-all`          | Bearer           | none                                       |
| PATCH  | `/api/v1/auth/change-password`     | Bearer           | `currentPassword`, `newPassword`           |
| GET    | `/api/v1/users`                    | admin/superadmin | optional `page`, `limit`, `search`, `role` |
| PATCH  | `/api/v1/users/:userId/role`       | superadmin       | `{ "role": "admin" }`                      |
| PATCH  | `/api/v1/users/:userId/deactivate` | admin/superadmin | none                                       |

Refresh example:

```http
POST http://localhost:8000/api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

## 4. Branch APIs

All branch APIs require a Bearer access token. Create, update, assign-manager, and status changes require `admin` or `superadmin`; delete requires `superadmin`.

| Method | URL                                         | Required role                   |
| ------ | ------------------------------------------- | ------------------------------- |
| GET    | `/api/v1/branches?page=1&limit=20`          | any authenticated user          |
| GET    | `/api/v1/branches/my`                       | branch_manager/admin/superadmin |
| POST   | `/api/v1/branches`                          | admin/superadmin                |
| GET    | `/api/v1/branches/:branchId`                | any authenticated user          |
| PATCH  | `/api/v1/branches/:branchId`                | admin/superadmin                |
| PATCH  | `/api/v1/branches/:branchId/assign-manager` | admin/superadmin                |
| PATCH  | `/api/v1/branches/:branchId/status`         | admin/superadmin                |
| DELETE | `/api/v1/branches/:branchId`                | superadmin                      |

Create branch example:

```http
POST http://localhost:8000/api/v1/branches
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Main Petrol Pump",
  "code": "MAIN01",
  "address": {
    "line1": "Station Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "phone": "+91 9876543210",
  "email": "main@example.com",
  "fuelTypes": ["petrol", "diesel"]
}
```

Other branch bodies:

```json
{ "managerId": "<userId>" }
```

```json
{ "status": "active" }
```

## 5. Direct service checks

Direct branch requests need the gateway identity headers and shared secret, so normal client traffic should always use the gateway. Auth-service can be checked directly on `8001`; branch-service is intended to be checked through gateway on `8000`.

Expected first checks:

```text
200  GET  /ping
201  POST /api/v1/auth/register
200  POST /api/v1/auth/login
200  GET  /api/v1/auth/me
200  GET  /api/v1/branches
201  POST /api/v1/branches
```
