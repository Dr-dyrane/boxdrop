# BoxDrop 📦

> **A premium logistics & delivery PWA built with a "Glass & Depth" design philosophy.**

| | |
|---|---|
| **Status** | **Phase 3 — High-Fidelity Logistics Simulation** 🟢 |
| **Type** | Progressive Web App (PWA) |
| **Stack** | Next.js 14 · Supabase · Mapbox · Zustand · Framer Motion |
| **License** | Proprietary |

---

## Table of Contents

- [Vision](#-vision)
- [Design System — The Alexander Canon](#-design-system--the-alexander-canon)
- [Tech Stack](#-tech-stack)
- [Architecture & Data Flow](#-architecture--data-flow)
- [File Structure](#-file-structure)
- [Database & Seed Ecosystem](#-database--seed-ecosystem)
- [Auth & Security](#-auth--security)
- [Core Features](#-core-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Roadmap](#-roadmap)
- [Documentation Hub](./docs/index.md) 🏛️
- *Source Code includes comprehensive JSDoc inline documentation.*

---

## 🎯 Vision

BoxDrop is a **three-sided logistics marketplace** connecting **Users**, **Vendors**, and **Couriers** through a single, premium interface.

Unlike standard delivery utilities, BoxDrop treats visual quality as infrastructure. Every screen, from the **"Immersive Cinema"** vendor headers to the **"Floating Glass"** cart pill, is designed to feel **expensive, calm, and effortless**.

### Core Principles

1.  **Premium First** — The UI must feel high-end before it feels feature-rich.
2.  **Simulation Grade** — The app runs a full logistics engine (courier movement, ETA calculation) even in demo mode.
3.  **Real-time by Default** — Order tracking, status updates, and courier positions are live.
4.  **Modular Architecture** — Every layer has a single responsibility. Nothing leaks.

---

## 🎨 Design System — The BoxDrop Law & Alexander Canon

**These rules are immutable. No exceptions.**

### 1. The No-Border Rule

> You are **strictly forbidden** from using CSS borders (`border`, `border-width`) to separate elements.

Visual separation is achieved exclusively through:

| Technique | Implementation |
|---|---|
| **Frosted Glass** | `backdrop-blur-md`, `bg-white/10` (Light), `bg-black/5` (Dark) |
| **Depth & Elevation** | `shadow-sm` for subtle lift, `shadow-2xl` for floating elements |
| **Opacity Layers** | `bg-card/20`, dynamic scrims for text readability |
| **Whitespace** | Generous padding and margins — silence is luxury |

### 2. Aesthetic

-   **Palette:** Black & White monochrome. High contrast. Minimalist.
-   **Imagery:** High-fidelity, curated Unsplash collections for each category.
-   **Typography:** Inter / SF Pro. Size, weight, and spacing communicate hierarchy.
-   **Motion:** Spring physics (stiffness 300, damping 30) for all interactions.

### 3. Interaction & Motion

| Element | Behavior |
|---|---|
| **Buttons** | Slight scale-down on press. Never bounce. |
| **Cards** | Glide up on hover/focus (`y: -8px`). |
| **Modals** | AnimatePresence pop-layout with backdrop blur. |
| **Page Transitions** | Staggered fade-ins for content sections. |
| **Loading** | Shimmer skeletons that match exact layout. Never spinners. |

### 4. Progressive Disclosure

-   Show only what's needed *now*.
-   Secondary actions (Edit, Details, Delete) appear on `hover` (desktop) or `tap` (mobile).
-   Search bars expand on focus.
-   Forms reveal one input at a time.

### 5. State is Design

Every possible state is intentionally designed:

-   **Loading** → Shimmer skeletons matching content layout
-   **Empty** → Clear, useful empty states with a next step
-   **Error** → Composed, never panicked. Always recoverable.
-   **Partial** → Gracefully handled. No broken layouts.

### 6. The Pure UI Rule

> You are **strictly forbidden** from calling Supabase or any direct data-fetching logic inside a UI Component (`app/**/*` or `components/**/*`).

The UI must remain "logic-free." All data interactions must follow this mandate:
-   **UI** calls a **Custom Hook**.
-   **Hook** calls a **Service**.
-   **Service** calls **Supabase**.

This ensures components are reusable, testable, and the architecture remains predictable.

---

## 🔧 Tech Stack

### Core

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR, routing, API routes |
| **Language** | TypeScript (strict) | Type safety across the stack |
| **Motion** | Framer Motion | Complex spring animations, layout transitions |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Icons** | Lucide React | Consistent, tree-shakeable icon set |

### State Management

| Type | Technology | Use Case |
|---|---|---|
| **Server State** | React Query | Caching, optimistic updates, background refetching |
| **Client State** | Zustand | Cart, user preferences, session data |

### Backend (Supabase)

| Feature | Use Case |
|---|---|
| **PostgreSQL** | Primary database |
| **Auth** | Phone/Email OTP authentication |
| **Realtime** | Live order tracking subscriptions |
| **Storage** | Product images, avatars |
| **RLS** | Row Level Security on every table |

---

## 🏗 Architecture & Data Flow

BoxDrop follows a **strict unidirectional data flow**. Each layer has exactly one job.

```
Provider → UI Component → Custom Hook → Service Layer → Zustand Store → Database (Supabase)
```

| Layer | Responsibility | Example |
|---|---|---|
| **Provider** | Wraps the app with context | `ThemeProvider`, `AuthProvider` |
| **UI Component** | Renders data. No logic. | `GlassCard`, `OrderRow` |
| **Custom Hook** | Connects UI to services. Local logic. | `useCart`, `useAuth`, `useOrders` |
| **Service Layer** | Pure functions that call Supabase. | `fetchProducts()`, `createOrder()` |
| **Store (Zustand)** | Global client state. | `useCartStore` |
| **Database** | Source of truth. | Supabase PostgreSQL |

---

## 📂 File Structure

Root-level structure. **No `/src` directory.** Next.js 14 App Router conventions.

```
/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Authentication Routes
│   │   ├── login/page.tsx         # Login screen
│   │   └── layout.tsx            # Auth layout (clean, no tabs)
│   │
│   ├── (main)/                    # Protected App Routes
│   │   ├── dashboard/             # Main Tab Navigation
│   │   │   ├── page.tsx          # Bento Marketplace
│   │   │   ├── search/           # Discovery Engine
│   │   │   ├── cart/             # High-Fidelity Cart
│   │   │   ├── orders/           # Real-time Tracking
│   │   │   └── vendor/[id]/      # Immersive Vendor Detail
│   │   │
│   │   └── layout.tsx            # Shell Layout (Fonts, Providers)
│   │
│   ├── api/                       # Server-side (Webhooks, Admin)
│   └── globals.css                # Tailwind + design token imports
│
├── components/                    # React Components
│   ├── ui/                        # Low-level primitives (Button, Input)
│   ├── shared/                    # High-Level Business Components
│   ├── layout/                    # Layout wrappers (ScreenShell)
│   └── animations/                # Animation wrappers
│
├── core/                          # Business Logic (Non-UI)
│   ├── services/                  # Supabase Data Layer
│   ├── store/                     # Zustand Stores
│   ├── hooks/                     # Custom Hooks
│   └── utils/                     # Formatters (Currency, Time, Distance)
│
├── scripts/                       # DevOps & Seeding
│   └── db_seed.ts                 # Unified High-Fidelity Seeker
│   └── logistics_engine.ts        # Simulation logic
│
└── types/                         # TypeScript Interfaces
```

---

## 📦 Database & Seed Ecosystem

The schema supports a **three-sided marketplace** from Day 1.

### Unified Seed Script (`scripts/db_seed.ts`)
We have built a sophisticated seed engine that populates the database with:
-   **120+ Vendors**: Spread geographically around a target centroid (Hemet, CA).
-   **Curated Imagery**: Unsplash collections mapped to specific categories (Sushi, Coffee, Retail).
-   **Smart Products**: prices, descriptions, and stock levels generated with variance.

### Schema Highlights

| Table | Key Features |
|---|---|
| `vendors` | `location` (PostGIS Geography), `cover_url`, `category` |
| `orders` | `courier_lat/lng` (Real-time tracking), `status` (Enum flow) |
| `products` | `is_available`, `image_url` |

---

## 🔐 Auth & Security

| Aspect | Implementation |
|---|---|
| **Provider** | Supabase Auth (Email/Phone OTP) |
| **Protection** | `useAuth` hook redirects unauthenticated users |
| **RLS** | Strict Row Level Security. Public read access to Vendors/Products. Private access to Orders. |

---

## ⚡ Core Features

### 1. Immersive Discovery (Marketplace)
-   **Bento Grid Layout**: Category tiles using `GlassCard` architecture.
-   **Spotlight Engine**: Featured vendors appear in large, cinema-style cards.
-   **Smart Search**: Real-time filtering by category and text.

### 2. High-Fidelity Commerce (Cart & Checkout)
-   **Floating Cart Pill**: Apple-style persistent summary that follows the user.
-   **Smart Currency**: Locale-aware formatting (USD/EN-US).
-   **Optimistic UI**: Instant "Add to Cart" animations with spring physics.

### 3. Real-time Logistics Engine (Tracking)
-   **Discovery Map**: Mapbox integration with dynamic zoom and entity snapping.
-   **Visual Courier**: Simulated courier movement (`courier_lat`/`lng`) interpolated along routes.
-   **Status Timeline**: Animated vertical timeline showing precise order states.
-   **Smart Geocoding**: Address resolution and distance verification.

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js** ≥ 18
-   **Supabase** project (free tier works)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Dyrane/boxdrop.git
cd boxdrop

# 2. Install dependencies
npm install

# 3. Environment Setup
cp .env.example .env.local
# Add your NEXT_PUBLIC_SUPABASE_URL and ANON_KEY

# 4. Hydrate Database (The Magic Step)
npx tsx scripts/db_seed.ts

# 5. Start development server
npm run dev
```

---

## 🗺 Roadmap

### Phase 1 — Foundation ✅
- [x] Project setup (Next.js 14, Tailwind, Supabase)
- [x] Design system implementation (Alexander Canon)
- [x] Auth flow (Email/Phone OTP)
- [x] Database schema + RLS policies

### Phase 2 — Core Experience ✅
- [x] Marketplace home (Bento Grid, Spotlight)
- [x] Vendor Detail (Immersive Header, Parallax)
- [x] Cart management (Zustand, Persistent Pill)
- [x] High-Fidelity Seed Data (120+ Vendors, Imagery)

### Phase 3 — Logistics Simulation ✅
- [x] Real-time Order Tracking (Mapbox)
- [x] Visual Courier Simulation
- [x] Distance & ETA Calculation
- [x] Smart Currency & Localization

### Phase 4 — Monetization & Scale (Next)
- [ ] Stripe Payment Integration
- [ ] Dedicated Courier App (PWA)
- [ ] Vendor Dashboard (Admin)
- [ ] Push Notifications (OneSignal/Twilio)
- [ ] PWA Optimization (Offline Support, Install Prompt)

---

## 🏛 Design System Quick Reference

For AI assistants and contributors — the non-negotiable constraints:

```
┌─────────────────────────────────────────────────────┐
│                  THE BOXDROP LAW                     │
│                                                     │
│  ✗  border, border-width, border-color              │
│  ✗  Spinning loaders                                │
│  ✗  Flat, lifeless interactions                     │
│  ✗  Color without semantic meaning                  │
│  ✗  Direct Supabase calls in UI                     │
│                                                     │
│  ✓  backdrop-blur-md + bg-white/10 (frosted glass)  │
│  ✓  shadow-sm, shadow-md, shadow-lg (depth)         │
│  ✓  Shimmer skeleton loaders                        │
│  ✓  Scale-down on press, glide-up on hover          │
│  ✓  Black & White monochrome palette                │
│  ✓  Progressive disclosure everywhere               │
└─────────────────────────────────────────────────────┘
```

---

<p align="center">
  <strong>BoxDrop</strong> — Depth over decoration. Glass over borders. Premium over quick.
</p>