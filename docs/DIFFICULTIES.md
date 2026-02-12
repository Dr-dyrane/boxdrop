# BoxDrop — Difficulty Log

> A living record of technical challenges encountered during development,
> how they were diagnosed, and the solutions applied.
> Newest entries first.

---

## 011 · Button Loading State Replaces Children

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
