# Favorites backend requirements

## Objective

Allow an authenticated TG World customer to save and remove favorite cars and retrieve the same favorites after signing in on another browser or device.

The frontend now uses the authenticated favorites API as its source of truth. Favorites are not read from or written to `localStorage`.

## Authentication

All favorites endpoints must use the existing `tgworld_session` cookie and the same authentication middleware as `/api/auth/me`.

- Unauthenticated requests return `401 UNAUTHENTICATED`.
- Never accept `user_id`, username, email, or role from the request body.
- Always derive the user from the authenticated server-side session.
- All browser requests use `credentials: "include"`.
- Apply the existing origin, CORS, CSRF, session-expiry, and disabled-account protections.

## Database design

Create a dedicated join table rather than placing an array on the user record.

Recommended table name: `user_favorites`.

| Column | Type | Requirements |
|---|---|---|
| `id` | bigint | Primary key |
| `user_id` | bigint | Required foreign key to the authenticated customer/user table |
| `car_id` | bigint or the exact type used by cars | Required foreign key to the canonical cars table |
| `created_at` | timestamp | Required; used for newest-first ordering |
| `updated_at` | timestamp | Optional but conventional |

Required constraints and indexes:

```text
UNIQUE (user_id, car_id)
INDEX (user_id, created_at)
INDEX (car_id)
FOREIGN KEY user_id -> users/customers.id ON DELETE CASCADE
FOREIGN KEY car_id -> cars.id ON DELETE CASCADE
```

Use the actual production customer table referenced by authentication. Do not accidentally reference an unused legacy `users` table.

If cars are not stored in the same database, omit the database foreign key for `car_id`, keep the indexed ID, and validate the car against the authoritative inventory service before insertion.

## Car ID compatibility

The frontend currently represents `Car.id` as a string, even when the API car ID is numeric. The favorites API may return numeric IDs, but the frontend will normalize them to strings for comparison.

The backend must:

- Accept a numeric car ID or a numeric string only if both safely identify the same canonical car.
- Reject malformed, empty, negative, or non-existent IDs.
- Never use car names as identifiers.
- Return the canonical car ID in every favorite response.

## Endpoint contract

The recommended base path is:

```text
${NEXT_PUBLIC_API_BASE_URL}/api/favorites
```

### List favorites

```http
GET /api/favorites
```

Return the authenticated user's favorites ordered by `created_at DESC`.

Recommended response:

```json
{
  "data": [
    {
      "carId": 289,
      "createdAt": "2026-09-03T15:30:00.000000Z"
    }
  ]
}
```

Returning IDs rather than duplicated car records keeps inventory data authoritative. The frontend already has the current car catalog and can map these IDs to cards.

If pagination is needed later, use a stable cursor rather than silently limiting the list. The initial implementation may return all favorites because a customer's list is expected to remain small.

Success: `200 OK`.

### Add a favorite

```http
POST /api/favorites
Content-Type: application/json
```

Request:

```json
{
  "carId": 289
}
```

Recommended success response:

```json
{
  "favorite": {
    "carId": 289,
    "createdAt": "2026-09-03T15:30:00.000000Z"
  }
}
```

Success: `201 Created` when newly saved.

The operation must be idempotent. Repeating the same request must not create duplicates or return a server error. A repeated request may return `200 OK` with the existing record or `201 Created` with the canonical record, provided the behavior is documented and consistent.

Enforce idempotency with the unique database constraint, not only an application-level pre-check. Handle concurrent duplicate inserts safely.

### Remove a favorite

```http
DELETE /api/favorites/289
```

Delete only the authenticated user's matching favorite.

Success: `204 No Content`.

The operation should be idempotent: return `204` even when that car was not in the user's favorites. Never reveal whether another user has favorited the car.

If LiteSpeed rejects bodyless `DELETE` requests in the production configuration, support either:

```http
DELETE /api/favorites/289
Content-Type: application/json

{}
```

or a documented POST action such as `POST /api/favorites/289/remove` with `{}`. Prefer the RESTful `DELETE` route if production accepts it.

### Optional membership endpoint

This endpoint is not required when `GET /api/favorites` returns all IDs, but it may be useful later:

```http
GET /api/favorites/289
```

```json
{
  "isFavorite": true
}
```

## Standard error format

Use the existing authentication error shape:

```json
{
  "error": {
    "code": "CAR_NOT_FOUND",
    "message": "The selected car could not be found.",
    "fields": {
      "carId": ["The selected car could not be found."]
    }
  }
}
```

Recommended errors:

| HTTP status | Code | Meaning |
|---:|---|---|
| `401` | `UNAUTHENTICATED` | Session is missing, expired, revoked, or disabled |
| `403` | `INVALID_ORIGIN` | Request origin failed existing security policy |
| `404` | `CAR_NOT_FOUND` | Canonical car does not exist |
| `422` | `VALIDATION_FAILED` | `carId` is missing or malformed |
| `429` | `RATE_LIMITED` | Request rate exceeded |
| `500` | `FAVORITE_SAVE_FAILED` | Unexpected failure adding a favorite |
| `500` | `FAVORITE_DELETE_FAILED` | Unexpected failure removing a favorite |
| `503` | `INVENTORY_UNAVAILABLE` | Authoritative inventory could not be checked |

Do not translate unrelated database exceptions into `CAR_NOT_FOUND` or duplicate-success responses. Log the original exception server-side without session cookies or sensitive customer data.

## Inventory behavior

Define and test these rules explicitly:

- Available, coming-soon, and third-party cars may be favorited if they have canonical IDs.
- A sold car may remain in favorites so the UI can show its current sold status, unless product requirements say otherwise.
- If a car is permanently deleted, cascade/delete its favorite rows or omit stale IDs from the list.
- Price, stock state, images, and promotions must always come from the live car API, not from copied values in `user_favorites`.

## Privacy and authorization

- A customer may list, add, and remove only their own favorites.
- Changing a path or request body must never allow access to another user's list.
- Do not expose aggregate favorite counts unless explicitly required.
- Do not include email, phone, session IDs, or other account data in favorites responses.
- Do not log the session cookie.
- Favoriting a car must not notify a dealer or create an order, lead, reservation, or purchase.

## Rate limiting

Apply a reasonable per-user and per-IP limit to mutation endpoints. It should prevent abuse without interfering with normal repeated clicks.

Recommended starting point:

- List: 120 requests/minute per user
- Add/remove: 60 requests/minute per user

The unique constraint remains necessary even with rate limiting.

## Transaction and concurrency requirements

- Adding the same car concurrently must result in one database row.
- Removing a favorite while another request adds it must produce a valid final state without a `500` caused by a race.
- Use transactions where needed.
- Do not use a read-then-insert sequence without also handling the unique-constraint race.

## Frontend API integration contract

After deployment, add a same-origin Next.js proxy for `/api/favorites/*`, following the existing `/api/auth/*` proxy pattern. This keeps cookies same-origin across `tgworldtz.com`, Netlify, and localhost.

Suggested client:

```ts
export type FavoriteRecord = {
  carId: number;
  createdAt: string;
};

export const favoritesApi = {
  list() {
    return apiRequest<{ data: FavoriteRecord[] }>("/api/favorites");
  },

  add(carId: string) {
    return apiRequest<{ favorite: FavoriteRecord }>("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ carId: Number(carId) }),
    });
  },

  remove(carId: string) {
    return apiRequest<void>(`/api/favorites/${encodeURIComponent(carId)}`, {
      method: "DELETE",
      body: JSON.stringify({}),
    });
  },
};
```

Every request must include:

```ts
credentials: "include"
```

## Frontend state behavior

The implemented `lib/favorites.ts` provider uses server-backed state as follows:

1. Fetch the list after `/api/auth/me` identifies the user.
2. Store favorite IDs in shared client state.
3. Show a stable loading state until the initial favorite list resolves.
4. Add/remove optimistically for immediate button feedback.
5. Roll back the optimistic change when the request fails.
6. Prevent or coalesce repeated clicks while a car mutation is pending.
7. Clear favorites state immediately on logout.
8. Re-fetch after login and when the window regains focus.
9. Treat `401 UNAUTHENTICATED` by clearing account/favorites state and sending the user to sign in when appropriate.
10. Do not silently fall back to browser-only storage after a server failure because that creates conflicting sources of truth.

The profile Favorites tab should map returned IDs to the latest car catalog. Missing IDs should be ignored in the UI but observable in application diagnostics.

## Optional migration of existing browser favorites

Existing users may already have IDs stored under:

```text
tg-world-favorites:<userId>
```

Choose one explicit launch behavior:

### Recommended: one-time merge

1. Fetch server favorites.
2. Read the current user's local IDs once.
3. POST any local IDs missing from the server list.
4. Re-fetch or reconcile the canonical list.
5. Delete the local key only after every valid ID is saved or intentionally rejected.
6. Record a separate local migration-complete marker so the merge does not repeat.

### Simpler alternative: server-only reset

Ignore and remove local favorites when server favorites launch. Use this only if losing pre-launch browser favorites is acceptable.

Never merge favorites across different authenticated user IDs.

## Backend tests

At minimum, add automated tests proving:

1. Unauthenticated list/add/remove requests return `401`.
2. A user can add an existing car and receives the canonical record.
3. Adding the same car twice creates exactly one row.
4. Concurrent duplicate adds create exactly one row and do not return `500`.
5. Invalid and missing IDs return field-specific `422` errors.
6. A non-existent car returns `404 CAR_NOT_FOUND`.
7. A user can list only their own favorites.
8. One user cannot delete another user's favorite.
9. Removing an existing favorite returns `204`.
10. Removing a missing favorite is idempotent.
11. Deleting a user removes their favorites.
12. Deleting a car removes or safely hides stale favorite rows.
13. Session expiration and account disablement return `401`.
14. Origin and CSRF protections work in production.
15. Unexpected database failures return the documented generic `500` error and are logged safely.

## Live deployment verification

Verify against the production API with a dedicated test customer and car:

1. Sign in and retain the HttpOnly session cookie.
2. `GET /api/favorites` returns an empty list or the account's existing list.
3. `POST /api/favorites` returns `201` for a valid car.
4. A second identical POST is idempotent and does not add a second row.
5. Refreshing and signing in from a second browser returns the saved ID.
6. `DELETE /api/favorites/{carId}` returns `204`.
7. A subsequent list no longer contains the car.
8. Logout, then confirm list/add/remove return `401`.
9. Verify the production frontend origin and canonical `https://tgworldtz.com` flow.

Do not use a real customer's account or modify production inventory during verification.

## Acceptance criteria

Favorites are ready for frontend integration when:

- The database migration is applied in production.
- All endpoints use the authenticated session user.
- Favorites survive refresh, logout/login, browsers, and devices.
- Duplicate adds and repeated removes are safe and idempotent.
- Unauthorized cross-user access is impossible.
- Deleted/stale cars are handled predictably.
- Error responses follow the shared API shape.
- Automated and live production verification pass.
