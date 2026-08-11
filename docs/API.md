# API Reference

Base URL: `/api`

All endpoints return the envelope:

```jsonc
{ "success": true, "data": <payload> }              // 2xx
{ "success": false, "message": "…", "details": {} } // 4xx / 5xx
```

Auth is cookie-based. `POST /auth/login` and `/auth/register` set two httpOnly
cookies (`ac_access`, `ac_refresh`); send them with every subsequent request.
Protected endpoints return **401** when the session is missing, expired, or
revoked. On a 401 the client silently calls `/auth/refresh` once and retries.

Common status codes: `200` OK · `201` Created · `400` bad input · `401`
unauthenticated · `403` forbidden · `404` not found · `409` conflict · `422`
validation error · `429` rate limited · `500` server error.

**Rate limiting:** `login`, `register` and `forgot-password` allow 5 requests
per minute per IP; exceeding that returns `429`.

---

## Auth

### `POST /auth/register`
Create an account and start a session.
```json
{ "name": "Jordan Rivera", "email": "you@example.com", "password": "Password123" }
```
→ `201` `{ id, name, email }`. `409` if the email is taken.

### `POST /auth/login`
```json
{ "email": "you@example.com", "password": "Password123" }
```
→ `200` `{ id, name, email }`. `401` on wrong credentials.

### `POST /auth/logout`
Ends the current session and clears cookies. → `200 { loggedOut: true }`

### `POST /auth/refresh`
Issues a new access token from the refresh cookie. → `200 { refreshed: true }`
or `401`.

### `POST /auth/forgot-password` *(mock)*
```json
{ "email": "you@example.com" }
```
→ `200` with a generic message (logs a mock reset link server-side).

### `GET /auth/me`
Current user. → `200` `User`.

### `POST /auth/verify-email/request` *(mock)*
Issues a verification token (also logged as a mock link server-side).
→ `200 { sent: true, token }`.

### `POST /auth/verify-email/confirm`
```json
{ "token": "…" }
```
Marks the email verified. → `200 { verified: true }`. `400` if invalid/expired.

---

## Profile

### `GET /profile` → `200` `User`

### `PATCH /profile`
Any subset of:
```json
{ "name": "…", "email": "…", "phone": "+1 555 000 1234",
  "dateOfBirth": "1996-04-12T00:00:00.000Z", "avatarUrl": "https://…" }
```
→ `200` updated `User`. `409` if the new email is in use.

---

## Connected accounts

### `GET /accounts` → `200` `ConnectedAccount[]`

### `POST /accounts`
```json
{ "provider": "FACEBOOK", "providerUsername": "your_handle" }
```
`provider` ∈ `FACEBOOK | INSTAGRAM | WHATSAPP`. → `201`. `409` if already linked.

### `DELETE /accounts/:id` → `200 { removed: true }`. `404` if not found.

---

## Security

### `GET /security`
→ `200 { twoFactorEnabled, emailVerified, activeSessions }`

### `PATCH /security/password`
```json
{ "currentPassword": "…", "newPassword": "…" }
```
→ `200 { updated: true }`. `400` if the current password is wrong.

### `PATCH /security/two-factor`
```json
{ "enabled": true }
```
→ `200` security settings.

### `GET /security/sessions`
Active sessions, current one flagged. → `200 SessionInfo[]`

### `DELETE /security/sessions/:id`
Revoke a session. → `200 { revoked, wasCurrent }`.

### `POST /security/logout-all`
Signs out every session including the current one. → `200`.

---

## Privacy

### `GET /privacy` → `200` `Privacy`

### `PATCH /privacy`
Any subset of:
```json
{ "profileVisibility": "FRIENDS", "emailVisibility": "PRIVATE",
  "phoneVisibility": "PRIVATE", "personalizedAds": true, "dataSharing": false }
```
Visibility ∈ `PUBLIC | FRIENDS | PRIVATE`. → `200` updated `Privacy`.

---

## Activity

### `GET /activity?page=1&type=LOGIN`
`type` optional — one of the `ActivityType` values. Paginated (15/page).
```json
{ "items": ActivityItem[], "page": 1, "pageSize": 15, "total": 6, "hasMore": false }
```

---

## Devices

### `GET /devices` → `200 SessionInfo[]` (active sessions as devices)

### `DELETE /devices/:id` → `200 { removed, wasCurrent }`

---

## Overview

### `GET /dashboard`
Aggregated data for the dashboard in a single request:
```json
{
  "user": User,
  "security": { "twoFactorEnabled": true, "emailVerified": true, "score": 90 },
  "connectedAccounts": ConnectedAccount[],
  "devices": SessionInfo[],
  "recentActivity": ActivityItem[]
}
```

---

## Admin (RBAC)

### `GET /admin/users`
Admin-only. Lists every account with connected-account and session counts.
→ `200` `AdminUser[]`. **`403`** for non-admin users (enforced by `requireAdmin`).
