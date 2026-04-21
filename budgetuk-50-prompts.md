# BudgetUK — 50 Prompts to Build the App End-to-End

A community-curated directory of budget-friendly spots in London (and the UK), built with **Next.js 15 + TypeScript + Tailwind + Firebase (Auth, Firestore, Storage) + Google Analytics**, styled with the Lovable-inspired warm parchment design system.

Run these prompts in order. Each assumes the output of the previous step is in place. Prompts 1–3 define the design tokens so the agent can reference them for the rest of the build — from prompt 4 onwards you can say "use the established design system" when needed.

---

## Phase 1 — Foundation & Design System (1–8)

### Prompt 1 — Bootstrap the project

> Create a new Next.js 15 project called `budgetuk` using the App Router with TypeScript, Tailwind CSS v4, ESLint, and the `src/` directory enabled. Use `npm` as the package manager. Set up the following folder structure inside `src/`: `app/`, `components/ui/`, `components/features/`, `lib/`, `lib/firebase/`, `hooks/`, `types/`, `data/`, `styles/`. Initialise a git repository and commit. Also install and configure `shadcn/ui` with the neutral base colour, and install these peer deps: `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `zod`, `react-hook-form`, `@hookform/resolvers`, `date-fns`.

### Prompt 2 — Lock in the design tokens (Lovable system)

> Replace `src/styles/globals.css` with a design-token layer for the BudgetUK brand, inspired by Lovable's warm parchment aesthetic. Define CSS variables on `:root`:
>
> - `--bg-cream: #f7f4ed` (page background)
> - `--surface: #f7f4ed` (cards, same as page — seamless)
> - `--text: #1c1c1c` (charcoal, not pure black)
> - `--text-body: rgba(28,28,28,0.82)`
> - `--text-muted: #5f5f5d`
> - `--text-on-dark: #fcfbf8`
> - `--border-passive: #eceae4`
> - `--border-interactive: rgba(28,28,28,0.4)`
> - `--hover-tint: rgba(28,28,28,0.04)`
> - `--depth-tint: rgba(28,28,28,0.03)`
> - `--ring: rgba(59,130,246,0.5)`
> - `--focus-shadow: 0 4px 12px rgba(0,0,0,0.1)`
> - `--inset-dark: rgba(255,255,255,0.2) 0 0.5px 0 0 inset, rgba(0,0,0,0.2) 0 0 0 0.5px inset, rgba(0,0,0,0.05) 0 1px 2px 0`
>
> Set `body { background: var(--bg-cream); color: var(--text); }`. Extend the Tailwind theme in `tailwind.config.ts` to expose these as `bg-cream`, `text-charcoal`, `border-passive`, `border-interactive`, `shadow-focus`, `shadow-inset-dark`. Add a border radius scale: `xs: 4px`, `sm: 6px`, `md: 8px`, `lg: 12px`, `xl: 16px`, `pill: 9999px`. Spacing stays at the default 4px Tailwind scale.

### Prompt 3 — Typography with Camera Plain

> Install the Camera Plain Variable font. If it isn't available via Google Fonts, use a close alternative: `Inter Variable` with `font-feature-settings: "ss01", "cv11"` applied, as a stand-in with similar humanist character. Use `next/font/local` if self-hosting the real Camera Plain (`.woff2` files placed in `src/styles/fonts/`). Configure the font as `--font-primary` on `<html>`, with fallbacks `ui-sans-serif, system-ui, -apple-system`.
>
> Create a typography scale in `globals.css` as utility classes:
>
> - `.t-display` → 60px / weight 600 / line-height 1.0 / letter-spacing -1.5px
> - `.t-display-light` → 60px / weight 480 / line-height 1.0 / letter-spacing 0
> - `.t-h1` → 48px / weight 600 / line-height 1.0 / letter-spacing -1.2px
> - `.t-h2` → 36px / weight 600 / line-height 1.1 / letter-spacing -0.9px
> - `.t-h3` → 20px / weight 400 / line-height 1.25
> - `.t-body-lg` → 18px / weight 400 / line-height 1.38
> - `.t-body` → 16px / weight 400 / line-height 1.5
> - `.t-caption` → 14px / weight 400 / line-height 1.5
>
> Only use weights 400, 480, 600. Never use 700.

### Prompt 4 — Install and initialise Firebase

> Install `firebase` (client SDK) and `firebase-admin` (server SDK). Create `src/lib/firebase/client.ts` that initialises the Firebase app using `NEXT_PUBLIC_FIREBASE_*` env vars and exports singleton instances of `auth`, `db` (Firestore), and `storage`. Guard against re-initialisation with `getApps().length ? getApp() : initializeApp(config)`. Create `src/lib/firebase/admin.ts` for server-side code that initialises `firebase-admin` using a service-account JSON (base64-encoded in `FIREBASE_SERVICE_ACCOUNT_B64` env var) and exports `adminAuth`, `adminDb`, `adminStorage`. Also create a `.env.local.example` file documenting every required variable.

### Prompt 5 — Firebase project setup instructions

> Write `docs/firebase-setup.md` with step-by-step instructions for: creating a Firebase project in the console, enabling Firestore in native mode (region `europe-west2` for London), enabling Authentication with Email/Password and Google providers, enabling Storage, generating a service-account key, creating a web app and copying the config keys into `.env.local`, and installing the Firebase CLI with `firebase init firestore hosting functions`. Include the exact env var names from prompt 4.

### Prompt 6 — Button component system

> Create `src/components/ui/Button.tsx` using `class-variance-authority`. Implement four variants that exactly match the design system:
>
> 1. `primary` — `bg-[#1c1c1c] text-[#fcfbf8]`, border-radius 6px, padding `8px 16px`, `box-shadow: var(--inset-dark)`, `active:opacity-80`, `focus-visible:shadow-[var(--focus-shadow)]`.
> 2. `ghost` — `bg-transparent text-[#1c1c1c]`, `border: 1px solid var(--border-interactive)`, same radius/padding, same active/focus behaviour.
> 3. `cream` — `bg-[#f7f4ed] text-[#1c1c1c]`, no border, same radius/padding.
> 4. `pill` — `bg-[#f7f4ed] text-[#1c1c1c] rounded-[9999px]`, `box-shadow: var(--inset-dark)`, `opacity-50` default / `active:opacity-80`. Used for icon buttons and action toggles.
>
> Size prop: `sm` (padding `6px 12px`, text 14px) / `md` (default). Never apply `pill` radius on rectangular button variants. Export an `IconButton` component that wraps the pill variant.

### Prompt 7 — Card, Input, and Badge primitives

> Create `src/components/ui/Card.tsx`: `bg-[#f7f4ed]`, `border: 1px solid var(--border-passive)`, `rounded-lg` (12px), no box-shadow, padding controlled by props.
>
> Create `src/components/ui/Input.tsx` and `Textarea.tsx`: `bg-[#f7f4ed]`, `border: 1px solid var(--border-passive)`, `rounded-sm` (6px), padding `8px 12px`, placeholder colour `#5f5f5d`, `focus:ring-2 focus:ring-[var(--ring)] focus:outline-none`.
>
> Create `src/components/ui/Badge.tsx` with variants for price tier (`£`, `££`, `£££`, `££££`, `Free`) and category. All badges use `rounded-[9999px]`, subtle `bg-[var(--hover-tint)]` with `text-charcoal`, 12px padding, 12px text. The Free variant uses a slightly brighter tint.

### Prompt 8 — Root layout, nav, and footer

> Create `src/app/layout.tsx` with a fixed top navigation and a footer. Navigation: left wordmark "BudgetUK" in Camera Plain weight 600, 20px — links "Map", "Spots", "Free", "Transport", "Events", "Community", "About" in weight 400 14px, `text-charcoal` with `underline-offset-4 hover:underline`. Right side: a `ghost` "Log In" button and a `primary` "Add a Spot" button. Background matches the cream (`var(--bg-cream)`), bottom `border: 1px solid var(--border-passive)` appears only after scroll (use a small scroll listener hook). Mobile: hamburger icon as a pill button, slide-down menu with the same links, 6px radius for the menu surface.
>
> Footer: full-width container with `border: 1px solid var(--border-passive)`, `rounded-xl` (16px), soft warm gradient (pinks-oranges-blues at very low opacity) fading to bottom. Multi-column link layout: About, Cities (London, Manchester — greyed out "Coming soon"), Resources, Legal. Wordmark + "Made in London" line at the bottom.

---

## Phase 2 — Firestore Data Model (9–14)

### Prompt 9 — Design the Firestore schema

> Create `src/types/index.ts` with fully typed interfaces for the data model, and document the Firestore collection structure in `docs/schema.md`:
>
> - `spots/{spotId}`: `name`, `slug`, `category` (enum: food, housing, coffee, workspace, gym, bars, grocery, accelerator, vc, entertainment, services), `neighbourhood`, `postcodeDistrict` (e.g. "EC1"), `city` ("london"), `location` (GeoPoint with lat/lng), `priceTier` ("free" | "£" | "££" | "£££" | "££££"), `approxPriceGbp`, `tags` (string array for dietary/halal/veggie/vegan/student/etc.), `googlePlaceId` (nullable), `photoUrl`, `description`, `tips` (string array), `status` ("live" | "pending" | "rejected"), `submittedBy` (uid), `voteCount`, `createdAt`, `updatedAt`.
> - `users/{uid}`: `displayName`, `photoUrl`, `role` ("user" | "moderator" | "admin"), `createdAt`, `reputation` (number), `homeBorough` (nullable).
> - `submissions/{submissionId}`: subset of spot fields plus `voters` (array of uids), `voteCount`, `status`.
> - `favourites/{uid}/items/{spotId}`: `savedAt`, `note` (optional).
> - `votes/{submissionId}_{uid}`: `createdAt` — prevents double-voting via composite doc ID.
>
> Also add a geohash field (`geohash` string) to every spot using `geofire-common` so we can do radius queries later.

### Prompt 10 — Firestore security rules v1

> Write `firestore.rules` with these guarantees:
>
> - `spots`: anyone can read where `status == "live"`. Only server (via admin SDK) or users with role `moderator`/`admin` can write.
> - `submissions`: authenticated users can create with their `uid` in `submittedBy`; the same user cannot update vote counts directly; only the server can flip status to `live`.
> - `users`: a user can read and write only their own doc. `role` field is immutable from the client — only admin SDK can change it.
> - `favourites/{uid}/items/*`: user can read/write only their own.
> - `votes/{compositeId}`: only create permitted (no update/delete from client), the composite ID must match the authed user's uid to prevent spoofing.
>
> Also write a basic Cloud Function trigger plan in `docs/functions.md` for "on submission vote count reaches 25, promote to spots collection".

### Prompt 11 — Auth context and hooks

> Create `src/lib/firebase/auth.ts` exporting functions `signInWithGoogle`, `signInWithEmail`, `signUpWithEmail`, `signOutUser`, `sendPasswordReset`. Create `src/hooks/useAuth.ts` that wraps `onAuthStateChanged` and returns `{ user, loading, role }`. Create an `AuthProvider` in `src/components/providers/AuthProvider.tsx` that subscribes once and puts the user into React Context. Mount it in `app/layout.tsx`. On first sign-in, create a matching `users/{uid}` document with default role `"user"` and reputation 0 — do this via a Cloud Function triggered on `auth.user.create`, not from the client, so role can't be spoofed.

### Prompt 12 — Login and sign-up pages

> Create `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx` using the established button and input components. Layout: centred single column, max-width 400px, 96px top padding. Top: "Welcome back" (t-h2). Form: email + password inputs (react-hook-form + zod validation), primary "Log in" button full-width, below that a ghost "Continue with Google" button. Beneath: a small muted-text link to the other page. Error states: red `text-[#dc2626]` caption below the input, no border colour change. Successful login redirects to `/`. Use the warm focus shadow on inputs, never a sharp outline.

### Prompt 13 — User profile and account menu

> Create `src/app/account/page.tsx` (protected — redirect to `/login` if no user). Tabs across the top: Profile, Favourites, My submissions, Settings. Profile tab lets the user edit `displayName`, `homeBorough`, and a circular avatar (upload goes to Firebase Storage at `avatars/{uid}.jpg`, validate it's <1 MB and <1024×1024 client-side, write the URL back to the user doc). Settings tab exposes email change, password change, and a dangerous-zone "delete account" button as a ghost variant with red-tinted text that requires typing the word DELETE to confirm.
>
> Also add a dropdown menu in the top nav that replaces the "Log In" button when authenticated: avatar + name, with items Account, My favourites, Sign out. Use Radix `DropdownMenu` styled with the cream surface and passive border.

### Prompt 14 — Firebase Storage helpers and rules

> Write `storage.rules`: avatars are writable only by their owning user, max 1 MB, image types only. Spot submission photos go to `submissions/{submissionId}/{filename}` — writable only by the submitter, max 3 MB, image types only. Approved spot photos at `spots/{spotId}/cover.jpg` are admin-only write, public read. Create `src/lib/firebase/storage.ts` with helpers `uploadAvatar(file, uid)`, `uploadSubmissionPhoto(file, submissionId)`, and a client-side image compression step using `browser-image-compression` to keep uploads small.

---

## Phase 3 — Map & Spots Core (15–22)

### Prompt 15 — MapLibre and base map

> Install `maplibre-gl` and `react-map-gl/maplibre`. Create `src/components/features/Map.tsx`. Use Protomaps or OpenFreeMap vector tiles (no Mapbox token). Initial view: London at `{ lng: -0.1276, lat: 51.5074, zoom: 12 }`. Restrict bounds to Greater London. Hide the default MapLibre attribution position and put a custom cream-toned attribution bar at the bottom-right.
>
> Style the map canvas to feel warm: apply a subtle CSS `filter: sepia(0.1) saturate(0.9)` to match the parchment theme — this ties the default OSM colours into the brand. Disable 3D pitch controls; we want a flat, editorial feel.

### Prompt 16 — Seed London spots

> Create `src/data/seed-london.ts` with 60 curated spots covering all categories. Include accurate lat/lng and postcode districts. Real examples to include (research addresses):
>
> - **Food**: Franco Manca (multiple locations), Beigel Bake Brick Lane, Tayyabs, Dishoom, Padella, Kossoff's, Rose Eatery, Chick'n'Sours, Kati Roll Company, Bao.
> - **Groceries**: Lidl, Aldi, Iceland, ethnic supermarkets like TFC, Wing Yip.
> - **Gyms**: PureGym branches, The Gym Group, free outdoor gyms at Hampstead Heath, Finsbury Park, Burgess Park.
> - **Workspaces**: British Library, Barbican, Wellcome Collection reading room, Second Home, Ziferblat, The Riding House Cafe.
> - **Free**: British Museum, V&A, Tate Modern, Natural History Museum, Sky Garden, Little Venice walk.
> - **Coffee**: Monmouth, Kaffeine, Workshop, Prufrock, Climpson & Sons, Watch House.
> - **Housing/co-living**: Mason & Fifth, Node, Base Serviced Apartments, Gravity Co-Living, Folk.
> - **Accelerators/VCs**: Entrepreneur First, Seedcamp, Antler, Founders Factory, LocalGlobe, Atomico.
>
> Write a script `scripts/seed.ts` that reads the file and writes every entry to Firestore's `spots` collection with status `"live"`, computing geohash with `geofire-common`. Use the Firebase admin SDK and a service account. Add a `npm run seed` script.

### Prompt 17 — Spots data hooks

> Create `src/hooks/useSpots.ts` that fetches live spots from Firestore with optional filters: category, neighbourhood, priceTier, tags. Use `onSnapshot` for live updates. Cap reads at 200 docs initially. Return `{ spots, loading, error }`.
>
> Create `src/hooks/useNearbySpots.ts` that takes a user location and radius (metres) and returns only spots within that radius using `geofire-common`'s bounding box query on the `geohash` field, then filters the final result client-side by true distance. Default radius 1500m.

### Prompt 18 — Homepage with map + spot list

> Build `src/app/page.tsx` as a two-pane layout on desktop: map on the left (60% width), vertically scrolling spot list on the right (40% width). On mobile: map is on top (60vh), list slides up from below with a handle bar — like Airbnb mobile. Top of the list shows a horizontal scrollable row of category pills (from prompt 19). Below that, spot cards: image, name (t-h3), neighbourhood + price tier badge, short description, distance if geolocation granted. Clicking a card highlights the corresponding map marker and opens the detail drawer (prompt 22).

### Prompt 19 — Category filter pills

> Create `src/components/features/CategoryPills.tsx`. Horizontal scrollable row of pill buttons, one for every category plus "All" and "Near me". Default state: cream pill with `var(--inset-dark)` shadow, 50% opacity. Selected state: charcoal background, cream text, 100% opacity. Use emoji prefixes matching the original SF site: 🍽️ Food, 🏠 Housing, 💻 Workspaces, ☕ Coffee, 🚀 Accelerators, 💰 VCs, 💪 Gym, 🍺 Bars, 🛒 Grocery, 🎭 Entertainment, ✂️ Services, 🎟️ Free. Multi-select allowed — hold shift on desktop or tap multiple on mobile. Selected filters are stored in URL search params (`?cat=food,coffee`) so they're shareable.

### Prompt 20 — Map markers and clustering

> In the Map component, render a marker for every loaded spot. Use a custom HTML marker: a small pill-shaped badge with the category emoji and price tier, `bg-[#f7f4ed]`, `border: 1px solid var(--border-passive)`, `box-shadow: var(--inset-dark)`. Selected marker scales to 1.1 and gets a charcoal border.
>
> At zoom levels below 12, cluster markers using `supercluster`. Clusters display as charcoal circles with cream text showing the count, `rounded-[9999px]`, same inset shadow. Clicking a cluster zooms the map to fit its children.

### Prompt 21 — "Near me" geolocation

> Add a "Near me" pill that on click requests browser geolocation permission. On grant: store the coordinates in React state, re-centre the map, filter spots to within 2km, and sort the list by distance ascending. Show the user's location as a small blue dot pulsing on the map.
>
> On denial or no HTTPS: show a non-modal toast (cream surface, passive border, 8px radius) explaining that location access is needed and offering a manual postcode input as a fallback. The postcode input geocodes via Google Maps Geocoding API (wrap it in a Next.js API route `/api/geocode` to keep the key server-side) and falls back to it for the same "near me" behaviour.

### Prompt 22 — Spot detail drawer

> Create `src/components/features/SpotDrawer.tsx` — a right-side drawer on desktop (max-width 480px), bottom sheet on mobile, using Radix Dialog. Content: hero photo with 12px radius + passive border; spot name (t-h2, tight letter-spacing); neighbourhood + postcode district + price tier badge row; description (t-body); tips list with bulleted items; walking/tube time to nearest station placeholder (real data in phase 5); "Save" pill button that writes to `favourites/{uid}/items/{spotId}` with optimistic UI; "Get directions" ghost button that opens Google Maps with the lat/lng; "View full page" link to `/london/[neighbourhood]/[slug]`. Uses a soft focus shadow when open, not a backdrop blur.

---

## Phase 4 — Listings, Search, Browse (23–28)

### Prompt 23 — Dedicated spots list page

> Build `src/app/spots/page.tsx` — a full-width list view for when the map isn't the focus. Grid: 3 columns on desktop, 2 on tablet, 1 on mobile. Each card is the same component used in the homepage right-pane, reused via a shared `SpotCard` component. Add a sticky sub-nav at the top with category pills + a search box. URL state drives filters. Show the total count in the t-caption style ("145 spots in London · 12 match").

### Prompt 24 — Server-rendered spot detail pages

> Create `src/app/[city]/[neighbourhood]/[slug]/page.tsx` — a fully server-rendered spot page for SEO. On the server, fetch the spot from Firestore by slug via `adminDb`. Generate static metadata: title pattern "Franco Manca Brixton — Cheap Pizza in SW2 | BudgetUK", description from the spot description, OpenGraph image from the spot photo. Layout: two-column on desktop — left 2/3 is hero photo + title + description + tips + tube info (placeholder), right 1/3 is a sticky sidebar with price tier card, action buttons, nearby spots list. Mobile stacks vertically.
>
> Add `generateStaticParams` to pre-build the top 50 spots at build time; the rest use Next.js ISR with a 1-hour revalidation. Return 404 for unknown slugs.

### Prompt 25 — Neighbourhood and borough filter

> Add a neighbourhood multi-select filter that appears below the category pills when the "All" category is active or on `/spots`. Options are grouped by borough (Hackney, Camden, Southwark, Lambeth, etc.), not just neighbourhoods, so a user can pick "anything in Hackney" or a specific area like "Dalston". Use a Radix `Popover` styled as a cream surface with 12px radius and passive border. Selected values show as small pills inline next to the filter trigger, each with an X to remove.

### Prompt 26 — Price and dietary filters

> Add a combined "Price & dietary" filter that opens another popover. Price section: checkboxes for Free, £, ££, £££, ££££. Dietary section: Halal, Vegetarian, Vegan, Gluten-free, Kosher. Student section: Student discount, UNiDAYS, Student Beans. Multi-select across all, persists to URL. When any filter is active, the trigger pill shows a small charcoal dot.

### Prompt 27 — Text search

> Add a search box component above the category pills on `/spots` and in the top nav on every page. Debounced 250ms. Client-side filter for now: match `name`, `description`, `neighbourhood`, or any `tag`, case-insensitive. Highlight matched substrings in the results using a subtle `var(--hover-tint)` background. When the index grows beyond a few hundred docs, plan to migrate search to Algolia or Typesense — add a `TODO` comment with the exact swap point.

### Prompt 28 — Sort controls

> Add a sort dropdown next to the search box with options: "Most popular" (default, ordered by `voteCount` + `createdAt` tiebreak), "Nearest" (only available when geolocation is granted, sorts by distance), "Cheapest" (priceTier ascending), "Newest" (createdAt descending). Uses the same popover styling as the filters. Sort state persists to URL.

---

## Phase 5 — TfL Integration (29–31)

### Prompt 29 — TfL API wrapper

> Create `src/lib/tfl/index.ts` — a thin client for the TfL Unified API (`api.tfl.gov.uk`). No app key needed for the free tier, but include an optional `app_key` query param if `TFL_APP_KEY` env var is set (raises rate limit to 500 req/min). Implement:
>
> - `getNearestStops(lat, lng, radius = 500, modes = ['tube','bus','overground','elizabeth-line','dlr'])` → list of stops with distance, name, mode, and stopId.
> - `getArrivalsAtStop(stopId)` → next arrivals, each with lineName, destinationName, timeToStation (seconds), modeName.
>
> All functions live in a Next.js API route `/api/tfl/*` so the base URL isn't hit directly from the client — this gives us a single cache layer. Cache stop lookups for 24h in memory (Map with expiry); arrivals are not cached (must be live).

### Prompt 30 — Nearest station component

> Create `src/components/features/NearestStation.tsx`. Given a spot's lat/lng, fetch nearest stops and display the top 1–2 as a small cream card inside the spot detail drawer and spot page sidebar. Each shows the station name, mode icon (tube roundel for tube, etc.), walking distance in minutes (compute from metres at 80m/min), and line names as coloured pills using official TfL line colours (Central red, Piccadilly dark blue, Elizabeth purple, etc. — store these as a map in `src/lib/tfl/colours.ts`).

### Prompt 31 — Live arrivals component

> Create `src/components/features/LiveArrivals.tsx` — renders under the nearest-station card. Shows the next 3 arrivals per station. Updates every 30 seconds while visible (use `IntersectionObserver` to pause when off-screen). Each row: line colour pill + destination + "2 min". Loading state: three skeleton rows with `var(--hover-tint)` shimmer. Error state: muted text "Live data unavailable — try TfL Go".

---

## Phase 6 — User Features (32–36)

### Prompt 32 — Favourites system

> Wire up the "Save" button in the spot drawer and spot page: writes `favourites/{uid}/items/{spotId}` with `{ savedAt: serverTimestamp(), note: null }` on first click, deletes the doc on second click. Optimistic update the UI. Unauthenticated users clicking Save trigger a small popover prompting them to log in, with the destination URL preserved so they land back on the same spot after login.
>
> Build `src/app/account/favourites/page.tsx` showing all saved spots as a list reusing `SpotCard`. Each card has an edit-note field (in-place textarea) and a remove button. Empty state: "No saves yet — explore the map →" with a link back home.

### Prompt 33 — Submit a spot form

> Build `src/app/community/add/page.tsx` — a multi-step form for submitting a new spot. Steps: (1) Category + basic details (name, neighbourhood, price tier), (2) Location — an embedded MapLibre map where the user drops a pin, reverse-geocodes to an address and postcode district; or a postcode lookup that centres the map, (3) Photo upload via the storage helper with compression, (4) Description + tips + dietary tags, (5) Review + submit. Validation with zod at every step. On submit: write to `submissions/{auto-id}` with status `"pending"`, voteCount 0, voters empty, submittedBy uid. Redirect to `/community/thanks` with a "your spot needs 25 community votes to go live" message.
>
> Include a cooldown: a user can only have 3 pending submissions at a time. Enforce client-side and via a Cloud Function.

### Prompt 34 — Voting on submissions

> Build `src/app/community/page.tsx` — a voting feed of all pending submissions. Uses the same card layout as spots but with extra metadata: submitter's display name, time ago, vote count `{n}/25`. Each card has a primary "Upvote" button that writes `votes/{submissionId}_{uid}` with `{ createdAt: serverTimestamp() }`. A Cloud Function increments `voteCount` on the submission doc atomically. Clients see the update via `onSnapshot`. Users can't vote on their own submissions (disable the button) and can only vote once per submission (button flips to "Voted ✓" ghost state). Sort: newest first by default, with a toggle for "almost there" (sorted by `voteCount` descending).

### Prompt 35 — Submission-to-live Cloud Function

> Write a Firebase Cloud Function (Node, TypeScript) in `functions/src/promote.ts`. Trigger: Firestore document update on `submissions/{id}`. Logic: when `voteCount` transitions from <25 to ≥25 AND status is still `"pending"`, copy the submission into the `spots/{newId}` collection with `status: "live"`, compute and set the geohash, increment the submitter's `reputation` by 10, send them a notification email (via Resend or Firebase Extensions — pick Firebase Trigger Email extension for simplicity), and mark the submission `status: "approved"`. Also write a second function that auto-rejects submissions older than 30 days with <5 votes. Include tests with the Firebase emulator suite.

### Prompt 36 — Moderator dashboard

> Build `src/app/admin/page.tsx` — protected, only accessible if the logged-in user has role `"moderator"` or `"admin"` (check on the server via `adminAuth` in a server component). Three tabs:
>
> 1. **Queue** — all pending submissions with approve / reject / edit buttons. Approve force-promotes regardless of vote count. Reject requires a reason, which emails the submitter.
> 2. **Live spots** — table of all live spots with quick inline edit for tags and description, and a "remove" button that soft-deletes (status `"removed"`).
> 3. **Reports** — user-flagged content (add a separate `reports` collection and a small "Flag" menu item on every spot).
>
> All writes to the spots collection from this page go through a Next.js API route that verifies the caller's role server-side — never trust the client.

---

## Phase 7 — Community, Reputation, Events (37–39)

### Prompt 37 — User profile pages

> Build `src/app/u/[username]/page.tsx` — a public profile page showing the user's display name, avatar, join date, reputation, and all their live spots + a gallery of their favourites (if public). Reputation displays as a badge: Newcomer (0–9), Regular (10–49), Local (50–199), Curator (200+), Legend (500+). Users can toggle whether their favourites are public from the Settings tab.

### Prompt 38 — Leaderboard

> Build `src/app/community/leaderboard/page.tsx` showing the top 50 users by reputation this month and all-time. Two tabs. Each row: rank, avatar, display name, reputation count, count of live contributions. Computed via a scheduled Cloud Function that runs daily at 03:00 Europe/London time, aggregates `spots` by `submittedBy`, and writes to a `leaderboard/{monthId}` doc to avoid expensive per-request reads.

### Prompt 39 — Events page

> Build `src/app/events/page.tsx` as a mostly editorial page (like the original SF site's events page). Start with a hand-curated list in `src/data/events.ts` covering: Luma (London scene), Meetup, Eventbrite, Silicon Milkroundabout, London AI, Founders Factory meetups, Entrepreneur First open office hours, Tech London Advocates. Under each, list a handful of recurring events with brief descriptions. Bottom section: "People to follow for London tech events" with their X/LinkedIn handles. Identical visual treatment to the rest of the site — cream cards, passive borders, editorial typography.

---

## Phase 8 — Editorial Pages (40–43)

### Prompt 40 — Getting Around London

> Build `src/app/transport/page.tsx`. Top hero: "Getting Around London — skip the car, save thousands". Then a sectioned list, each section a cream card: Tube (Oyster/contactless caps, peak vs off-peak, key lines), Bus (hopper fare), Elizabeth line, DLR, Overground, Santander Cycles (£3 day pass, £90 annual), Lime/Forest/Tier e-bikes, Thames Clippers, black cabs vs Uber/Bolt, National Rail (railcards — 16-25, 26-30, Two Together, Senior all save 1/3), coach (Megabus, National Express). Each with a "budget tip" bullet list. Embed a fare calculator stub that takes a journey and returns the capped cost (placeholder — real logic later). Include an affiliate CTA for Trainline with a clear "sponsored" tag.

### Prompt 41 — Free London

> Build `src/app/free/page.tsx`. Sections: Free museums (British Museum, V&A, Tate Modern, Tate Britain, National Gallery, Science Museum, Natural History, Imperial War, Wallace Collection, Horniman), Free parks & viewpoints (Sky Garden booking required, Primrose Hill, Parliament Hill, Greenwich Park), Free walks & markets (Borough Market samples, South Bank, Camden Lock), Free cultural events (BBC shows, library talks, Open House London). Pull from the `spots` collection where `priceTier == "free"` and surface them as cards. Add a toggle "Open now" that filters by current time against opening hours (use the Google Places field).

### Prompt 42 — Student guide

> Build `src/app/student/page.tsx`. Sections: student bank accounts (Santander 123 Student, HSBC, Monzo under 18), phone plans (Giffgaff, Smarty, VOXI), student discount platforms (UNiDAYS, Student Beans, TOTUM), transport (16–25 Railcard, Student Oyster 30% off travelcards), housing (Unite Students, iQ, Chapter, SpareRoom), food tips (Too Good To Go, Olio, supermarket meal deals ranked). Each with a card and a tip list. Affiliate CTAs where appropriate — always tagged "sponsored".

### Prompt 43 — Diet page

> Build `src/app/diet/page.tsx` — pre-filters the spots list by dietary tag with four tabs: Halal, Vegetarian, Vegan, Gluten-free. Each tab loads the filtered spots and shows a quick intro paragraph about that scene in London (Halal: East London focus, Whitechapel, Tooting; Vegan: Shoreditch, Camden; etc.). Cards are the usual `SpotCard` component. Hreflang and structured data on each tab for SEO.

---

## Phase 9 — Polish, Analytics, Deploy (44–50)

### Prompt 44 — Google Places enrichment

> Write a scheduled Cloud Function `functions/src/enrichPlaces.ts` that runs daily at 04:00 Europe/London. For each spot with a `googlePlaceId` set, call the Places API Details endpoint and refresh: `opening_hours`, `formatted_phone_number`, `website`, `rating`, `user_ratings_total`, `price_level`, a fresh photo reference. Store these under a `placeData` sub-object on the spot doc. Respect the Places API caching policy — no field is cached beyond 30 days, photos are fetched fresh via server-side proxy `/api/places/photo?ref=...` so the API key never hits the client. Add a "Sync now" button in the admin dashboard for manual refresh on a single spot.

### Prompt 45 — Google Analytics 4

> Add `@next/third-parties/google` and configure GA4 with `NEXT_PUBLIC_GA_MEASUREMENT_ID`. In `app/layout.tsx`, mount `<GoogleAnalytics gaId={...} />` once. Add a cookie-consent banner (bottom centre, cream surface, passive border, 12px radius) that blocks GA from loading until the user accepts — use `js-cookie` and don't call GA `config` until consent is `"granted"`. Track these custom events: `spot_viewed` (spotId, category, neighbourhood), `spot_saved`, `spot_submitted`, `filter_applied` (type, value), `search_performed` (query, resultCount), `login` (method), `signup` (method), `affiliate_click` (destination). Document the event taxonomy in `docs/analytics.md`.

### Prompt 46 — SEO, sitemap, structured data

> Add `src/app/sitemap.ts` that generates an XML sitemap from the live spots in Firestore plus all static pages. Add `src/app/robots.ts` to allow all, disallow `/admin/*` and `/account/*`. On every spot detail page, emit JSON-LD for schema.org `LocalBusiness` or `Restaurant` as appropriate, including `name`, `address`, `geo`, `priceRange`, `aggregateRating` (from Google Places data if available), `openingHoursSpecification`. On category pages, emit `ItemList` JSON-LD. Also add canonical URLs everywhere, and proper OpenGraph + Twitter card metadata on every page.

### Prompt 47 — PWA and offline

> Install `next-pwa` and configure for App Router. Add a `manifest.json` with the name "BudgetUK", theme colour `#f7f4ed`, background colour `#f7f4ed`, icons at 192×192 and 512×512 (cream background, black "B" in Camera Plain 600). Enable service worker caching for static assets + the last 50 viewed spot pages. Add an install prompt that appears on third visit (use `beforeinstallprompt` event), styled as a bottom banner with a primary "Install app" button and a ghost "Not now" button. Offline page shows cached favourites.

### Prompt 48 — Rate limiting and abuse prevention

> Add Firebase App Check with reCAPTCHA v3 to block bot traffic on client Firestore writes. In Cloud Functions, rate-limit submission endpoints to 3 per user per 24h and vote endpoints to 60 per user per hour using a sliding-window counter stored in a `rateLimits/{uid}` doc. Block any IP that triggers more than 300 auth failures per hour at the Cloud Function layer. Flag any submission whose description matches common spam patterns (URLs, repeated characters, common spam keywords) for moderator review automatically.

### Prompt 49 — Loading, empty, and error states

> Audit every page and component. Ensure every data-fetching boundary has:
>
> - A skeleton loader using `var(--hover-tint)` shimmer animation, matching the real component's dimensions.
> - An empty state with a friendly message in t-body-lg, a small illustration (placeholder for now — reserve a 240×180 slot), and a call-to-action ghost button.
> - An error state that doesn't leak stack traces. Use a shared `ErrorBoundary` around route segments that shows "Something's off — we've been notified" with a ghost "Try again" button and a small "report this" link.
>
> Wire errors to Firebase Crashlytics (web) for real reporting. Add a small t-caption line on the bottom of error pages showing the error ID so users can reference it in support.

### Prompt 50 — Deploy and launch checklist

> Prepare for production launch. Create `docs/launch-checklist.md` with every pre-deploy check: all env vars set in Vercel (list them), Firestore rules tested with the emulator, storage rules tested, Cloud Functions deployed to `europe-west2`, App Check enforced on every Firebase service, reCAPTCHA keys set, GA cookie consent tested, sitemap valid, OpenGraph images rendering, Lighthouse scores (Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95), core user journeys tested (sign up, submit a spot, vote, save a favourite, filter by category), mobile Safari + Chrome + Firefox regression check, 404 and 500 pages styled, contact email alias set up, privacy policy and terms of service pages live.
>
> Deploy the Next.js app to Vercel with the production domain `budgetuk.com` (or similar). Set up a `preview` branch deploy for PRs. Add a small status widget to the footer fed by a `/api/health` endpoint that pings Firestore and returns "all systems operational". Finally, write a launch announcement post template for X and LinkedIn in `docs/launch-post.md`, following the same editorial tone as the site itself.

---

## Post-launch ideas (beyond the 50)

Once the above is shipping:

- **Second city**: Manchester. Your data model and URL scheme already support it — it's mostly a content job plus TfL swap (use TfGM API).
- **Personal lists**: let users build public shareable lists ("cheap first-date night", "best halal under £10") — huge social-sharing + SEO surface.
- **Deal integrations**: Too Good To Go feed, happy-hour data, flash deals.
- **Native apps**: React Native + Expo, sharing the Firebase backend 1:1.
- **Partner program**: restaurants/gyms can claim their listing and offer exclusive BudgetUK discounts, in exchange for a small monthly fee.

---

## Using these prompts

- **Claude Code** / **Cursor** / **Windsurf**: paste one prompt at a time, review the diff, commit, move on. Don't batch — the agent loses track at scale.
- **Lovable** / **v0**: start with prompts 1–3 (design system lock-in) as a single "project brief", then feed feature prompts individually.
- **If anything breaks**: feed the agent the error plus the original prompt and ask for a minimal fix, not a rewrite.
- **Keep the design system sacred**: whenever you add a new component, remind the agent of the token set from prompt 2 so cream (#f7f4ed), charcoal (#1c1c1c), and the opacity-derived greys don't drift.

Good luck — ship the v1 in 3–4 weeks, get 10 real users, then iterate.
