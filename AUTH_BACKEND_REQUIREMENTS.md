# Authentication backend requirements

## Current frontend state

- The public authentication page is available at `/signin`.
- It contains sign-in and account-creation forms.
- The header links to this page on desktop and mobile.
- The forms are connected to the authentication API, including shared session state, logout, validation errors, safe redirects, and password recovery.
- The frontend currently uses `NEXT_PUBLIC_API_BASE_URL`, defaulting to `https://tgworld.e-saloon.online`.

## Recommended authentication model

Use server-managed sessions in a `Secure`, `HttpOnly` cookie. This prevents frontend JavaScript from reading the credential and is safer than storing access tokens in `localStorage`.

Cookie requirements:

- Name: `tgworld_session` (or another documented name)
- Flags in production: `HttpOnly; Secure; SameSite=Lax; Path=/`
- A reasonable session lifetime, such as 7 days, with server-side revocation
- Rotate the session identifier after login and password changes
- If the frontend and API are on different sites, use `SameSite=None; Secure`, enable credentialed CORS for the exact frontend origin, and add CSRF protection

## Required endpoints

All responses should use JSON and HTTPS in production. The paths below are recommendations; different paths are acceptable if the frontend configuration is updated to match.

### `POST /api/auth/register`

Request:

```json
{
  "username": "jane",
  "email": "jane@example.com",
  "phone": "+255700000000",
  "password": "user supplied password"
}
```

Behavior:

- Normalize email, username, and phone before uniqueness checks.
- Reject duplicate email, username, or phone values.
- Hash passwords with Argon2id or bcrypt; never store plaintext passwords.
- Create the account and either establish a session immediately or require email/phone verification.

Success: `201 Created`. Return a safe user object without password fields.

### `POST /api/auth/login`

Request:

```json
{
  "usernameOrEmail": "jane@example.com",
  "password": "user supplied password"
}
```

Behavior:

- Accept either a username or email address.
- Compare password hashes using the password library's constant-time verifier.
- Establish the authenticated session cookie on success.
- Return the same generic error for an unknown account and an incorrect password.

Success: `200 OK` with a safe user object. Invalid credentials: `401 Unauthorized`.

### `GET /api/auth/me`

Read the session cookie and return the signed-in user. Return `401 Unauthorized` when the session is missing, expired, or revoked.

### `POST /api/auth/logout`

Send an empty JSON object (`{}`), revoke the current session server-side, and clear its cookie. The request body is required because the production LiteSpeed configuration rejects bodyless POST requests. Return `204 No Content` for an authenticated session.

### Password recovery

- `POST /api/auth/forgot-password` accepts an email and always returns a generic success response.
- Send a short-lived, single-use reset link without revealing whether the account exists.
- `POST /api/auth/reset-password` accepts the reset token and new password, consumes the token, and revokes existing sessions.
- The current frontend “Forgot password?” placeholder must be replaced with a real recovery route when these endpoints are ready.

## Suggested database records

### Users

- `id` — immutable primary key
- `username` — normalized and unique
- `email` — normalized and unique
- `phone` — normalized (preferably E.164) and unique if required
- `password_hash`
- `role` — for example `customer` or `admin`; never accept this from public registration
- `email_verified_at` / `phone_verified_at` as applicable
- `created_at` and `updated_at`
- optional `disabled_at`

### Sessions

- `id` or a hash of the session token
- `user_id`
- `expires_at`, `created_at`, and `last_used_at`
- optional revocation timestamp and basic device metadata

### Password reset tokens

Store only a hash of the token, its user, expiry, and consumption timestamp. Tokens should expire within 15–60 minutes.

## Validation and response format

Apply server-side validation even though the browser validates required fields. Recommended minimums:

- Username: 3–30 characters with an explicit allowed-character policy
- Email: valid format and normalized casing
- Phone: normalize to E.164 where possible
- Password: at least 10 characters; permit long passphrases and check against compromised/common passwords if feasible
- Limit request body sizes and reject unexpected fields

Use a consistent error structure so the frontend can show field and form errors:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The supplied credentials are invalid.",
    "fields": {}
  }
}
```

Never include password hashes, raw session tokens, reset tokens, or internal exception details in responses or logs.

## Security and operations checklist

- Allow CORS only from the production frontend origin and the documented local development origin; enable credentials when cookies are used.
- Protect state-changing cookie-authenticated requests against CSRF.
- Rate-limit login, registration, forgot-password, and reset-password endpoints by IP and account identifier.
- Add escalating delays or temporary lockouts without enabling account enumeration.
- Log successful and failed authentication events without logging credentials.
- Require authorization checks on every protected API endpoint; hiding frontend controls is not authorization.
- Keep signing/encryption secrets in server environment variables and rotate them safely.
- Use HTTPS, secure headers, dependency updates, database backups, and monitoring/alerts for unusual login activity.
- Add automated tests for registration, login, logout, expiry, revocation, duplicate users, invalid credentials, rate limits, and authorization failures.

## Implemented frontend integration

The frontend now:

1. Uses an authentication API client with `NEXT_PUBLIC_API_BASE_URL` and `credentials: "include"`.
2. Submits the sign-in and registration forms to the matching endpoints and normalizes valid Tanzanian local phone numbers to E.164.
3. Shows pending, validation, invalid-credential, rate-limit, and network states.
4. Loads `/api/auth/me` and renders shared signed-in state in desktop and mobile headers.
5. Uses same-origin-only redirects after authentication.
6. Provides logout, forgot-password, and reset-password UI.

Protected data must still be enforced by the backend API on every request.

## Deployment verification note

Production authentication is deployed at `https://tgworld.e-saloon.online/api/auth`. Live contract checks confirm structured `UNAUTHENTICATED` and `INVALID_CREDENTIALS` responses, plus credentialed CORS support for `https://tgworld.netlify.app`.

The authentication client always uses the same-origin Next.js `/api/auth/*` proxy. The proxy forwards requests and authentication cookies to the configured backend API. This avoids browser CORS failures and supports the canonical `https://tgworldtz.com`, the Netlify deployment domain, and local development without maintaining a separate browser CORS allowlist for every frontend hostname.

To test against a local backend instead, set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` and run the backend there; the local frontend proxy will forward to that configured address.

## Backend acceptance criteria

Authentication is ready for frontend integration when a developer can demonstrate that registration creates a securely hashed user, login sets an HttpOnly session cookie, `/me` recognizes it, logout revokes it, expired/revoked sessions fail, recovery tokens are single-use, protected endpoints enforce authorization, and the complete flow works from both the production and local frontend origins.
