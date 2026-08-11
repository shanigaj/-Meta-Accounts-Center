# Accounts Center

A simplified **Meta Accounts Center** — a single, secure place to manage your
profile, connected social accounts, login sessions, security and privacy
preferences.

Built as a full-stack Next.js application with a REST API, PostgreSQL/Prisma
data layer, JWT session auth, and a responsive, theme-aware UI.

> **Demo login:** `demo@accounts.dev` / `Password123` (seeded)

---

## Tech stack

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + TypeScript                |
| Database   | PostgreSQL + Prisma ORM                             |
| Auth       | JWT (access + refresh) in httpOnly cookies          |
| Validation | Zod (shared between client forms and API)           |
| Data layer | TanStack Query (caching, loading & optimistic UI)   |
| Styling    | Tailwind CSS (custom design tokens, dark mode)      |
| Icons      | react-icons                                         |
| Passwords  | bcryptjs                                            |

---

## Getting started

### 1. Prerequisites

- Node.js 18+
- A running PostgreSQL instance (local install, or a free cloud DB such as
  Neon / Supabase)

### 2. Install

```bash
npm install
```

### 3. Configure environment

Copy the sample and adjust the values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/accounts_center?schema=public"
JWT_ACCESS_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"
ACCESS_TOKEN_TTL_MIN=15
REFRESH_TOKEN_TTL_DAYS=7
```

### 4. Set up the database

```bash
npm run db:push     # create the tables from the Prisma schema
npm run db:seed     # add the demo user + sample data
```

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000> and sign in with the demo credentials above, or
register a new account.

### Handy scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the dev server                     |
| `npm run build`   | Production build                         |
| `npm run db:push` | Sync the schema to the database          |
| `npm run db:seed` | Seed the demo user and sample data       |
| `npm run db:studio` | Open Prisma Studio to browse the data  |
| `npm run test`    | Run the unit test suite (Vitest)         |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/            # login, register, forgot-password (+ split layout)
│   ├── (app)/             # authenticated app shell + feature pages
│   └── api/               # REST route handlers
├── components/
│   ├── ui/                # reusable primitives (Button, Card, Modal, Toast…)
│   ├── shell/             # AppShell (sidebar + topbar), PageHeader
│   ├── providers.tsx      # React Query + theme + toast providers
│   └── theme.tsx          # dark-mode context + toggle
├── server/
│   ├── services/          # business logic (auth, profile, security, …)
│   └── activity.ts        # central activity logger
├── lib/                   # prisma, jwt, auth guard, cookies, http client, utils
├── schemas/               # Zod validation schemas (shared FE/BE)
├── hooks/                 # TanStack Query hooks
└── middleware.ts          # edge route protection
```

**Request flow:** `Route Handler → requireAuth (middleware/guard) → Service →
Prisma`. Route handlers stay thin; all logic lives in the service layer, so the
API is easy to test and could be lifted out of Next later.

---

## Data model

Normalized into focused tables. Sessions double as the "connected devices"
list, and every meaningful mutation writes an `ActivityLog` row.

```mermaid
erDiagram
    User ||--o| SecuritySettings : has
    User ||--o| PrivacySettings : has
    User ||--o{ ConnectedAccount : owns
    User ||--o{ Session : has
    User ||--o{ ActivityLog : records

    User {
        string id PK
        string name
        string email UK
        string phone
        datetime dateOfBirth
        string avatarUrl
        string passwordHash
        enum   role
    }
    SecuritySettings {
        string id PK
        string userId FK
        bool   twoFactorEnabled
        bool   emailVerified
    }
    PrivacySettings {
        string id PK
        string userId FK
        enum   profileVisibility
        enum   emailVisibility
        enum   phoneVisibility
        bool   personalizedAds
        bool   dataSharing
    }
    ConnectedAccount {
        string id PK
        string userId FK
        enum   provider
        string providerUsername
        datetime connectedAt
    }
    Session {
        string id PK
        string userId FK
        string refreshTokenHash
        string deviceName
        string browser
        string os
        string ipAddress
        bool   isActive
        datetime lastActiveAt
    }
    ActivityLog {
        string id PK
        string userId FK
        enum   type
        string deviceName
        string browser
        string ipAddress
        datetime createdAt
    }
```

The full schema lives in [`prisma/schema.prisma`](prisma/schema.prisma).

---

## API

Interactive **Swagger UI** is available at **`/api-docs`** while the app runs
(the raw OpenAPI spec is served at `/api/openapi.json`). See also
[`docs/API.md`](docs/API.md) for the full reference. All responses use a
consistent envelope:

```jsonc
// success
{ "success": true, "data": { /* … */ } }
// error
{ "success": false, "message": "Human readable reason", "details": { /* optional */ } }
```

| Area     | Endpoints                                                                 |
| -------- | ------------------------------------------------------------------------- |
| Auth     | `POST /api/auth/register` · `login` · `logout` · `refresh` · `forgot-password` · `verify-email/request` · `verify-email/confirm` · `GET /api/auth/me` |
| Profile  | `GET /api/profile` · `PATCH /api/profile`                                 |
| Accounts | `GET /api/accounts` · `POST /api/accounts` · `DELETE /api/accounts/:id`   |
| Security | `GET /api/security` · `PATCH .../password` · `PATCH .../two-factor` · `GET/DELETE .../sessions[/:id]` · `POST .../logout-all` |
| Privacy  | `GET /api/privacy` · `PATCH /api/privacy`                                 |
| Activity | `GET /api/activity?page=&type=`                                           |
| Devices  | `GET /api/devices` · `DELETE /api/devices/:id`                            |
| Overview | `GET /api/dashboard`                                                      |
| Admin    | `GET /api/admin/users` (ADMIN role only)                                  |

---

## Security notes

- Passwords hashed with bcrypt; never returned to the client.
- Access token (short-lived) + refresh token (long-lived), both in **httpOnly**
  cookies, so tokens are not reachable from JavaScript.
- The refresh token's secret is stored **hashed** in the DB — a database leak
  alone can't mint new sessions.
- `requireAuth` verifies the token **and** that the session is still active, so
  "sign out everywhere" takes effect immediately.
- Login and forgot-password return generic messages to avoid leaking which
  emails have accounts.
- Auth endpoints (login/register/forgot-password) are rate limited to 5 requests
  per minute per IP (in-memory; would be Redis-backed in production).
- Admin-only endpoints are gated by a `requireAdmin` guard (RBAC).

---

## Feature checklist

- [x] Register / Login / Logout / Forgot password (mock) — JWT sessions
- [x] Dashboard overview (profile, accounts, security score, activity, devices)
- [x] Profile management (name, email, phone, DOB, avatar URL)
- [x] Connected accounts (view / connect / remove mock providers)
- [x] Security center (change password, 2FA toggle, sessions, logout all)
- [x] Privacy settings (visibility + data preferences, optimistic UI)
- [x] Activity history (filter + pagination)
- [x] Device management (view details, remove session)
- [x] REST API with validation, error handling, auth middleware, status codes
- [x] Normalized PostgreSQL schema (Prisma)
- [x] Fully responsive UI with loading, empty and validation states

**Bonus included:** Dark mode · Role-based access control (admin-only users
page + `requireAdmin` guard) · Email verification (mock) · Rate limiting on auth
endpoints · Optimistic UI updates · API documentation (Swagger UI) · Unit tests
(Vitest).

---

## Testing

Unit tests cover the pure logic and the auth service (with a mocked data
layer): the user-agent parser, JWT sign/verify, password hashing, the Zod
validation schemas, and register/login success + failure paths.

```bash
npm run test
```

---

## Assumptions & trade-offs

- **Next.js Route Handlers instead of a separate Express service.** For a
  two-day scope, a single codebase ships faster. The logic is isolated in a
  service layer, so it could be extracted into a standalone API later.
- **Mock providers, 2FA, forgot-password, and IP addresses** — per the brief,
  these are simulated. The forgot-password endpoint logs a mock reset link to
  the server console.
- **Sessions serve double duty** as both "active sessions" (Security) and
  "connected devices" (Devices) — one source of truth.
- **Refresh tokens are not rotated** on each refresh to keep the stored hash
  valid; rotation-with-reissue would be the next step for production.
- **Avatar upload** is handled via an image URL field rather than file storage,
  to avoid standing up object storage for the demo.

---

## What I'd add next

Email verification with real tokens, unit/integration tests, request rate
limiting on auth endpoints, and Swagger UI served from the OpenAPI spec.
