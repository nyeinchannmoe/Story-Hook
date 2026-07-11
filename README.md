# Story Hook

Story Hook is a bilingual (English / Myanmar) web application for discovering and exploring curated Asian dramas. Users can browse a drama catalog, open detailed synopses, view cast information and stills, and follow external watch links.

**Version:** 1.0.0 · **Package name:** `story-hook`

## Key features

- Browse a curated grid of Asian dramas with cover art, ratings, and story previews
- View full drama detail pages (synopsis, cast, photo gallery, metadata, watch link)
- Bilingual presentation: English titles plus Myanmar (`mmTitle`) titles and synopses
- Client-side SEO helpers (document title, Open Graph, Twitter meta tags)
- Responsive dark UI with glassmorphism accents and Tailwind CSS v4 design tokens
- Route-level code splitting and a dedicated 404 page
- Image fallbacks to a local placeholder when remote assets fail

## Screenshots

> Add screenshots here after capturing the home grid and a detail page in development or production.

| View | Description |
|------|-------------|
| Home | Drama discovery grid at `/home` |
| Detail | Full drama page at `/detail/:uuid` |
| 404 | Not-found state for unknown routes |

---

# Project Overview

## Business purpose

Story Hook helps readers discover Asian dramas with rich, Myanmar-language story summaries alongside English titles and metadata. Content is maintained as static JSON in the repository (no backend API in the current implementation).

## Target users

- Myanmar-speaking drama fans who want synopses and cast context in Myanmar script
- Casual browsers looking for ratings, episode counts, air dates, and watch links
- Developers extending the catalog by editing `src/data/stories.json`

## Main workflows

```text
Landing (/) ──redirect──► Home (/home)
                              │
                              ▼
                     Story grid (cards)
                              │
                              ▼
                   Detail (/detail/:uuid)
                     ├── Story synopsis
                     ├── Cast list
                     ├── Photo gallery (+ lightbox)
                     └── Watch Now (external URL)
```

1. **Browse** — Open `/home`, wait for the short loading skeleton, then scan drama cards.
2. **Open details** — Click a card or “View Details” to load `/detail/:uuid`.
3. **Explore media** — Read the synopsis, review cast roles, open stills in the lightbox.
4. **Watch** — If `watchLink` is a valid absolute URL, use “Watch Now” (opens in a new tab).
5. **Recover** — Unknown routes show the 404 page; missing UUIDs show an empty state with a link home.

## Feature summary

| Feature | Implementation |
|---------|----------------|
| Drama catalog | `useStories` + `stories.json` |
| Detail view | `useStory(uuid)` + `DetailPage` |
| Photo lightbox | Local state in `PhotoGallery` |
| SEO meta | `SEO` component (`useEffect` DOM updates) |
| Scroll reset | `ScrollToTop` on pathname change |
| SPA hosting | `vercel.json` rewrite to `index.html` |

---

# Technology Stack

| Category | Technology | Version (from `package.json`) |
|----------|------------|-------------------------------|
| UI library | React | ^19.1.0 |
| React DOM | react-dom | ^19.1.0 |
| Language | TypeScript | ~5.8.3 |
| Module system | ES modules (`"type": "module"`) | — |
| Build tool | Vite | ^6.3.5 |
| React plugin | `@vitejs/plugin-react` | ^4.5.2 |
| Routing | react-router-dom | ^7.6.3 |
| Styling | Tailwind CSS | ^4.1.11 |
| Tailwind Vite plugin | `@tailwindcss/vite` | ^4.1.11 |
| State management | React local state (`useState` / `useEffect` / hooks) | — |
| Data source | Static JSON import (`src/data/stories.json`) | — |
| API client | None | — |
| Global store (Redux, Zustand, etc.) | None | — |
| UI component library (MUI, etc.) | None (custom components) | — |
| Testing libraries | None configured | — |
| Linting | ESLint 9 + typescript-eslint + React Hooks / Refresh plugins | See `eslint.config.js` |
| Formatting | No Prettier (or similar) configured in the repo | — |
| Hosting config | Vercel (`vercel.json`) | — |
| Fonts | Inter + Noto Sans Myanmar (Google Fonts) | Linked in `index.html` |

**Node.js requirement (via Vite 6):** `^18.0.0 || ^20.0.0 || >=22.0.0`

**Package manager:** npm (lockfile: `package-lock.json`, lockfileVersion 3)

---

# Project Architecture

## Architectural pattern

The app is a **client-side SPA** with a **feature-oriented folder layout**:

- **Presentation** — pages and reusable UI components
- **Layout shell** — `MainLayout` (header, scroll reset, outlet, footer)
- **Data access** — custom hooks that load typed static JSON
- **Domain types & utils** — shared TypeScript interfaces and pure helpers
- **Routing** — React Router data API (`createBrowserRouter` + `RouterProvider`)

There is no server layer, GraphQL, or REST client in this repository.

## Data flow

```text
stories.json
     │  (static import at build/bundle time)
     ▼
useStories() / useStory(uuid)
     │  local React state: stories, loading, error
     ▼
HomePage / DetailPage
     │
     ▼
StoryGrid → StoryCard  |  CastCard, PhotoGallery, RatingBadge, …
```

`useStories` simulates async loading with a **400ms** `setTimeout` before assigning the imported JSON to state (loading skeleton UX). `useStory` reuses `useStories` and finds one item by `uuid`.

## Component organization

- **Pages** (`src/pages/`) — route-level screens; default-exported and lazy-loaded
- **Layouts** (`src/layouts/`) — shared chrome around `<Outlet />`
- **Components** (`src/components/`) — presentational UI; barrel-exported from `index.ts`
- **Hooks** (`src/hooks/`) — data loading for stories
- **Utils** (`src/utils/`) — pure helpers for ratings, text, images, URLs
- **Constants** (`src/constants/`) — app name, routes, placeholders
- **Types** (`src/types/`) — `Story` / `CastMember` interfaces

## State management flow

| Scope | Mechanism | Examples |
|-------|-----------|----------|
| Story list / detail data | `useStories` / `useStory` | `stories`, `loading`, `error` |
| Lightbox selection | `useState` in `PhotoGallery` | `selectedIndex` |
| Document meta | `SEO` `useEffect` | `document.title`, meta tags |
| Scroll position | `ScrollToTop` `useLayoutEffect` | reset on `pathname` |

No Context providers, Redux, or remote cache libraries are used.

## API communication flow

**Not applicable as a remote API.** Content is bundled via:

```ts
import storiesData from '@/data/stories.json';
```

External URLs appear only as:

- Image `src` values (MyDramaList, TMDB, etc. in JSON)
- Optional `watchLink` anchors (`target="_blank"` + `rel="noopener noreferrer"`)

---

# Project Structure

```text
Story-Hook/
├── public/
│   ├── favicon.svg              # Site favicon
│   └── placeholder-drama.svg    # Fallback image for missing/broken covers
├── src/
│   ├── assets/                  # Reserved for bundled static assets (.gitkeep)
│   ├── components/              # Reusable UI components + barrel export
│   │   ├── CastCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSkeleton.tsx  # Grid + detail skeletons
│   │   ├── PageContainer.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── RatingBadge.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── SEO.tsx
│   │   ├── StoryCard.tsx
│   │   ├── StoryGrid.tsx
│   │   └── index.ts
│   ├── constants/               # APP_NAME, ROUTES, PLACEHOLDER_IMAGE, …
│   ├── data/
│   │   └── stories.json         # Drama catalog (source of truth)
│   ├── hooks/
│   │   └── useStories.ts        # useStories + useStory
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── DetailPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── routes/
│   │   └── index.tsx            # createBrowserRouter + AppRouter
│   ├── styles/
│   │   └── index.css            # Tailwind import + @theme tokens + utilities
│   ├── types/
│   │   └── story.ts             # Story, CastMember
│   ├── utils/
│   │   ├── image.ts             # getImageSrc, handleImageError
│   │   ├── story.ts             # preview, rating parse, URL validation, …
│   │   └── index.ts             # Additional / overlapping helpers
│   ├── main.tsx                 # React root + StrictMode
│   └── vite-env.d.ts            # Vite client types
├── dist/                        # Production build output (gitignored)
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json                # Project references
├── tsconfig.app.json            # App TS config (strict, @ path alias)
├── tsconfig.node.json           # Vite config TS
├── vercel.json                  # SPA rewrites + asset cache headers
├── vite.config.ts
└── README.md
```

### Path alias

`@/*` maps to `src/*` (configured in `vite.config.ts` and `tsconfig.app.json`).

---

# Installation

## Prerequisites

- **Node.js** `18`, `20`, or `22+` (Vite 6 engines field)
- **npm** (ships with Node; project uses `package-lock.json`)

## Steps

```bash
# Clone the repository
git clone <repository-url>
cd Story-Hook

# Install dependencies
npm install
```

---

# Environment Setup

This project **does not define or require environment variables**.

- No `.env`, `.env.example`, or `.env.*` files are present
- No `import.meta.env` / `VITE_*` usage appears in the source
- `src/vite-env.d.ts` only references Vite’s default client types

### Development vs production

| Mode | How it works |
|------|----------------|
| Development | `npm run dev` — Vite HMR; JSON imported into the client bundle |
| Production | `npm run build` — Typecheck + Vite build to `dist/`; same static data |

If you later add secrets or API base URLs, use Vite’s `VITE_` prefix and document them here.

---

# Running the Project

Commands below match `package.json` scripts exactly.

```bash
# Install dependencies
npm install

# Start development server (Vite default: http://localhost:5173)
npm run dev

# Lint all ESLint-targeted files
npm run lint

# Typecheck and build for production
npm run build

# Preview the production build locally
npm run preview
```

**Tests:** There is no `test` (or coverage) script and no test files in the repository.

---

# Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start the Vite development server with HMR |
| `build` | `tsc -b && vite build` | Run TypeScript project build (`tsc -b`), then produce optimized assets in `dist/` |
| `lint` | `eslint .` | Lint the project with flat-config ESLint (`eslint.config.js`); `dist` is ignored |
| `preview` | `vite preview` | Serve the contents of `dist/` for a local production smoke test |

---

# Development Guidelines

## Coding standards

- **TypeScript strict mode** is enabled (`strict`, `noUnusedLocals`, `noUnusedParameters`, etc. in `tsconfig.app.json`)
- Prefer **named exports** for components; pages use **default exports** to support `React.lazy`
- Import via the **`@/`** alias rather than deep relative paths where practical
- Re-export public UI from `src/components/index.ts`

## Naming conventions

| Kind | Convention | Example |
|------|------------|---------|
| Components | PascalCase files | `StoryCard.tsx` |
| Hooks | `use` + camelCase | `useStories.ts` |
| Utils | camelCase functions | `getStoryPreview` |
| Constants | UPPER_SNAKE / const objects | `ROUTES`, `APP_NAME` |
| Types / interfaces | PascalCase | `Story`, `CastMember` |
| Routes | lowercase path segments | `/home`, `/detail/:uuid` |

## Component structure conventions

1. Imports (React, router, local modules)
2. Props interface (when needed)
3. Component function
4. JSX with Tailwind utility classes
5. Accessibility: `aria-*`, semantic landmarks (`header`, `main`, `footer`, `section`)

## Folder organization guidelines

- Put route screens in `pages/`
- Put shared chrome in `layouts/`
- Put reusable UI in `components/`
- Put catalog content in `data/stories.json` (keep shape aligned with `types/story.ts`)
- Prefer `utils/story.ts` and `utils/image.ts` for helpers used by pages/components (those are the imports in use today)

## Best practices used in the project

- Lazy-load pages with `Suspense` + `LoadingSkeleton`
- Validate external watch URLs before rendering the CTA (`isValidUrl`)
- Soft-fail images with `handleImageError` → `/placeholder-drama.svg`
- Use `rel="noopener noreferrer"` on external links
- Keep SEO updates centralized in `SEO`

### Adding a drama

Append an object to `src/data/stories.json` matching:

```ts
interface Story {
  uuid: string;
  title: string;
  mmTitle: string;
  story: string;
  country: string;
  rating: string;      // e.g. "8.8/10"
  watchLink: string;
  episodes: number;
  aired: string;
  cast: CastMember[];
  photos: string[];
  coverPhoto: string;
}
```

Use a unique `uuid` for the detail route `/detail/:uuid`.

---

# API Integration

## Current architecture

Story Hook is a **static-data SPA**. There is no HTTP service layer, authentication flow, or API error contract.

| Concern | Status |
|---------|--------|
| API architecture | Local JSON module import |
| Request flow | Sync read after artificial delay in `useStories` |
| Authentication | None |
| Error handling | Try/catch around JSON shape checks; UI `EmptyState` + refetch on home |
| Service layer | None (`hooks/useStories.ts` is the data boundary) |

## Request / load flow (as implemented)

```text
Mount HomePage or DetailPage
        │
        ▼
useStories() sets loading=true
        │
        ▼
setTimeout(400ms) → assign storiesData as Story[]
        │
        ├─ success → stories state, loading=false
        └─ throw   → error message, stories=[], loading=false
```

Home exposes `refetch` (re-runs `loadStories`). Detail uses `useStory(uuid)` and shows not-found UI when the UUID is absent after load.

## Future remote API (guidance only)

If you introduce a backend, keep the hook signatures (`stories`, `loading`, `error`, `refetch`) and replace the JSON import with `fetch` / a thin `services/` module so pages stay unchanged.

---

# State Management

## Solution

**React built-in hooks only** — no third-party global state library.

## Global state flow

There is **no global store**. Each call to `useStories` / `useStory` owns its own state instance. Navigating between home and detail remounts pages and reloads data (including the 400ms delay).

## Local state usage

- Loading / error / list in `useStories`
- Lightbox index in `PhotoGallery`
- Imperative document title/meta in `SEO`
- Scroll restoration flags in `ScrollToTop`

## Data caching strategy

- **Build-time:** `stories.json` is bundled by Vite
- **Runtime:** In-memory React state only; no SWR/React Query/localStorage cache
- **CDN (deployed assets):** `vercel.json` sets long-cache headers for `/assets/*`

---

# Styling Guide

## Framework

**Tailwind CSS v4** via `@import 'tailwindcss'` and the `@tailwindcss/vite` plugin. Theme tokens live in `src/styles/index.css` under `@theme`.

## Theme structure (design tokens)

| Token | Role | Example value |
|-------|------|----------------|
| `--color-bg-primary` | Page background | `#0a0a0f` |
| `--color-bg-secondary` | Footer / secondary surfaces | `#12121a` |
| `--color-bg-card` | Cards | `#1a1a24` |
| `--color-accent` | Brand red | `#e50914` |
| `--color-text-primary` / `-secondary` / `-muted` | Typography hierarchy | `#f5f5f7` / `#a1a1aa` / `#71717a` |
| `--font-sans` | UI font | Inter |
| `--font-myanmar` | Myanmar text | Noto Sans Myanmar |

Utility classes defined in-repo: `.font-myanmar`, `.glass`, `.gradient-hero`, `.gradient-accent`, `.line-clamp-3`, `.text-gradient`.

## Organization

- Global styles: `src/styles/index.css` (imported once from `main.tsx`)
- Component styles: Tailwind utility classes in TSX (no CSS Modules / SCSS)

## Responsive design

Breakpoints used throughout components (`sm:`, `lg:`):

- Story grid: 1 → 2 → 3 columns
- Detail hero and cast grids adapt at `sm` / `lg`
- Header and footer stack on small screens

## Reusable UI patterns

- **Cards** — `bg-bg-card` + subtle border + hover lift (`StoryCard`)
- **Glass header** — sticky `.glass` bar
- **Accent CTAs** — `.gradient-accent` buttons/links
- **Empty / loading** — `EmptyState`, `LoadingSkeleton`, `DetailSkeleton`
- **Badges** — `RatingBadge` with parsed `value/max`

---

# Build and Deployment

## Build process

```bash
npm run build
```

1. `tsc -b` — TypeScript project references build (typecheck; `noEmit` on app config)
2. `vite build` — Bundle to `dist/`

### Manual chunking (`vite.config.ts`)

React, React DOM, and React Router are split into a `vendor` chunk for caching.

## Output artifacts

Typical `dist/` contents:

```text
dist/
├── index.html
├── favicon.svg
├── placeholder-drama.svg
└── assets/          # hashed JS/CSS chunks
```

## Deployment requirements

- Static file hosting capable of serving `index.html` for all client routes
- HTTPS recommended for production
- No server-side Node process required at runtime

## Vercel deployment

`vercel.json` configures:

1. **SPA rewrite** — `/(.*)` → `/index.html` so `/home` and `/detail/:uuid` work on refresh
2. **Asset caching** — `/assets/(.*)` → `Cache-Control: public, max-age=31536000, immutable`

### Deploy steps (typical)

1. Push the repository to GitHub/GitLab/Bitbucket
2. Import the project in [Vercel](https://vercel.com)
3. Framework preset: Vite (or leave defaults; build `npm run build`, output `dist`)
4. No environment variables required for the current app
5. Deploy

Local production check before deploy:

```bash
npm run build
npm run preview
```

---

# Performance Optimization

Detected optimizations in this codebase:

| Technique | Where |
|-----------|--------|
| Route-level code splitting | `lazy()` for `HomePage`, `DetailPage`, `NotFoundPage` |
| Suspense fallbacks | `PageLoader` / `LoadingSkeleton` |
| Vendor manual chunk | `manualChunks.vendor` in `vite.config.ts` |
| Lazy images | `loading="lazy"` + `decoding="async"` on cards/gallery |
| Font preconnect | `preconnect` to Google Fonts in `index.html` |
| Long-lived hashed assets | Vite content hashes + Vercel `/assets` cache headers |
| Image error isolation | Placeholder swap avoids broken-image layout thrash |

**Not present:** React `memo` / `useMemo` / `useCallback` for list virtualization; no service worker / PWA cache.

---

# Testing

## Status

No testing framework, test files (`*.test.*` / `*.spec.*`), or coverage tooling is configured.

| Item | Value |
|------|--------|
| Testing framework | None |
| Test structure | N/A |
| Run tests | N/A — no script |
| Coverage | N/A |

### Suggested addition (when you introduce tests)

Common fit for this stack: Vitest + React Testing Library, with a `test` script in `package.json`. Prefer testing hooks (`useStories` shape validation) and critical utils (`parseRating`, `isValidUrl`, `getImageSrc`).

---

# Troubleshooting

| Issue | Likely cause | Solution |
|-------|--------------|----------|
| Blank page on refresh of `/home` or `/detail/...` in production | Host does not fall back to `index.html` | Use `vercel.json` rewrites or equivalent SPA fallback on your host |
| `npm run build` fails on TypeScript | Unused locals/params or type errors under strict settings | Fix reported `tsc` errors; `build` runs `tsc -b` first |
| ESLint warnings on Fast Refresh | Exporting non-components from a component file | Follow `react-refresh/only-export-components` (constants allowed via config) |
| Images show placeholder | Empty `coverPhoto`/`photos` or remote 404/CORS | Check URLs in `stories.json`; placeholder is expected on failure |
| “Watch Now” missing | Invalid `watchLink` | Must be a parseable absolute URL (`new URL(...)`) |
| Drama not found on detail | UUID mismatch | Confirm `uuid` in JSON matches the path segment |
| Node engine errors from Vite | Unsupported Node version | Use Node 18, 20, or 22+ |
| Port already in use | Another process on 5173 | Stop the other process or start Vite with `npx vite --port <port>` |
| Styles missing | CSS not loaded | Ensure `@/styles/index.css` remains imported from `main.tsx` |

---

# Contributing

## Suggested workflow

1. Create a feature branch from the default branch
2. Install with `npm install`
3. Develop with `npm run dev`
4. Run `npm run lint` and `npm run build` before opening a PR
5. Keep drama content changes in `src/data/stories.json` typed to `Story`
6. Prefer small, focused PRs (UI vs content vs tooling)

## Code review checklist

- [ ] Types align with `src/types/story.ts`
- [ ] New UI is accessible (labels, focus styles, keyboard for lightbox where applicable)
- [ ] No secrets committed (none are required today)
- [ ] Production build succeeds

---

# License

License information is not included in this repository yet.

> **TODO:** Add a `LICENSE` file (for example MIT) and update this section with the chosen license name and copyright holder.

---

# Routing reference

| Path | Component | Notes |
|------|-----------|--------|
| `/` | `Navigate` → `/home` | Index redirect |
| `/home` | `HomePage` (lazy) | Catalog |
| `/detail/:uuid` | `DetailPage` (lazy) | Drama detail |
| `*` | `NotFoundPage` (lazy) | Catch-all under `MainLayout` |

Defined in `src/routes/index.tsx` with constants from `src/constants/index.ts` (`ROUTES.HOME` = `/home`, `ROUTES.DETAIL` = `/detail`).
