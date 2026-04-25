# Analytics Event Taxonomy

BudgetUK uses Google Analytics 4 (GA4) via `@next/third-parties/google`. Analytics is consent-gated — no data is collected until the user accepts cookies via the `CookieConsentBanner`.

## Setup

### Environment Variable

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Set this in `.env.local`. The `<GoogleAnalytics>` component only renders when this is present.

### Consent Flow

1. On first visit, `gtag("consent", "default", { analytics_storage: "denied" })` is set.
2. The cookie consent banner appears at the bottom of the page.
3. If the user clicks **Accept**, `analytics_storage` is updated to `"granted"` and `gtag("config", GA_ID)` executes.
4. If declined, no data is collected. Preference is stored in the `buk_analytics_consent` cookie (365 days).
5. Returning visitors with a prior choice skip the banner — GA is initialised or blocked automatically.

### Key Files

| File | Purpose |
|---|---|
| `src/lib/analytics.ts` | Consent helpers + all `track*` event functions |
| `src/components/features/CookieConsentBanner.tsx` | Consent UI (cream, passive border, 12px radius) |
| `src/components/features/AffiliateLink.tsx` | Client component for tracked affiliate clicks |
| `src/app/layout.tsx` | Mounts `<GoogleAnalytics>` and `<CookieConsentBanner>` |

---

## Custom Events

### `spot_viewed`

Fired when a user opens a spot drawer (detail overlay).

| Parameter | Type | Example |
|---|---|---|
| `spotId` | `string` | `"abc123"` |
| `category` | `string` | `"food"` |
| `neighbourhood` | `string` | `"Shoreditch"` |

**Source**: `SpotDrawer.tsx` — on `useEffect` when `spot` prop changes to a non-null value.

---

### `spot_saved`

Fired when a user saves a spot to their favourites (not on unsave).

| Parameter | Type | Example |
|---|---|---|
| `spotId` | `string` | `"abc123"` |

**Source**: `SaveSpotButton.tsx` — after `toggleSave()` resolves, only when transitioning from unsaved → saved.

---

### `spot_submitted`

Fired when a user successfully submits a new spot to the community queue.

| Parameter | Type | Example |
|---|---|---|
| `spotId` | `string` | `"sub_xyz789"` (submission ID) |

**Source**: `community/add/page.tsx` — after the `/api/community/submit` call succeeds.

---

### `filter_applied`

Fired when a user toggles any filter (category, neighbourhood, borough, price, tag).

| Parameter | Type | Example |
|---|---|---|
| `type` | `string` | `"category"`, `"neighbourhood"`, `"borough"`, `"price"`, `"tag"` |
| `value` | `string` | `"food"`, `"Shoreditch"`, `"Hackney"`, `"££"`, `"halal"` |

**Sources**:
- `CategoryPills.tsx` — when a category pill is toggled
- `NeighbourhoodFilter.tsx` — when a neighbourhood or borough checkbox is toggled
- `PriceDietaryFilter.tsx` — when a price tier or dietary/student tag is toggled

---

### `search_performed`

Fired when a user types a search query on the spots grid page (debounced, fires once per distinct query).

| Parameter | Type | Example |
|---|---|---|
| `query` | `string` | `"halal brixton"` |
| `resultCount` | `number` | `12` |

**Source**: `spots/page.tsx` — in a `useEffect` after `debouncedQuery` changes. Uses a ref to avoid duplicate fires.

---

### `login`

Fired after a successful login.

| Parameter | Type | Example |
|---|---|---|
| `method` | `string` | `"email"` or `"google"` |

**Source**: `(auth)/login/page.tsx` — after `signInWithEmail` or `signInWithGoogle` resolves successfully.

---

### `signup`

Fired after a successful account creation.

| Parameter | Type | Example |
|---|---|---|
| `method` | `string` | `"email"` or `"google"` |

**Source**: `(auth)/signup/page.tsx` — after `signUpWithEmail` or `signInWithGoogle` resolves successfully.

---

### `affiliate_click`

Fired when a user clicks a sponsored/affiliate link.

| Parameter | Type | Example |
|---|---|---|
| `destination` | `string` | `"UNiDAYS"`, `"Student Beans"` |

**Source**: `AffiliateLink.tsx` — client component wrapping all affiliate `<a>` tags. Currently used on the Student London page.

---

## GA4 Recommended Events

In addition to the custom events above, GA4 automatically tracks:

- `page_view` — via the `@next/third-parties` integration (enabled after consent)
- `first_visit` / `session_start` — built-in GA4 events
- Core Web Vitals — reported by Next.js automatically

## Adding New Events

1. Add a typed `track*` function to `src/lib/analytics.ts`
2. Import and call it at the relevant interaction point
3. Document it in this file with parameter table and source file
