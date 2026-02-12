# BoxDrop 📦

> **A premium logistics & delivery PWA built with a "Glass & Depth" design philosophy.**

| | |
|---|---|
| **Status** | Phase 3 — Real-time & Delivery Tracking |
| **Type** | Progressive Web App (PWA) |
| **Stack** | Next.js 15 · Supabase · Mapbox · Zustand |
| **License** | Proprietary |

---

## Table of Contents

- [Vision](#-vision)
- [Design System — The BoxDrop Law](#-design-system--the-boxdrop-law)
- [Tech Stack](#-tech-stack)
- [Architecture & Data Flow](#-architecture--data-flow)
- [File Structure](#-file-structure)
- [Database Schema](#-database-schema)
- [Auth & Security](#-auth--security)
- [Core Features](#-core-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Roadmap](#-roadmap)
- [Documentation Hub](./docs/index.md) 🏛️

---

## 🎯 Vision

BoxDrop is a **three-sided logistics marketplace** connecting **Users**, **Vendors**, and **Couriers** through a single, premium interface.

Unlike standard delivery utilities, BoxDrop treats visual quality as infrastructure — not decoration. Every screen, every interaction, every loading state is intentionally designed. The product should feel **expensive, calm, and effortless**.

### Core Principles

1. **Premium First** — The UI must feel high-end before it feels feature-rich.
2. **PWA Native** — Web-first, but indistinguishable from a native app on mobile.
3. **Real-time by Default** — Order tracking, status updates, and courier positions are live.
4. **Modular Architecture** — Every layer has a single responsibility. Nothing leaks.

---

## 🎨 Design System — The BoxDrop Law

**These rules are immutable. No exceptions.**

### 1. The No-Border Rule

> You are **strictly forbidden** from using CSS borders (`border`, `border-width`) to separate elements.

Visual separation is achieved exclusively through:

| Technique | Implementation |
|---|---|
| **Frosted Glass** | `backdrop-blur-md`, `bg-white/10`, `bg-black/5` |
| **Depth & Elevation** | `shadow-sm` for subtle lift, `shadow-lg` for floating elements |
| **Opacity Layers** | `bg-card/20`, `bg-background/80` with `backdrop-filter` |
| **Whitespace** | Generous padding and margins — silence is luxury |

### 2. Aesthetic

- **Palette:** Black & White monochrome. High contrast. Minimalist.
- **Color Rule:** Color = state, not decoration. If it doesn't change meaning, remove it.
- **Typography:** Size, weight, and spacing communicate hierarchy. Weak type = cheap product.
- **White Space:** Intentional silence. Noise is expensive.

### 3. Interaction & Motion

| Element | Behavior |
|---|---|
| **Buttons** | Slight scale-down on press. Never bounce. |
| **Cards** | Glide up on hover/focus. |
| **Modals** | Slide up from bottom (mobile) or fade in with blur (desktop). |
| **Page Transitions** | Preserve spatial memory — show where you came from. |
| **Loading** | Shimmer skeletons that match exact layout. Never spinners. |

### 4. Progressive Disclosure

- Show only what's needed *now*.
- Secondary actions (Edit, Details, Delete) appear on `hover` (desktop) or `tap` (mobile).
- Search bars expand on focus.
- Forms reveal one input at a time.

### 5. State is Design

Every possible state is intentionally designed:

- **Loading** → Shimmer skeletons matching content layout
- **Empty** → Clear, useful empty states with a next step
- **Error** → Composed, never panicked. Always recoverable.
- **Partial** → Gracefully handled. No broken layouts.

### 6. The Pure UI Rule

> You are **strictly forbidden** from calling Supabase or any direct data-fetching logic inside a UI Component (`app/**/*` or `components/**/*`).

The UI must remain "logic-free." All data interactions must follow this mandate:
- **UI** calls a **Custom Hook**.
- **Hook** calls a **Service**.
- **Service** calls **Supabase**.

This ensures components are reusable, testable, and the architecture remains predictable.

---

## 🔧 Tech Stack

### Core

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR, routing, API routes |
| **Language** | TypeScript (strict) | Type safety across the stack |
| **UI Library** | Gluestack UI | Cross-platform Web/Expo compatibility |
| **Styling** | Tailwind CSS + NativeWind v4 | Utility-first CSS, future Expo support |
| **Icons** | Lucide React | Consistent, tree-shakeable icon set |

### State Management

| Type | Technology | Use Case |
|---|---|---|
| **Server State** | TanStack Query (React Query) | Caching, optimistic updates, background refetching |
| **Client State** | Zustand | Cart, user preferences, session data |

### Backend (Supabase)

| Feature | Use Case |
|---|---|
| **PostgreSQL** | Primary database |
| **Auth** | Phone/Email OTP authentication |
| **Realtime** | Live order tracking subscriptions |
| **Storage** | Product images, avatars |
| **RLS** | Row Level Security on every table |

### Infrastructure (Future)

| Service | Purpose |
|---|---|
| **Mapbox / Google Maps** | Route calculation, delivery tracking, distance-based fees |
| **Stripe** | Payment processing, vendor payouts |
| **Twilio / Resend** | SMS notifications, email receipts |

---

## 🏗 Architecture & Data Flow

BoxDrop follows a **strict unidirectional data flow**. Each layer has exactly one job.

```
Provider → UI Component → Custom Hook → Service Layer → Zustand Store → Database (Supabase)
```

| Layer | Responsibility | Example |
|---|---|---|
| **Provider** | Wraps the app with context | `ThemeProvider`, `AuthProvider`, `QueryProvider` |
| **UI Component** | Renders data. No logic. | `ProductCard`, `OrderRow` |
| **Custom Hook** | Connects UI to services. Local logic. | `useCart`, `useAuth`, `useOrders` |
| **Service Layer** | Pure functions that call Supabase. No UI. | `fetchProducts()`, `createOrder()` |
| **Store (Zustand)** | Global client state. | `useCartStore`, `useUserStore` |
| **Database** | Source of truth. | Supabase PostgreSQL |

### Why `app/api` Still Exists

While Supabase handles most data access directly, `app/api` routes are required for:

1. **Webhooks** — Stripe payment confirmations, delivery status callbacks
2. **Admin Operations** — Service Role access (bypasses RLS) for batch operations, payouts
3. **Third-Party Integrations** — Secure SMS/Email dispatch via server-side keys

---

## 📂 File Structure

Root-level structure. **No `/src` directory.** Next.js 15 App Router conventions.

```
/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Authentication Routes
│   │   ├── login/page.tsx         # Login screen
│   │   ├── signup/page.tsx        # Signup screen
│   │   └── layout.tsx            # Auth layout (clean, no tabs)
│   │
│   ├── (main)/                    # Protected App Routes
│   │   ├── (tabs)/               # Main Tab Navigation
│   │   │   ├── page.tsx          # Home / Marketplace
│   │   │   ├── search/page.tsx   # Explore
│   │   │   ├── orders/page.tsx   # Active Orders
│   │   │   ├── profile/page.tsx  # User Profile
│   │   │   └── layout.tsx       # Tab bar layout (Glassmorphism)
│   │   │
│   │   └── product/[id]/         # Product Detail (Stack Screen)
│   │       └── page.tsx
│   │
│   ├── api/                       # Server-side (Webhooks, Admin)
│   ├── layout.tsx                 # Root Layout (Fonts, Providers)
│   └── globals.css                # Tailwind + design token imports
│
├── components/                    # React Components
│   ├── ui/                        # Gluestack/Primitive UI (Button, Input)
│   ├── shared/                    # Business Components (GlassCard, OrderRow, DiscoveryMap)
│   ├── layout/                    # Layout wrappers (ScreenShell, KeyboardAvoid)
│   └── animations/                # Animation wrappers (Framer Motion)
│
├── core/                          # Business Logic (Non-UI)
│   ├── services/                  # Supabase Data Layer (fetchProducts, createOrder)
│   ├── store/                     # Zustand Stores (useCartStore, useUserStore)
│   ├── hooks/                     # Custom Hooks (useAuth, useOrders, useCart)
│   └── utils/                     # Formatters, Validators, Constants
│
├── lib/                           # Configuration
│   └── supabase.ts                # Supabase Client (server + client)
│
├── types/                         # TypeScript Interfaces (DB Schema, Props)
│
└── public/                        # Static Assets (Images, Icons, PWA Manifest)
```

---

## 📦 Database Schema

The schema supports a **three-sided marketplace** from Day 1: Users, Vendors, and Couriers.

### Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `profiles` | All user accounts | `id`, `role` (user/vendor/courier), `phone`, `email`, `avatar_url`, `full_name` |
| `vendors` | Business entities | `id`, `owner_id` → profiles, `name`, `location`, `rating`, `is_featured`, `logo_url` |
| `products` | Vendor inventory | `id`, `vendor_id` → vendors, `name`, `price`, `image_url`, `stock`, `category` |
| `orders` | Transaction records | `id`, `user_id` → profiles, `vendor_id`, `courier_id`, `status`, `total`, `delivery_location` |
| `order_items` | Line items per order | `id`, `order_id` → orders, `product_id` → products, `quantity`, `unit_price` |

### Order Status Flow

```
pending → confirmed → preparing → picked_up → in_transit → delivered
                                                          → cancelled
```

### Security

- **RLS enabled on every table.**
- Users can only read/write their own data.
- Vendors can only manage their own products and orders.
- Couriers can only see orders assigned to them.

---

## 🔐 Auth & Security

| Aspect | Implementation |
|---|---|
| **Provider** | Supabase Auth |
| **Methods** | Email OTP, Phone OTP |
| **Flow** | Progressive profiling — signup creates a minimal profile, enriched on first order |
| **Protection** | `useAuth` hook redirects unauthenticated users away from `(main)` routes |
| **RLS** | Strict Row Level Security on all tables |

---

## ⚡ Core Features

### Smart App Shell

- **Glassmorphism Tab Bar** — Frosted glass bottom navigation, hidden on auth and detail screens
- **ScreenShell** — Unified wrapper handling SafeArea, padding, skeleton loading states
- **Responsive** — Touch-action manipulation prevents pull-to-refresh on web mobile. Smart viewport meta tags handle notches.

### Marketplace (Home)

- Vendor grid rendered with `GlassCard` components
- Progressive disclosure search bar (expands on focus)
- Category filtering with horizontal scroll chips

### Cart & Ordering

- Zustand-powered cart with optimistic updates
- Order creation through Service Layer → Supabase
- Real-time order status via Supabase Realtime subscriptions
- Order Search & Geocoding (Mapbox integration)

### Real-time Tracking & Map (Phase 3)

- **Theme-Sensitive Maps** — Adaptive styles (`light-v11` / `dark-v11`) syncing with system/user theme.
- **Street-Level Logistics** — Zoom level 15+ focus with high-resolution telemetry.
- **Responsive Telemetry** — Vertical timeline and split-panel tracking on desktop.
- **Geocoding Hub** — Predictive address search via Mapbox/Google APIs.

### Live Tracking (Planned)

- Map-based courier tracking
- Distance/fee calculation via mapping API
- Push notifications for status transitions

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (preferred package manager)
- **Supabase** project (free tier works)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Dyrane/boxdrop.git
cd boxdrop

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Start development server
pnpm dev
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mapping (when implemented)
# NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Payments (when implemented)
# STRIPE_SECRET_KEY=your_stripe_secret
# STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

## 🗺 Roadmap

### Phase 1 — Foundation

- [x] Project setup (Next.js 15, Tailwind, Gluestack, Supabase)
- [x] Design system implementation (GlassCard, ScreenShell, theme tokens)
- [x] Auth flow (Email/Phone OTP, protected routes)
- [x] Database schema + seed data (5 vendors, 20 products)

### Phase 2 — Core Experience ✅

- [x] Marketplace home (adaptive navigation, search droplet, categories)
- [x] Product detail view (premium glide-up interaction)
- [x] Cart management (Zustand store, optimistic UI)
- [x] Order creation and confirmation flow (Success interactions)

### Phase 3 — Real-time & Delivery ✅ (In Progress)

- [x] Order status tracking (Supabase Realtime)
- [x] Map integration (Mapbox Navigation & standard styles)
- [x] Theme-aware Map styles (Grayscale Light/Dark)
- [x] Responsive Tracking Panel (Desktop split-view)
- [ ] Courier assignment and tracking
- [ ] Distance-based delivery fee calculation

### Phase 4 — Monetization & Scale

- [ ] Stripe payment integration
- [ ] Vendor dashboard
- [ ] Courier app view
- [ ] Push notifications (SMS/Email)
- [ ] PWA optimization (offline support, install prompt)

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