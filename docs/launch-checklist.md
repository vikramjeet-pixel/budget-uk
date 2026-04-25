# BudgetUK — Production Launch Checklist

Work through every section top to bottom. Check items off only after they are verified, not just set. Items marked **BLOCKING** will cause a broken or insecure production experience if skipped.

---

## 1. Environment Variables

All variables must be set in **Vercel → Project → Settings → Environment Variables** for the `production` environment. Do not rely on `.env.local` — that file is gitignored and never reaches Vercel.

### Next.js App (set in Vercel)

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your apps → Web app | Public — browser-safe |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same | e.g. `budgetuk.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same | e.g. `budgetuk` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same | e.g. `budgetuk.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same | |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA Admin → Site key | reCAPTCHA v3 key; public |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics → Data stream | e.g. `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SITE_URL` | — | `https://budgetuk.io` (no trailing slash) |
| `FIREBASE_SERVICE_ACCOUNT_B64` | Service account JSON → base64 | **Secret** — see `docs/firebase-setup.md` for encoding steps |
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console → APIs & Services → Credentials | **Secret** — server-only; restrict to your Vercel IPs or use allowed referrers |
| `GOOGLE_MAPS_API_KEY` | Same project, separate key (or same) | **Secret** — used by geocode API route |
| `TFL_APP_KEY` | TfL Unified API → My apps | **Secret** — increases rate-limit from 50 to 500 req/min |

- [ ] All 13 variables are set in Vercel production environment
- [ ] `FIREBASE_SERVICE_ACCOUNT_B64` is confirmed base64-encoded (not raw JSON)
- [ ] `GOOGLE_PLACES_API_KEY` has HTTP referrer or IP restrictions applied in GCP Console
- [ ] `GOOGLE_MAPS_API_KEY` has HTTP referrer restrictions applied
- [ ] Vercel preview environments have their own test-project values (not production Firebase)

### Cloud Functions (Firebase Secret Manager)

The `enrichPlaces` and manual-sync functions use Firebase Secret Manager via `defineSecret`. These must be provisioned before deploying functions.

```bash
firebase functions:secrets:set GOOGLE_PLACES_API_KEY
```

- [ ] `GOOGLE_PLACES_API_KEY` secret created in Firebase Secret Manager
- [ ] Functions have the secret listed under `secrets: [GOOGLE_PLACES_API_KEY]` (already in code)
- [ ] Secret version is active: `firebase functions:secrets:access GOOGLE_PLACES_API_KEY`

---

## 2. Firebase — Firestore

### Rules

- [ ] Rules deployed: `firebase deploy --only firestore:rules`
- [ ] Rules file is the version from this repo (includes `request.app != null` on all write paths)
- [ ] Emulator tests pass: `firebase emulators:start` then run the test suite in `functions/src/__tests__/`

### Emulator smoke test (run locally before deploy)

```bash
firebase emulators:start --only firestore,auth,storage
```

Manual checks:
- [ ] Unauthenticated write to `/submissions` is rejected (403)
- [ ] Authenticated write without App Check token is rejected when rules enforce `request.app != null`
- [ ] Moderator can write to `/spots`; regular user cannot
- [ ] User cannot update `voteCount` or `status` on their own submission directly
- [ ] Vote composite key `{submissionId}_{uid}` enforced — mismatched UID rejected
- [ ] Write to `/rateLimits` from client SDK is rejected (server-only collection)
- [ ] Write to `/leaderboard` from client SDK is rejected

### Indexes

- [ ] All required composite indexes are deployed: `firebase deploy --only firestore:indexes`
- [ ] No index errors appear in Firebase Console → Firestore → Indexes during first real traffic

### Region

- [ ] Firestore database is in `europe-west2` (London) — visible in Firebase Console → Firestore → Usage

---

## 3. Firebase — Cloud Storage

### Rules

- [ ] Rules deployed: `firebase deploy --only storage`
- [ ] Emulator test: unauthenticated upload to `/avatars/` is rejected
- [ ] Emulator test: user cannot upload to another user's avatar path
- [ ] Emulator test: image > 1 MB rejected for avatars, > 3 MB rejected for submissions
- [ ] Emulator test: non-image MIME type rejected

---

## 4. Firebase — Cloud Functions

### Deployment

```bash
cd functions && npm run build
firebase deploy --only functions
```

- [ ] All three function codebases deploy without error:
  - `onSubmissionUpdated` (Firestore trigger)
  - `autoRejectStale` (scheduler — every 24h UTC)
  - `aggregateLeaderboard` (scheduler — 03:00 Europe/London)
  - `enrichPlaces` (scheduler — 04:00 Europe/London)

### Region

Functions currently use the default region (`us-central1`) unless explicitly set. To deploy to `europe-west2`:

Add to each `onSchedule` / `onDocumentUpdated` options object:
```ts
{ region: "europe-west2", schedule: "...", ... }
```

- [ ] **BLOCKING** `region: "europe-west2"` added to all four function exports before deploy
- [ ] Functions appear under `europe-west2` in Firebase Console → Functions

### Verify schedulers run

- [ ] After deploy, manually trigger `enrichPlaces` via Firebase Console → Functions → Run to confirm Places API key works
- [ ] Check logs: Firebase Console → Functions → Logs — no `PERMISSION_DENIED` or `UNAUTHENTICATED` errors

---

## 5. Firebase — App Check

App Check blocks non-browser clients from writing to Firestore/Storage/Functions directly.

### Setup

- [ ] App Check is enabled in Firebase Console → App Check
- [ ] Web app is registered with **reCAPTCHA v3** provider
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` matches the key registered in App Check
- [ ] **BLOCKING** App Check is set to **Enforce mode** (not Monitor) for:
  - [ ] Cloud Firestore
  - [ ] Cloud Storage
  - [ ] Cloud Functions (if any are callable from the client)
- [ ] Debug token added for local development: `FIREBASE_APPCHECK_DEBUG_TOKEN=true` in browser console, then copy generated token to Firebase Console → App Check → Apps → Manage debug tokens

### Verify

- [ ] Open browser DevTools → Network. Submit a spot. Confirm `X-Firebase-AppCheck` header is present on the `/api/community/submit` request
- [ ] Remove the header manually (via proxy or modified request) and confirm the server returns `403 App Check verification failed`

---

## 6. reCAPTCHA

- [ ] reCAPTCHA v3 site key created at [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
- [ ] Allowed domains include `budgetuk.io` and `www.budgetuk.io` (not `localhost` in production key)
- [ ] A separate dev/staging reCAPTCHA key exists for non-production environments
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` set in Vercel to production key

---

## 7. Google Analytics & Cookie Consent

- [ ] GA4 measurement stream created for `budgetuk.io`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` set in Vercel
- [ ] Cookie consent banner appears on first visit for users in UK/EU (GDPR)
- [ ] Accepting consent → GA fires events (confirm in GA4 DebugView)
- [ ] Rejecting consent → no GA network requests made (check DevTools → Network, filter `google-analytics`)
- [ ] `gtag('consent', 'update', ...)` is called on accept/reject
- [ ] Banner does not appear again after choice is stored in localStorage

---

## 8. Sitemap & Robots

- [ ] `https://budgetuk.io/sitemap.xml` returns valid XML with all static pages listed
- [ ] Dynamic spot URLs appear in sitemap (requires at least one live spot in Firestore)
- [ ] `https://budgetuk.io/robots.txt` disallows `/admin/*`, `/account/*`, `/api/*`, `/moderator/*`
- [ ] Submit sitemap to Google Search Console: Search Console → Sitemaps → `sitemap.xml`
- [ ] Submit sitemap to Bing Webmaster Tools

---

## 9. OpenGraph & Social Sharing

No global OG image (`public/og-image.png`) currently exists. This must be created before launch.

- [ ] **BLOCKING** Create `public/og-image.png` — 1200×630px, BudgetUK brand. Add to `layout.tsx` metadata:
  ```ts
  openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630 }] }
  twitter:  { images: ["/og-image.png"] }
  ```
- [ ] Spot detail pages show spot photo as OG image (already wired in `generateMetadata`)
- [ ] Test with [opengraph.xyz](https://www.opengraph.xyz) — paste `https://budgetuk.io`
- [ ] Test spot page: `https://budgetuk.io/london/<neighbourhood>/<slug>`
- [ ] Test diet tab: `https://budgetuk.io/diet?tab=vegan`
- [ ] Twitter Card Validator: [https://cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
- [ ] Facebook Sharing Debugger: [https://developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)

---

## 10. Lighthouse Scores

Run Lighthouse in **incognito**, desktop and mobile, on production URL (not localhost).

```
Target: Performance ≥ 90 | Accessibility ≥ 95 | SEO ≥ 95 | Best Practices ≥ 95
```

Pages to test:

| Page | Desktop P / A / S / BP | Mobile P / A / S / BP |
|---|---|---|
| `/` (home map) | — | — |
| `/spots` | — | — |
| `/london/<neighbourhood>/<slug>` | — | — |
| `/free` | — | — |
| `/student` | — | — |
| `/community` | — | — |
| `/diet?tab=halal` | — | — |

Common issues to pre-fix:
- [ ] All `<img>` tags without explicit `width` and `height` (layout shift)
- [ ] All `<Image>` components have `priority` on above-the-fold images
- [ ] All interactive elements have accessible labels (`aria-label` on icon buttons)
- [ ] Color contrast meets WCAG AA (verify `#5f5f5d` on `#fcfbf8` — it's borderline at 4.5:1)
- [ ] `<html lang="en">` set (already done in `layout.tsx`)
- [ ] No console errors in production build

---

## 11. 404 and 500 Pages

- [ ] **BLOCKING** `src/app/not-found.tsx` does not exist — create it:
  ```tsx
  // src/app/not-found.tsx
  import Link from "next/link";
  import { Button } from "@/components/ui/button";
  
  export default function NotFound() {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="w-60 rounded-2xl bg-[var(--hover-tint)]" style={{ height: 180 }} />
        <div className="flex flex-col gap-2 max-w-sm">
          <h1 className="t-body-lg font-semibold text-[#1c1c1c]">Page not found</h1>
          <p className="t-caption text-[#5f5f5d]">The spot or page you're looking for doesn't exist or has moved.</p>
        </div>
        <Link href="/"><Button variant="ghost">Back to map</Button></Link>
      </div>
    );
  }
  ```
- [ ] `src/app/error.tsx` exists and shows "Something's off — we've been notified" (already created)
- [ ] Visit `https://budgetuk.io/this-does-not-exist` — confirm 404 page renders correctly
- [ ] 404 page includes Header and Footer (inherits from `layout.tsx`)
- [ ] 500 page (error.tsx) is tested by temporarily throwing in a server component

---

## 12. Core User Journey Testing

Test each journey end-to-end in a clean browser profile (no cached state).

### Sign Up
- [ ] Navigate to `/signup`
- [ ] Create account with email + password
- [ ] Verify redirect to home after signup
- [ ] Confirm user doc created in Firestore `users/{uid}` with `role: "user"`

### Sign In / Sign Out
- [ ] Sign in with existing email + password
- [ ] Sign in with Google OAuth
- [ ] Sign out — auth state clears, protected pages redirect to `/login`

### Submit a Spot
- [ ] Navigate to `/community/add` (requires auth — confirm redirect if unauthenticated)
- [ ] Fill form, submit
- [ ] Submission appears in Firestore `submissions` with `status: "pending"`
- [ ] Rate limit: submit 3 times → 4th attempt returns `429` with retry message
- [ ] Spam filter: submit with a URL in description → submission is saved but flagged (`flagged: true`)

### Vote
- [ ] Find a pending submission on `/community`
- [ ] Click upvote — vote recorded, count increments
- [ ] Try voting again — `409 Already voted` error shown
- [ ] Try voting on own submission — `403` error shown
- [ ] Vote rate limit: 60 votes/hour enforced

### Save a Favourite
- [ ] On any live spot page, click the save button
- [ ] Navigate to `/account/favourites` — spot appears
- [ ] Add a note, blur field — note persisted on reload
- [ ] Remove the spot — it disappears from list

### Filter by Category / Neighbourhood
- [ ] On home page, tap a category pill — map updates, spot list filters
- [ ] Apply neighbourhood filter — results narrow correctly
- [ ] Apply price filter `free` — only free spots shown
- [ ] Clear all filters — all spots return
- [ ] "Near me" toggle — browser location prompt appears, map re-centres

---

## 13. Browser Regression

Test the complete app in each browser at mobile (375px) and desktop (1440px).

| Test | Mobile Safari (iOS) | Chrome (Android) | Firefox (desktop) |
|---|---|---|---|
| Map renders and is pannable | — | — | — |
| Spot cards load and link correctly | — | — | — |
| Drawer opens on card tap | — | — | — |
| Form submission works | — | — | — |
| Auth flow (login, signup) | — | — | — |
| Favourites save/remove | — | — | — |
| PWA install prompt appears | — | — | — |
| Offline fallback page shown | — | — | — |

Known Safari gotchas:
- [ ] Verify `position: sticky` works correctly on the filter bar (Safari stacking context bugs)
- [ ] Verify `IntersectionObserver` (used by `LiveArrivals`) works (should — iOS 12.2+)
- [ ] Verify no `document.cookie` SameSite issues with Firebase auth on Safari ITP

---

## 14. Legal Pages

- [ ] `/privacy` page is live and contains accurate data collection disclosures
- [ ] `/terms` page is live and contains community guidelines
- [ ] Both pages are linked from the `Footer` component
- [ ] Privacy policy covers: Firebase Auth data, Firestore storage, Google Analytics, Affiliate links (Trainline, UniDAYS, etc.), reCAPTCHA data processing
- [ ] Contact email `hello@budgetuk.io` is set up and receives mail (test by sending to it)
- [ ] Footer shows current year (not hardcoded)
- [ ] ICO registration completed if processing UK user data at scale

---

## 15. Contact & Support

- [ ] `hello@budgetuk.io` email alias is live and forwards to a monitored inbox
- [ ] Reply-to address set in any transactional emails (Firebase Trigger Email extension)
- [ ] Error report link in `error.tsx` pre-fills `mailto:hello@budgetuk.io?subject=Error+report&body=Error+ID:...` (already wired)
- [ ] Moderator rejection emails reference a contact address for appeals

---

## 16. PWA & Offline

- [ ] `public/manifest.json` has correct `name`, `short_name`, `start_url: "/"`, `display: "standalone"`, `theme_color`, `background_color`
- [ ] Icons at `public/icons/icon-192x192.png` and `public/icons/icon-512x512.png` are correct brand assets (not placeholder Next.js icons)
- [ ] Service worker registers correctly (check DevTools → Application → Service Workers)
- [ ] Offline fallback page shown when network is unavailable (already configured via `@ducanh2912/next-pwa`)
- [ ] PWA install prompt appears on Chrome Android after second visit

---

## 17. Performance & Infrastructure

- [ ] Vercel project region set to `London (lhr1)` to co-locate with `europe-west2` Firebase
- [ ] Vercel Analytics enabled (optional — zero config)
- [ ] ISR revalidation periods confirmed: leaderboard (1h), free spots (1h), spot detail (1h)
- [ ] `next.config.ts` `remotePatterns` updated to include Firebase Storage hostname (`storage.googleapis.com`) so `next/image` can serve spot photos
- [ ] No `console.error` or `console.warn` calls leak to production (use a logger that strips in prod)
- [ ] Vercel build succeeds with zero TypeScript errors: `npx tsc --noEmit`

---

## 18. Final Deploy Sequence

Run in this exact order:

```bash
# 1. Deploy Firestore rules + indexes
firebase deploy --only firestore

# 2. Deploy Storage rules
firebase deploy --only storage

# 3. Build + deploy Cloud Functions
cd functions && npm run build && cd ..
firebase deploy --only functions

# 4. Push app to Vercel (or merge to main)
git push origin main
```

- [ ] All four steps complete without errors
- [ ] Visit `https://budgetuk.io` — home page loads, map renders, spots appear
- [ ] Visit `https://budgetuk.io/sitemap.xml` — valid XML
- [ ] Visit `https://budgetuk.io/robots.txt` — correct disallow rules
- [ ] Firebase Console → Functions → Logs — no startup errors
- [ ] Vercel → Deployments → Production — build time and status green

---

## Post-Launch (first 24 hours)

- [ ] Monitor Firestore → Usage for unexpected read/write spikes
- [ ] Monitor Firebase Console → App Check → Metrics — verify token issuance rate is healthy
- [ ] Monitor GA4 → Realtime — confirm events flowing
- [ ] Monitor Firebase Console → Functions → Logs for `enrichPlaces` (runs at 04:00 London time)
- [ ] Check `leaderboard/alltime` and `leaderboard/{month}` docs were written by `aggregateLeaderboard`
- [ ] Spot submission → vote to threshold → check `onSubmissionUpdated` promotes spot to `spots` collection and sends notification email
