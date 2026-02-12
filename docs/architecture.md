# Architecture & Data Flow 🏗️

BoxDrop follows a strict unidirectional data flow to ensure scalability and ease of debugging.

## 🧱 The Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL + PostGIS)
- **UI:** Gluestack UI + Tailwind CSS
- **State:** TanStack Query (Server) + Zustand (Client)

## 🔄 Unidirectional Flow
```
Provider → UI Component → Custom Hook → Service Layer → Database
```

### 1. The Pure UI Rule
Components are forbidden from calling data-fetching logic directly. They must use Custom Hooks.

### 2. Service Layer
Pure functions located in `core/services/` that handle all Supabase interactions.

### 3. Client Stores
Zustand stores in `core/store/` for ephemeral UI state (Cart, Navbar Collapse, Theme).

## 🌍 Global Layouts
- **MainLayout:** Handles the adaptive navigation breakpoints and scroll-awareness.
- **AuthLayout:** Optimized for high-conversion, focused entry.
- **ScreenShell:** The standard content container for all marketplace views.
