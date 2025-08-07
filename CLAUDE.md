# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
pnpm run dev
# or
npm run dev
```
Development server runs on `http://localhost:5173`

**Build for production:**
```bash
pnpm run build
# or 
npm run build
```
Built files are output to the `dist/` directory.

**Lint code:**
```bash
pnpm run lint
# or
npm run lint
```

**Preview production build:**
```bash
pnpm run preview
# or
npm run preview
```

**Package manager:** This project uses pnpm (preferred) or npm. The pnpm lockfile is included.

## Architecture Overview

This is a React-based dashboard application for revenue projections and brand management built with:

- **Framework:** React 19 + Vite
- **UI:** shadcn/ui components with Tailwind CSS
- **Charts:** Recharts library
- **State Management:** React Context + localStorage persistence
- **Authentication:** Simple localStorage-based auth system
- **Routing:** React Router DOM

### Core Architecture Patterns

**Context-based State Management:**
- `AuthContext` handles user authentication (admin/guest roles)
- `BrandContext` manages brand data with localStorage persistence  
- `CloudBrandContext` manages cloud-specific brand data

**Component Structure:**
- `src/components/ui/` contains reusable shadcn/ui components
- `src/pages/` contains main page components
- `src/contexts/` contains React context providers
- `src/utils/revenueCalculations.js` contains core business logic

**Revenue Calculation System:**
The app uses a sophisticated revenue projection system with:
- Monthly growth calculations with compound interest
- Brand-specific starting months and growth rates
- Quarterly aggregations and volatility calculations
- Commission rate tracking

### Key Business Logic

**Default Authentication Credentials:**
- Admin: `admin` / `admin123` (full access)
- Guest: `guest` / `guest123` (read-only)

**Brand Data Structure:**
```javascript
{
  id: number,
  name: string,
  category: string,
  startingSales: number,
  monthlyGrowthRate: number,
  startingMonth: number (0-11, maps to Oct 2025 - Sep 2026)
}
```

**Revenue Projections:**
- 12-month projection period: Oct 2025 - Sep 2026
- Compound monthly growth calculations
- Support for different brand starting months
- Real-time calculations with localStorage persistence

## Data Persistence

**Brand Data:** Stored in localStorage as `zid-global-brands`
**User Session:** Stored in localStorage as `zid_user`

All data persists across browser sessions and tabs. The app falls back to default data if localStorage is corrupted.

## Development Notes

**shadcn/ui Integration:** Components are pre-configured with proper theming. Use existing components from `src/components/ui/` rather than adding new UI libraries.

**Tailwind Configuration:** Uses Tailwind v4 with the new Vite plugin. Custom colors and animations are configured.

**Path Aliases:** `@/` maps to `src/` directory for cleaner imports.

**Revenue Calculations:** All business logic is centralized in `src/utils/revenueCalculations.js`. This file contains the core algorithms for projections, aggregations, and formatting.

## Backend API & Database

**API Routes:** Located in `/api/` directory for Vercel serverless functions
- `api/brands.js` - CRUD operations for brand data
- `api/reset.js` - Reset brands to default data

**Database:** Uses Vercel KV (Redis) for persistent data storage across devices

**Context Switching:** 
- `BrandContext` - localStorage only (local development)
- `ApiContext` - API + Vercel KV (production deployment)

## Deployment to Vercel

**Prerequisites:**
1. Vercel account
2. Vercel CLI: `npm i -g vercel`

**Deploy Steps:**
1. `vercel` - Initial deployment
2. Add Vercel KV database in dashboard
3. Environment variables auto-configured
4. Data persists across all devices

**Production URL Structure:**
- Frontend: `your-app.vercel.app`  
- API: `your-app.vercel.app/api/brands`