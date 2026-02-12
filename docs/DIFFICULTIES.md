# BoxDrop — Difficulty Log

> A living record of technical challenges encountered during development,
> how they were diagnosed, and the solutions applied.
> Newest entries first.

---

## 013 · Mapbox Navigation Styles vs. Monochrome Aesthetic

**Date:** 2026-02-12
**Phase:** 3 — Logistics & Geospatial
**Severity:** Design regression

### Problem

Switching to Mapbox `navigation-day-v1` and `navigation-night-v1` introduced "neon green" high-frequency road highlights that clashed with the pure monochrome aesthetic of the Alexander UI Canon.

### Root Cause

Navigation styles prioritize visibility over aesthetic, using high-contrast green for roads suitable for in-car GPS but inconsistent with the "Premium Lightness" (Canon §20) and "Depth Over Color" (Canon §21) principles.

### Solution

Reverted to standard `light-v11` and `dark-v11`. While they lack the specific navigation-optimized metadata, they provide a cleaner grayscale canvas that maintains the premium feel.

### Key Lesson

> Functional optimization (Navigation styles) should not override brand identity (Monochrome). Always test "Utility" styles against the design canon.

---

## 012 · Responsive "Flatness" on Ultra-Wide Monitors

**Date:** 2026-02-12
**Phase:** 3 — Logistics & Geospatial
**Severity:** UX refinement

### Problem

On large desktop monitors, the list of orders and cart items stretched across the entire X-axis, creating "ribbon" cards that were difficult to scan and visually unappealing.

### Root Cause

The initial layout used a simple vertical list with `w-full` responsiveness. While this worked for mobile, it broke the "Dashboard = Control" (Canon §10) principle on desktop by wasting whitespace and creating long scanning paths.

### Solution

Implemented **Responsive Grid Switching**:
- Mobile: 1 column
- Tablet/Small Desktop: 2 columns
- Ultra-Wide/Large Desktop: 3 columns + Split-Panel Telemetry.
Used `gap-8` for increased spatial separation to reduce visual noise.

### Key Lesson

> Responsive design isn't just about shrinking; it's about re-orienting. Don't stretch a list—multiply its columns.

---

**Date:** 2026-02-12
**Phase:** 2 — Core Experience
**Severity:** UX regression

### Problem

When `loading={true}`, the Button component replaced its children with a single dot. This caused the button to visibly shrink during loading, creating layout shift and breaking the "calm feedback" principle (Canon §6).

### Root Cause

The original implementation used a ternary: `{loading ? <dot/> : children}`. This swapped out the children entirely, losing the button's natural width.

### Solution

Rebuilt the Button to use a **stacked overlay** approach:
- Children remain rendered but `opacity-0` during loading (preserving width)
- A three-dot shimmer pulse overlays via `position: absolute`
- Transition is 200ms for calm micro-interaction

### Key Lesson

> Loading states must never change element dimensions. Preserve layout stability by hiding content (opacity-0), not removing it.

---

## 010 · OAuth Callback Route Missing

**Date:** 2026-02-12
**Phase:** 2 — Core Experience
**Severity:** Blocker (auth flow broken)

### Problem

After Google OAuth login, the user was dumped at `/?code=1e673ad7-...` — the landing page with a raw auth code in the URL. No session was created.

### Root Cause

There was **no `/auth/callback` route** to exchange the OAuth code for a Supabase session. The `signInWithOAuth` function pointed `redirectTo` directly at `/dashboard`, which doesn't handle the `code` parameter.

### Solution

1. Created `app/auth/callback/route.ts` — exchanges the code and redirects.
2. Updated `auth-service.ts` to route through `/auth/callback?next=/dashboard`.
3. Added a safety net in `middleware.ts` to catch stray `/?code=` URLs.

### Key Lesson

> OAuth is a 3-step flow. If you skip the callback exchange, you have a code, not a session.

---

## 009 · PostGIS GIST Index Fails on Supabase Push

**Date:** 2026-02-12
**Phase:** 3 — Logistics & Geospatial
**Severity:** Blocker (migration rejected)

### Problem

`npx supabase db push` failed with:

```
access method "gist" (SQLSTATE 42704)
```

The migration tried to create a GIST spatial index on a `geography(POINT)` column, but the database couldn't find the GIST access method.

### Root Cause

Supabase installs PostGIS in the **`extensions`** schema, not `public`. The migration session's `search_path` didn't include `extensions`, so PostgreSQL couldn't resolve the GIST access method or any `st_*` spatial functions.

### Solution

1. Added `set search_path to public, extensions;` at the top of the migration file.
2. Used `create extension if not exists postgis with schema extensions;` to be explicit.
3. Added `set search_path = public, extensions` on the RPC function itself via `security definer`.
4. Used `npx supabase migration repair <version> --status reverted` to clear the failed attempt before re-pushing.

### Key Lesson

> On Supabase hosted, always schema-qualify extension objects or set the search path. Never assume extensions live in `public`.

---

## 008 · react-map-gl v8 "Module not found"

**Date:** 2026-02-12
**Phase:** 3 — Logistics & Geospatial
**Severity:** Blocker (build fails)

### Problem

```
Module not found: Can't resolve 'react-map-gl'
```

The package was installed and present in `node_modules`, but Next.js Turbopack couldn't resolve it.

### Root Cause

`react-map-gl` v8 removed the default package export. It now requires explicit subpath imports:
- `react-map-gl/mapbox` — for Mapbox GL JS
- `react-map-gl/maplibre` — for MapLibre GL JS

The old `import Map from 'react-map-gl'` no longer resolves to anything.

### Solution

Changed all imports:

```typescript
// ❌ Before (v7 style)
import Map, { Marker } from 'react-map-gl';

// ✅ After (v8 style)
import Map, { Marker } from 'react-map-gl/mapbox';
```

Also added `transpilePackages: ["mapbox-gl", "react-map-gl"]` to `next.config.ts`.

### Key Lesson

> Always check the package's `exports` field in `package.json` when a "module not found" error occurs despite the package being installed. Breaking changes in export maps are silent.

---

## 007 · GeoJSON Type Widening Build Failure

**Date:** 2026-02-12
**Phase:** 3 — Logistics & Geospatial
**Severity:** Blocker (TypeScript build error)

### Problem

```
Type 'string' is not assignable to type '"Feature"'.
```

The `<Source data={routeData}>` prop rejected our GeoJSON object because TypeScript widened `'Feature'` to `string`.

### Root Cause

TypeScript infers object literal string values as `string`, not as their literal type. The `react-map-gl` `Source` component expects a GeoJSON discriminated union (`Feature | FeatureCollection | Point | ...`), which requires the `type` field to be exactly `"Feature"`, not `string`.

### Solution

Added `as const` to lock the discriminant fields:

```typescript
return {
    type: 'Feature' as const,        // ← literal "Feature", not string
    properties: {},
    geometry: {
        type: 'LineString' as const, // ← literal "LineString", not string
        coordinates: route
    }
};
```

### Key Lesson

> When building GeoJSON (or any discriminated union) inline, always use `as const` on the discriminant field. TypeScript widens by default.

---

## 006 · Mapbox GL CSS Import Fails in Turbopack

**Date:** 2026-02-12
**Phase:** 3 — Logistics & Geospatial
**Severity:** Blocker (build fails)

### Problem

```
Module not found: Can't resolve 'mapbox-gl/dist/mapbox-gl.css'
```

Importing the Mapbox CSS directly inside a `"use client"` component caused the Next.js Turbopack bundler to fail during SSR pre-rendering.

### Root Cause

Turbopack handles CSS imports differently from Webpack. Importing third-party CSS inside a client component can fail during the SSR pass because the CSS file isn't processed the same way.

### Solution

Moved the import from the component to the global stylesheet:

```css
/* app/globals.css */
@import "tailwindcss";
@import "mapbox-gl/dist/mapbox-gl.css";
```

Removed `import 'mapbox-gl/dist/mapbox-gl.css'` from `map-view.tsx`.

### Key Lesson

> In Next.js with Turbopack, import third-party CSS in `globals.css`, not inside components. This ensures styles are available in both SSR and CSR contexts.

---

## 005 · useSearchParams() Prerender Bailout

**Date:** 2026-02-12
**Phase:** 2 — Core App
**Severity:** Blocker (Vercel build fails)

### Problem

```
useSearchParams() should be wrapped in a suspense boundary at page "/login"
Error occurred prerendering page "/login"
```

Vercel's static generation worker crashed when pre-rendering the login page.

### Root Cause

Next.js 16 requires any page that calls `useSearchParams()` to be wrapped in a `<Suspense>` boundary. Without it, the pre-renderer has no fallback and throws a hard error.

### Solution

Wrapped `{children}` in both `AuthLayout` and `MainLayout` (the dashboard layout) with `<Suspense>`:

```tsx
<Suspense fallback={<Spinner />}>
    {children}
</Suspense>
```

### Key Lesson

> Any layout that wraps pages using `useSearchParams()`, `usePathname()`, or other client-side URL hooks must include a `<Suspense>` boundary. This is a Next.js 16 hard requirement for static generation.

---

## 004 · Supabase RPC Type Mismatch

**Date:** 2026-02-12
**Phase:** 3 — Logistics & Geospatial
**Severity:** Warning (TypeScript error)

### Problem

```
Argument of type '{ user_lat: number; ... }' is not assignable to parameter of type 'undefined'.
```

Calling `supabase.rpc('get_nearby_vendors', { ... })` threw a TypeScript error even though the function was defined in `types/database.ts`.

### Root Cause

The Supabase client's generic types weren't fully wired up. The auto-generated `Database` type's `Functions` map wasn't being picked up by the RPC call inference, causing it to default to `undefined` for arguments.

### Solution

Applied a targeted type cast on the `rpc` method:

```typescript
const { data, error } = await (supabase.rpc as any)('get_nearby_vendors', {
    user_lat: lat,
    user_long: lng,
    radius_meters: radiusMeters
});
```

### Key Lesson

> Until you run `npx supabase gen types typescript` to regenerate types from the live schema, manual `Database` type definitions may not fully satisfy the Supabase client's generic inference. Use targeted casts as a bridge.

---

## 003 · pnpm Auth Token Failure

**Date:** 2026-02-11
**Phase:** 3 — Logistics & Geospatial
**Severity:** Blocker (can't install packages)

### Problem

`pnpm install` failed with a 401 authentication error when trying to install `mapbox-gl` and `react-map-gl`.

### Root Cause

A stale or invalid npm auth token was stored in the global `.npmrc` configuration, causing authentication failures against the npm registry for new package installations.

### Solution

1. Manually added the dependencies to `package.json` with correct version ranges.
2. Ran `pnpm install --no-frozen-lockfile` to regenerate the lockfile and bypass the cached auth.
3. Verified packages appeared in `node_modules`.

### Key Lesson

> When `pnpm install` fails with auth errors, check `~/.npmrc` for stale tokens. Alternatively, add deps to `package.json` manually and let the lockfile regenerate.

---

## 002 · Vendor Category Column Missing

**Date:** 2026-02-11
**Phase:** 2 — Core App
**Severity:** Warning (silent data gaps)

### Problem

The vendor cards displayed "Uncategorized" for every vendor. The `category` field was always `null`.

### Root Cause

The original `schema.sql` didn't include a `category` column on the `vendors` table, but the TypeScript types and UI code referenced it. The seed data also didn't provide categories.

### Solution

Added `category text` to the vendors table schema and included category values in the seed data. Updated the TypeScript `Vendor` interface to include `category: string | null`.

### Key Lesson

> Always diff your TypeScript interface against the actual SQL schema. Silent `null` fields are the worst kind of bug — they don't crash, they just look wrong.

---

## 001 · Next.js 16 Middleware Deprecation

**Date:** 2026-02-11
**Phase:** 1 — Foundation
**Severity:** Warning (build warning)

### Problem

```
⚠ The "middleware" file convention is deprecated.
Please use "proxy" instead.
```

### Root Cause

Next.js 16 deprecated the `middleware.ts` file convention in favor of the new `proxy` convention.

### Solution

Acknowledged as a non-blocking warning. The middleware still functions correctly. Migration to `proxy` is planned for a future iteration.

### Key Lesson

> Build warnings from framework upgrades should be logged even if they're non-blocking. They become blockers in future versions.
# Technical Challenges & Design Decisions Log

This document tracks technical hurdles, design trade-offs, and solutions implemented to maintain the "Alexander UI" aesthetic across the BoxDrop application.

## 1. Theming & Contrast (Light/Dark Mode)

### Challenge: Modal Visibility in Light Mode
- **Issue**: Modals designed with "glassmorphism" (`glass-heavy`) often relied on hardcoded white borders or backgrounds, making them invisible against a light background.
- **Fix**: Replaced hardcoded colors with semantic tokens:
  - `border-white/10` -> `border-foreground/5`
  - `bg-white/5` -> `bg-background/5` or `bg-muted/10`
  - `text-white` -> `text-foreground`
- **Result**: Elements now invert correctly: dark/glass in Dark Mode, light/glass in Light Mode.

### Challenge: Product Image Fidelity vs. Ambient Glow
- **Issue**: The "Ambient Color Extraction" effect (a blurry, zoomed-in version of the product image behind the modal) looked great in Dark Mode but "washed out" or dulled the primary product image in Light Mode due to lack of contrast.
- **Fix**: Removed the ambient glow layer entirely for the Product Detail modal. Removed the `bg-gradient-to-t` overlay on the image.
- **Result**: Product images are now sharp, high-contrast, and color-accurate in all lighting conditions.

## 2. Layout & Navigation

### Challenge: Sidebar Stability vs. Immersive Scroll
- **Issue**: The original "Apple-style" adaptive nav hid the sidebar (desktop/tablet) on scroll to maximize screen real estate. This caused a jarring shift in layout width and felt unstable for desktop users.
- **Fix**: Removed the `animate` prop from the Desktop and Tablet sidebars in `MainLayout`.
- **Result**: Sidebars start fixed. Only the Mobile header and bottom pill hide on scroll.

## 3. Terminology & Data

### Challenge: "Specialties" vs. "Products"
- **Issue**: The UI referred to "Inventory / X Specialties", but the data model (confirmed via script) uses `products` and has no `specialties` field.
- **Fix**: Updated UI label to "Products" to match the actual data entity.
- **Result**: UI accurately reflects the database schema.

## 4. Modal Backdrops

### Challenge: Cinematic Depth vs. Readability
- **Issue**: A "lighter" backdrop (`bg-background/10` + `blur-md`) caused visual noise by letting the underlying page bleed through too much.
- **Fix**: Reverted to a high-fidelity blur (`bg-background/20` + `blur-3xl`).
- **Result**: Maintains the "Spotlight Effect", keeping user focus entirely on the modal content by obliterating background distractions.

## 5. Visual Hierarchy & Visibility

### Challenge: Search & Input Visibility in Light Mode
- **Issue**: Standard `glass-heavy` inputs and buttons often used `border-white/5` or `hover:border-white/10`. In Light Mode, these borders were invisible against a white background, making interactive areas undefined.
- **Fix**: Swapped hardcoded white borders for theme-aware tokens:
  - `border-white/5` -> `border-foreground/5`
  - `hover:border-white/10` -> `hover:border-foreground/10`
- **Result**: Inputs and filters define their shape subtly but clearly in both Light and Dark modes.

### Challenge: Login Input Contrast
- **Issue**: The Login input used `bg-muted/50`. In Light Mode, this resulted in a near-white input on a white glass card, offering zero contrast for the user to identify the typing area.
- **Fix**: Increased opacity to `bg-muted` (full opacity) and added a transparent border that highlights on focus.
- **Result**: Clear, accessible input fields that respect the glass aesthetic without sacrificing usability.

### Challenge: Text Overlay on Missing Images
- **Issue**: "Spotlight" cards use white text over product images. If the image failed to load, the fallback was `bg-accent` (light in Light Mode), rendering the white text invisible.
- **Fix**: Changed image fallback to `bg-muted-foreground/20` (dark grey).
- **Result**: White text remains readable even when media fails to load.


---

### 3. The "Mega-Prompt" for the AI Coder

Copy and paste the following prompt. It contains the context of your previous projects (`iVisit`, `SeeViche`) implicitly by setting the standard high.

**Prompt Subject:**
> Build "BoxDrop": A Premium, Modular Logistics PWA with Next.js, Supabase, and Gluestack.

**Prompt Body:**
```text
Role: You are a Senior Principal Software Architect and UI/UX Designer specialized in building high-performance, cross-platform logistics applications.

Goal: Build the foundation and core flows for "BoxDrop," a premium delivery/logistics Progressive Web App (PWA).

Tech Stack (Strict Adherence):
- Framework: Next.js 15 (App Router).
- Styling: Tailwind CSS + NativeWind (v4).
- UI Components: Gluestack UI (Must be configured for universal usage).
- State: Zustand (Client state), React Query (Server state).
- Backend: Supabase (Auth, DB, Realtime).
- Icons: Lucide React (Web) / React Native Vector Icons (Mobile).

Design System Rules (The "Premium" Constraint):
1. THE NO-BORDER RULE: You are strictly forbidden from using CSS borders (border-width). All visual separation must be achieved via:
   - "Frosted Glass" depths (backdrop-blur-md, bg-white/10 or bg-black/5).
   - Shadows and Elevation.
   - Whitespace.
2. Aesthetic: Black & White monochrome, minimalist, high contrast. "Premium" feel.
3. Interaction: Micro-interactions are mandatory. Buttons press in, cards glide up.

Architecture & Data Flow:
Follow this exact data flow: Provider -> UI Component -> Custom Hook -> Service Layer -> Zustand/Supabase.
- Create a `src/core/services` folder for all Supabase logic (clean separation).
- Create a `src/core/store` folder for Zustand.

Task List (Step-by-Step Implementation):

Step 1: Setup & Configuration
- Initialize Next.js with TypeScript.
- Configure Supabase Client (createClient for server and client).
- Configure Gluestack UI with a custom "BoxDrop" theme (Black/White).
- Create the global `layout.tsx` with a `Providers` wrapper (QueryClient, Auth, Theme).

Step 2: Database & Seed (SQL)
- Write a Supabase SQL script to create tables: `profiles`, `vendors`, `products`, `orders`.
- Enable RLS (Row Level Security) policies immediately.
- Create a 'seed.sql' with 5 premium mock vendors and 20 products so the app has data on launch.

Step 3: The "Smart" App Shell (Layouts)
- Implement `app/(tabs)/_layout.tsx`: A smart bottom tab bar that uses a "Glassmorphism" effect.
- Implement `app/(auth)/_layout.tsx`: A clean layout for login/signup without tabs.
- Ensure the Tab Bar is hidden when navigating to `app/product/[id]`.

Step 4: Core Components & "Modernized Shells"
- Build a generic `ScreenShell` component: Handles SafeArea, loading states (Skeletons), and unified padding.
- Build a `GlassCard` component: Implements the no-border, frosted depth look.
- Build a `ProductCard` with "Add to Cart" micro-interaction (tap to expand/reveal controls).

Step 5: Authentication & Auth Flow
- Implement a phone/email auth flow using Supabase.
- Create a `useAuth` hook that redirects unauthenticated users away from `(main)` routes.

Step 6: The "Marketplace" (Home Tab)
- Fetch vendors from Supabase using the Service layer.
- Render them using the `GlassCard`.
- Implement a "Progressive Disclosure" search bar that expands on focus.

Output Requirements:
- Provide the full file structure tree.
- Provide the raw SQL for Supabase.
- Provide the code for the critical Layouts and Components.
- Do not use placeholder comments like "// rest of code". Write the full, clean, modular code.

Role: You are the Lead Frontend Architect for "BoxDrop," a premium logistics PWA.

CURRENT STATUS (Read Carefully):
1.  **Repo Initialized:** The Next.js 15 (App Router) structure is set in the `app/` directory (Root structure, no `/src`).
2.  **Tech Stack:** Next.js 15, Tailwind CSS + NativeWind v4, Gluestack UI, Supabase, Zustand.
3.  **Database:** Schema is defined (`vendors`, `products`, `orders`) and RLS is enabled.
4.  **Design System:** The `tailwind.config.ts` and `global.css` are configured for a "No Border" monochrome aesthetic.

YOUR MISSION (Phase 2):
We need to breathe life into the empty shell. You will build the **Global Layout**, the **Navigation**, and the **Marketplace Grid**.

CRITICAL DESIGN LAWS (The "BoxDrop Constitution"):
1.  **NO BORDERS:** You are strictly forbidden from using `border-` classes. Use `shadow-sm`, `shadow-lg`, or `backdrop-blur-md` (frosted glass) for separation.
2.  **The "Levitating Slab":** On Desktop, the app must look like a floating phone/widget centered on the screen (max-w-md), NOT a full-width website.
3.  **Black & White:** Use the `bg-neutral-50` to `bg-neutral-900` spectrum. Color is reserved for status only.

TASK LIST (Execute in Order):

Task 1: The "Levitating Slab" Root Layout
-   Modify `app/layout.tsx`.
-   Implement the "Desk Mat" background (a subtle noise texture or gradient orb).
-   Create the centered "App Container" that constrains the app to a mobile shape on desktop (`sm:max-w-[480px]`, `sm:rounded-3xl`, `sm:shadow-2xl`).
-   Ensure `overflow-hidden` is handled correctly so scrollbars stay inside the "phone".

Task 2: The "Glassmorphism" Tab Bar
-   Create `app/(main)/(tabs)/_layout.tsx` (Note: Use `_layout.tsx` for Expo router compatibility mental model, or `layout.tsx` for Next.js).
-   Implement a floating bottom navigation bar using `backdrop-blur-xl` and `bg-white/80`.
-   It must have active states (icon fills) and inactive states (opacity 50%).
-   Hide this tab bar when on `/product/[id]` routes.

Task 3: The "Marketplace" (Home Tab)
-   Edit `app/(main)/(tabs)/page.tsx`.
-   **Header:** Create a "Good Morning" header with a "Current Location" pill (use `useLocation` hook mock if needed).
-   **Search:** Build a "Progressive Disclosure" search bar that expands on focus.
-   **Grid:** Render a grid of `GlassCard` components (create this component if missing) fetching data from Supabase `vendors` table.
-   **Loading:** Use a Skeleton loader (Shimmer effect), NOT a spinner.

Task 4: The `GlassCard` Component
-   Create `components/shared/GlassCard.tsx`.
-   Style: `bg-white` (or `bg-black/5` in dark mode), `shadow-sm`, `rounded-2xl`.
-   Interaction: `active:scale-95` and `hover:-translate-y-1` (smooth physics).

OUTPUT REQUIREMENTS:
-   Do not simply explain. **WRITE THE CODE.**
-   Use `next/image` for all images.
-   Use `lucide-react` for icons.
-   Ensure all files are strictly typed (TypeScript).
-   Read the existing `tailwind.config.ts` to use the correct color variables.