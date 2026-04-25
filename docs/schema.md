# Firestore Database Schema

This document outlines the NoSQL data modeling and hierarchy utilized within Firestore for the BudgetUK platform. All locations require a `geohash` to enable localized radius querying via `geofire-common`.

## Collections

### 1. `spots/{spotId}`
The primary public collection containing all approved, live locations.

- **name** (`string`): The display name of the spot.
- **slug** (`string`): URL-friendly unique identifier.
- **category** (`enum`): `food | housing | student-housing | coffee | workspace | gym | bars | grocery | accelerator | vc | entertainment | services`.
  - *Note: Student housing is stored within the primary `spots` collection for unified querying but is logically separated in the UI via the `student-housing` category tag.*
- **neighbourhood** (`string`): General area identifier.
- **postcodeDistrict** (`string`): e.g., "EC1".
- **city** (`string`): Constrained to `"london"`.
- **location** (`GeoPoint`): Native Firestore coordinate (latitude/longitude).
- **geohash** (`string`): Geofire indexing hash for boundary and proximity searches.
- **priceTier** (`enum`): `free | £ | ££ | £££ | ££££`.
- **approxPriceGbp** (`number`): Optional numeric approximation.
- **tags** (`string[]`): Search and filtering vectors.
  - **Work/Study Tags**: `quiet-study` (silence required), `power-outlets` (laptop charging available), `wifi` (verified connectivity), `long-hours` (8hr+ stays permitted), `meetings` (professional catch-ups), `phone-calls` (conversations allowed), `sprints` (focused team blocks).
  - **General Tags**: `[dietary, halal, veggie, vegan, student, fashion, market, historic]`.
- **googlePlaceId** (`string | null`): For mapping correlation.
- **photoUrl** (`string`): Primary visual asset (Storage link).
- **description** (`string`): Full context text block.
- **tips** (`string[]`): Array of bite-sized user tips.
- **status** (`enum`): `"live" | "pending" | "rejected"`.
- **submittedBy** (`string`): UID reference to the creator.
- **voteCount** (`number`): Upvotes aggregator.
- **createdAt** (`Timestamp`): Document creation block.
- **updatedAt** (`Timestamp`): Final modification timestamp.
- **placeData** (`object | null`): Enriched data from Google Places API, refreshed every 30 days by the `enrichAllPlaces` Cloud Function. Contains:
  - **openingHours** (`string[]`): `weekday_text` array e.g. `["Monday: 10:00 AM – 5:30 PM", ...]`.
  - **phone** (`string | null`): Formatted phone number.
  - **website** (`string | null`): Business website URL.
  - **rating** (`number | null`): Google rating (1.0–5.0).
  - **userRatingsTotal** (`number | null`): Total number of Google ratings.
  - **priceLevel** (`number | null`): 0–4 price level from Google.
  - **photoRef** (`string | null`): Photo reference for server-side proxy at `/api/places/photo?ref=...`.
  - **lastSyncedAt** (`Timestamp`): When this data was last fetched.

---

### 2. `users/{uid}`
Tracks user accounts and permission roles natively authenticated alongside Firebase Auth.

- **displayName** (`string`): Public username.
- **photoUrl** (`string`): Avatar reference.
- **role** (`enum`): `"user" | "moderator" | "admin"`.
- **createdAt** (`Timestamp`): Join date.
- **reputation** (`number`): Gamified usage value.
- **homeBorough** (`string | null`): Optional local anchoring.

---

### 3. `submissions/{submissionId}`
Draft layer carrying unreviewed entries submitted by users asynchronously, relying heavily on admin validation.

*Inherits identical property fields from `spots` structure above, implementing additionally:*
- **voters** (`string[]`): Full array tracking active local UIDs.
- **voteCount** (`number`): Sum of valid votes.
- **status** (`enum`): Defaults heavily to `"pending"`.

---

### 4. `favourites/{uid}/items/{spotId}`
Subcollection tracking locally tied personal bookmark clusters for users. Lets users pin places to custom views.

- **savedAt** (`Timestamp`): Record indexing exactly when the bookmark occurred.
- **note** (`string`, optional): A user-written string memory token tied to the save.

---

### 5. `votes/{submissionId}_{uid}`
Idempotent global validation table for community sourcing.
Relies unconditionally on a complex compound ID (`submissionId_uid`) guaranteeing one write operation maximally matching up preventing double-voting inherently by structural rules.

- **createdAt** (`Timestamp`): The precise moment the vote fired off.
