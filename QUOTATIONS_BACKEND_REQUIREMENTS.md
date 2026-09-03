# Quotation requests backend requirements

The frontend now submits customer vehicle offers through its same-origin gateway:

```text
POST /api/quotations
```

In production, Next.js forwards that request to:

```text
https://tgworld.e-saloon.online/api/quotations
```

The Laravel backend must implement the upstream endpoint. The authenticated HTTP-only `tgworld_session` cookie is the source of ownership. Never accept or trust a `userId`, username, or role supplied by the browser.

## Create a quotation

Request:

```http
POST /api/quotations
Accept: application/json
Content-Type: application/json
Cookie: tgworld_session=...
```

```json
{
  "carId": 289,
  "proposedPrice": 350000000,
  "currency": "TZS",
  "buyer": {
    "fullName": "JOHN DOE",
    "email": "john@example.com",
    "phone": "+255700000000"
  },
  "delivery": {
    "address": "123 Main Street",
    "city": "Dar es Salaam",
    "region": "Kinondoni",
    "postalCode": "14111"
  },
  "notes": "Please confirm whether financing is available."
}
```

Successful response (`201 Created`):

```json
{
  "quotation": {
    "id": 42,
    "reference": "QT-20260903-0042",
    "status": "pending",
    "carId": 289,
    "proposedPrice": 350000000,
    "currency": "TZS",
    "createdAt": "2026-09-03T10:27:38Z"
  }
}
```

The backend should load the canonical car by `carId` and snapshot important vehicle data at submission time: title, year, listed price, primary image URL, chassis, colour, mileage, fuel, and transmission. Do not trust those values from the client. A snapshot preserves what staff and customer saw even if the listing changes later.

## Database model

A `quotations` table should include:

| Column | Type / notes |
| --- | --- |
| `id` | primary key |
| `reference` | unique, human-readable |
| `customer_id` | foreign key derived from session |
| `car_id` | foreign key to cars |
| `status` | `pending`, `reviewing`, `accepted`, `countered`, `rejected`, `withdrawn`, `expired` |
| `proposed_price` | unsigned decimal/integer; never float |
| `currency` | fixed `TZS` initially |
| `full_name`, `email`, `phone` | requester snapshot |
| delivery fields | nullable strings |
| `customer_notes` | nullable text |
| `vehicle_snapshot` | JSON containing canonical car details/images |
| `staff_notes` | nullable text; never expose unless explicitly intended |
| `counter_price` | nullable decimal/integer |
| timestamps | created/updated plus optional reviewed/expired timestamps |

Index `customer_id`, `car_id`, `status`, and `created_at`. Generate references server-side inside the same transaction as insertion.

## Validation

- Require an authenticated customer.
- Confirm the car exists and remains available for quotation.
- Require `proposedPrice` to be a positive whole-number TZS amount and impose a sensible upper limit.
- Validate and normalize Tanzanian phone numbers to E.164.
- Validate email and reasonable string lengths.
- Ignore/reject unexpected ownership or status fields.
- Rate-limit creation by customer and IP.
- Prevent accidental rapid duplicate submissions using an idempotency key or a short duplicate window.

Validation failure (`422`):

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Please correct the highlighted fields.",
    "fields": { "proposedPrice": ["Enter a valid proposed price."] }
  }
}
```

## Customer profile endpoints

To display quotations beside Purchases and Favorites:

```text
GET /api/quotations
GET /api/quotations/{id}
POST /api/quotations/{id}/withdraw  body: {}
```

Every lookup must be scoped to the authenticated customer. The list should be paginated and return the vehicle snapshot, proposed/counter price, status, reference, and timestamps.

## Staff dashboard

The dashboard should list and filter requests by reference, customer, car, status, and date. Staff actions should be separate authenticated routes, for example:

```text
GET   /api/admin/quotations
GET   /api/admin/quotations/{id}
PATCH /api/admin/quotations/{id}
```

Only authorized staff may change status, add internal notes, or issue a counter price. Record those changes in an audit trail with actor and timestamp. Notify the customer when a request is received and whenever its status or counter-offer changes.

## Error contract

Use the existing envelope:

```json
{ "error": { "code": "CAR_NOT_AVAILABLE", "message": "This vehicle is no longer available.", "fields": {} } }
```

Recommended statuses/codes:

- `401 UNAUTHENTICATED`
- `403 INVALID_ORIGIN`
- `404 CAR_NOT_FOUND` or `QUOTATION_NOT_FOUND`
- `409 CAR_NOT_AVAILABLE` or `DUPLICATE_QUOTATION`
- `422 VALIDATION_FAILED`
- `429 RATE_LIMITED`
- `500 QUOTATION_CREATE_FAILED`

Do not expose database exception text. Log a request/correlation ID server-side and return it safely for support.

## Deployment verification

1. Submit as an authenticated customer and expect `201` plus a reference.
2. Confirm the row belongs to the session customer without a client user ID.
3. Confirm the canonical vehicle snapshot and images were stored.
4. Confirm it appears immediately in the staff dashboard.
5. Confirm another customer cannot read or withdraw it.
6. Confirm unauthenticated creation returns structured `401`.
7. Confirm invalid/missing cars and prices return the documented errors.
8. Confirm credentialed CORS permits `https://tgworldtz.com` and any active `www` hostname.
9. Confirm logs and responses never contain passwords or session cookie values.
