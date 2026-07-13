# Story Hook

Story Hook is a multilingual web application for discovering and exploring curated Asian dramas. Users can browse a drama catalog, open detailed synopses, view cast information and stills, and follow external watch links. The UI supports **English**, **Chinese**, **Thai**, **Korean**, and **Myanmar**, while drama content retains English titles alongside Myanmar (`mmTitle`) titles and synopses.

**Version:** 1.0.0 · **Package name:** `story-hook`

## Key features

- Browse a curated grid of Asian dramas with cover art, ratings, and story previews
- View full drama detail pages (synopsis, cast, photo gallery, metadata, watch link)
- Advanced search with keyword, country, rating, episode, and year filters
- Multilingual UI (en / zh / th / ko / my) with language settings and persistence
- Bilingual catalog content: English titles plus Myanmar (`mmTitle`) titles and synopses
- Localized SEO helpers (document title, Open Graph, Twitter meta, `html lang`)
- Responsive dark UI with glassmorphism accents and Tailwind CSS v4 design tokens
- Route-level code splitting and a dedicated 404 page
- Image fallbacks to a local placeholder when remote assets fail

## Screenshots

> Add screenshots here after capturing the home grid and a detail page in development or production.

| View | Description |
|------|-------------|
| Home | Drama discovery grid at `/home` |
| Detail | Full drama page at `/detail/:uuid` |
| Advanced Search | Filterable search at `/advanced-search` |
| Settings | Language preference at `/settings` |
| About | App overview at `/about` |
| 404 | Not-found state for unknown routes |

---

# Project Overview

## Business purpose

Story Hook helps readers discover Asian dramas with rich, Myanmar-language story summaries alongside English titles and metadata. The chrome UI is fully localized across five languages. Content is maintained as static JSON in the repository (no backend API in the current implementation).

## Localization support

| Code | Language | Native name |
|------|----------|-------------|
| `en` | English | English |
| `zh` | Chinese | 中文 |
| `th` | Thai | ไทย |
| `ko` | Korean | 한국어 |
| `my` | Myanmar | မြန်မာ |

Language preference is detected from (1) saved `localStorage` choice, (2) browser language, then (3) English fallback. Routes stay language-agnostic (`/home`, `/detail/:uuid`, …) so existing URLs remain stable; only UI strings and SEO metadata switch with the locale.

## Target users

- Myanmar-speaking drama fans who want synopses and cast context in Myanmar script
- Multilingual browsers who prefer Chinese, Thai, Korean, English, or Myanmar UI chrome
- Casual browsers looking for ratings, episode counts, air dates, and watch links
- Developers extending the catalog via the Excel import tool or by editing `src/data/*.json`

## Main workflows

```text
Landing (/) ──redirect──► Home (/home)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     Advanced Search    Detail/:uuid      Settings
     (/advanced-search)                   (/settings)
                              │               │
                              ▼               ▼
                     Story / Cast / Photos   Language
                     Watch Now (external)    preference
```

1. **Browse** — Open `/home`, wait for the short loading skeleton, then scan drama cards.
2. **Open details** — Click a card or “View Details” to load `/detail/:uuid`.
3. **Search** — Use `/advanced-search` to filter by keyword, country, rating, episodes, and year.
4. **Explore media** — Read the synopsis, review cast roles, open stills in the lightbox.
5. **Watch** — If `watchLink` is a valid absolute URL, use “Watch Now” (opens in a new tab).
6. **Language** — Open Settings and pick a display language; the choice persists on the device.
7. **Recover** — Unknown routes show the 404 page; missing UUIDs show an empty state with a link home.

## Feature summary

| Feature | Implementation |
|---------|----------------|
| Drama catalog | `useStories` + `stories.json` |
| Detail view | `useStory(uuid)` + `DetailPage` + `useSmartBack` |
| Advanced search | `useAdvancedSearch` + URL query sync (`replace: true`) |
| Localization | `i18next` + `react-i18next` + `src/i18n/` |
| Language settings | `SettingsPage` + `localStorage` (`story-hook-language`) |
| Photo lightbox | Local state in `PhotoGallery` |
| SEO meta | `SEO` component (`useEffect` DOM updates, localized) |
| Scroll restoration | `ScrollToTop` saves/restores list scroll across detail navigation |
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
| Localization | i18next + react-i18next | See `package.json` |
| Language detection | i18next-browser-languagedetector | See `package.json` |
| Lazy locale loading | i18next-resources-to-backend | See `package.json` |
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
- **Layout shell** — `MainLayout` (header, scroll restoration, outlet, footer)
- **Data access** — custom hooks that load typed static JSON (module-level cache)
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

`useStories` simulates async loading with a **400ms** `setTimeout` on the **first** catalog load (loading skeleton UX), then keeps a module-level in-memory cache so returning from detail does not reload JSON or flash the skeleton. `useStory` reuses `useStories` and finds one item by `uuid`. `useCasts` / `useNetworks` likewise cache static JSON after the first read.

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
| Advanced search filters | `useAdvancedSearch` + URL params | draft / applied; `setSearchParams(..., { replace: true })` so filter edits do not stack history |
| Detail back navigation | `useSmartBack` + StoryCard `state.from` | history `-1` when possible; else referrer path; else `/home` |
| Active UI language | i18next + `localStorage` | `story-hook-language` |
| Lightbox selection | `useState` in `PhotoGallery` | `selectedIndex` |
| Document meta | `SEO` `useEffect` | `document.title`, meta tags, `og:locale` |
| Scroll position | `ScrollToTop` | restore `/home` & `/advanced-search` (incl. query) on revisit; POP for other routes |

No Redux or remote cache libraries are used. Language state is owned by i18next and synchronized via `DocumentLanguage`.

## API communication flow

**Not applicable as a remote API.** Content is bundled via:

```ts
import storiesData from '@/data/stories.json';
```

External URLs appear only as:

- Image `src` values (MyDramaList, TMDB, etc. in JSON)
- Optional `watchLink` anchors (`target="_blank"` + `rel="noopener noreferrer"`)

---

# Localization Architecture

Story Hook uses **i18next** with **react-i18next** for UI chrome localization. Drama catalog fields (`title`, `mmTitle`, `story`, cast/network proper names) remain content data and are not rewritten by the UI locale.

## Approach

| Concern | Implementation |
|---------|----------------|
| Framework | `i18next` + `react-i18next` |
| Detection | `i18next-browser-languagedetector` |
| Loading | `i18next-resources-to-backend` + Vite dynamic `import()` per language/namespace |
| Typing | `src/i18n/i18next.d.ts` maps English JSON modules into i18next types |
| HTML lang | `DocumentLanguage` + `SEO` keep `<html lang>` and `og:locale` in sync |
| Persistence | `localStorage` key `story-hook-language` |
| Fallback | Missing keys fall back to English (`en`) |
| Routing | Existing paths preserved (no `/en` prefix) to avoid breaking URLs |

## Translation file structure

Translations are organized by feature/module (i18next namespaces):

```text
src/i18n/
├── index.ts                 # i18n init, changeAppLanguage, getCurrentLanguage
├── config.ts                # languages, namespaces, storage key, metadata
├── DocumentLanguage.tsx     # syncs documentElement.lang / dir
├── helpers.ts               # country / role / error translation helpers
├── i18next.d.ts             # TypeScript resource typings
└── locales/
    ├── en/                  # English (source of truth for keys)
    ├── zh/                  # Chinese
    ├── th/                  # Thai
    ├── ko/                  # Korean
    └── my/                  # Myanmar
        ├── common.json
        ├── navigation.json
        ├── home.json
        ├── detail.json
        ├── search.json
        ├── advancedSearch.json
        ├── filters.json
        ├── settings.json
        ├── about.json
        ├── footer.json
        ├── errors.json
        ├── dialogs.json
        ├── toast.json
        ├── forms.json
        ├── validation.json
        ├── seo.json
        └── a11y.json
```

Namespaces cover: Common, Navigation, Home, Story Details, Search, Advanced Search, Filters, Settings, About, Footer, Error Pages, Dialogs, Toast Messages, Forms, Validation Messages, SEO, and Accessibility Labels.

## Language loading process

1. App boots and imports `@/i18n` from `main.tsx`.
2. Detector reads `localStorage` (`story-hook-language`), then `navigator` languages.
3. Browser tags such as `zh-CN` / `ko-KR` map to supported codes (`zh`, `ko`, …).
4. Only the active language’s namespace JSON chunks are loaded via dynamic import.
5. Switching language in Settings calls `changeAppLanguage()`, updates `localStorage`, loads the new locale chunks, and re-renders without a full page reload.
6. Unused languages stay out of the critical path; Vite emits separate locale chunks.

## Language detection priority

1. Saved user preference (`localStorage`)
2. Browser language
3. English (`en`) fallback

## Language switching & persistence

- **Settings UI:** `/settings` lists native names (English, 中文, ไทย, 한국어, မြန်မာ).
- **Immediate update:** `i18n.changeLanguage` updates all `useTranslation` consumers without reload.
- **Persistence:** preference stored under `story-hook-language`.
- **Sync:** `DocumentLanguage` updates `document.documentElement.lang` (and `dir`) app-wide.

## SEO localization

The `SEO` component localizes:

- Document title (via `seo:titleTemplate`)
- Meta description
- Open Graph title / description / type / locale / image / url
- Twitter card / title / description / image

Structured page copy for Home, Advanced Search, Settings, About, and 404 lives under the `seo` namespace.

## Adding a new language

1. Add the language code to `SUPPORTED_LANGUAGES` and `LANGUAGE_META` in `src/i18n/config.ts`.
2. Create `src/i18n/locales/<code>/` and copy every namespace JSON from `en/`.
3. Translate all values; keep keys identical to English.
4. Ensure plural keys (`*_one` / `*_other`) and interpolation placeholders (`{{count}}`, `{{title}}`, …) remain intact.
5. Run `npm run build` and verify Settings shows the new native name and that pages render correctly.

Optional: regenerate scaffolding with `node scripts/generate-locales.mjs` (edit the script first to include the new locale).

## Translation guidelines

| Topic | Guideline |
|-------|-----------|
| Naming | camelCase keys inside namespaces (`viewDetails`, `keywordPlaceholder`) |
| Structure | `namespace:key` or nested paths (`filters:countries.South Korea`) |
| Interpolation | Use `{{variable}}`; never concatenate translated fragments ad hoc when a single key can hold the sentence |
| Pluralization | Prefer i18next plural suffixes (`resultsFound_one`, `resultsFound_other`) |
| Stable IDs | Keep filter/country **values** in English for URL params; translate **labels** only |
| Roles | Data stores `Main Role` / `Support Role`; display via `translateRole()` |
| Content vs chrome | Do not put drama synopses into locale files; keep them in `stories.json` |
| Accessibility | Put aria-labels in the `a11y` (and related) namespaces |

## Localization maintenance

- Treat `en` JSON files as the canonical key set.
- When adding UI copy, add the English key first, then update zh / th / ko / my.
- Prefer `useTranslation(['namespace', …])` over hardcoding strings.
- Use helpers in `src/i18n/helpers.ts` for dynamic keys (countries, roles, error codes).
- After locale edits, run `npm run lint` and `npm run build`.

## Localization troubleshooting

| Issue | Likely cause | Solution |
|-------|--------------|----------|
| Raw key shown in UI | Missing translation or wrong namespace | Add the key to the active language JSON; ensure `useTranslation` includes that namespace |
| Language resets on refresh | `localStorage` blocked or wrong key | Confirm `story-hook-language` is writable; check browser privacy settings |
| Wrong language on first visit | Browser tag not mapped | Extend `resolveBrowserLanguage()` in `src/i18n/config.ts` |
| Country filter breaks after locale change | Translated value written to URL | Keep `SEARCH_COUNTRIES` English codes in state/URL; translate only labels |
| Flash of English | Async locale chunk | Expected briefly; Suspense wraps the app — avoid disabling `useSuspense` without a loader |
| `html lang` stale | Missing `DocumentLanguage` | Ensure `<DocumentLanguage />` remains mounted in `main.tsx` |

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
│   │   ├── DualRangeSlider.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSkeleton.tsx  # Grid + detail skeletons
│   │   ├── PageContainer.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── RatingBadge.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── SearchIconLink.tsx
│   │   ├── SEO.tsx
│   │   ├── StoryCard.tsx
│   │   ├── StoryGrid.tsx
│   │   └── index.ts
│   ├── constants/               # APP_NAME, ROUTES, SEARCH_COUNTRIES, …
│   ├── data/
│   │   ├── stories.json         # Drama catalog (source of truth)
│   │   ├── casts.json           # Actor directory (UUID-keyed)
│   │   └── original_network.json# Broadcast / streaming networks
│   ├── hooks/
│   │   ├── useSmartBack.ts
│   │   ├── useAdvancedSearch.ts
│   │   ├── useCasts.ts
│   │   ├── useNetworks.ts
│   │   └── useStories.ts        # useStories + useStory
│   ├── i18n/                    # Localization runtime + locale JSON
│   │   ├── config.ts
│   │   ├── DocumentLanguage.tsx
│   │   ├── helpers.ts
│   │   ├── i18next.d.ts
│   │   ├── index.ts
│   │   └── locales/{en,zh,th,ko,my}/*.json
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── pages/
│   │   ├── AboutPage.tsx
│   │   ├── AdvancedSearchPage.tsx
│   │   ├── DetailPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── SettingsPage.tsx
│   ├── routes/
│   │   └── index.tsx            # createBrowserRouter + AppRouter
│   ├── styles/
│   │   └── index.css            # Tailwind import + @theme tokens + utilities
│   ├── types/
│   │   ├── search.ts
│   │   └── story.ts             # Story, CastMember, Cast, OriginalNetwork
│   ├── utils/
│   │   ├── image.ts             # getImageSrc, handleImageError
│   │   ├── lookup.ts            # cast/network UUID resolution
│   │   ├── search.ts            # advanced search helpers
│   │   ├── story.ts             # preview, rating parse, URL validation, …
│   │   └── index.ts
│   ├── main.tsx                 # React root + StrictMode + i18n bootstrap
│   └── vite-env.d.ts            # Vite client types
├── scripts/
│   ├── generate-locales.mjs     # Optional locale JSON generator
│   └── merge_excel_into_json.py # Incremental Excel → JSON import
├── docs/
│   ├── excel-import-guide.md    # End-user import guide
│   └── excel-import-developer-guide.md
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

This project **does not define or require environment variables** for core functionality.

- No `.env`, `.env.example`, or `.env.*` files are present
- No `import.meta.env` / `VITE_*` usage appears in the source
- `src/vite-env.d.ts` only references Vite’s default client types

### Localization-related configuration

| Setting | Location | Default |
|---------|----------|---------|
| Supported languages | `src/i18n/config.ts` → `SUPPORTED_LANGUAGES` | `en`, `zh`, `th`, `ko`, `my` |
| Fallback language | `DEFAULT_LANGUAGE` | `en` |
| Persistence key | `LANGUAGE_STORAGE_KEY` | `story-hook-language` |
| Namespaces | `NAMESPACES` | See Localization Architecture |

No environment variables are required to enable localization; language preference is client-side only.

### Development vs production

| Mode | How it works |
|------|----------------|
| Development | `npm run dev` — Vite HMR; JSON + locale chunks imported on demand |
| Production | `npm run build` — Typecheck + Vite build to `dist/`; locales split into hashed chunks |

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
- Localize all user-facing chrome via `useTranslation` / namespace JSON (never hardcode UI copy)
- Validate external watch URLs before rendering the CTA (`isValidUrl`)
- Soft-fail images with `handleImageError` → `/placeholder-drama.svg`
- Use `rel="noopener noreferrer"` on external links
- Keep SEO updates centralized in `SEO`
- Keep search filter **values** language-stable (English country codes in URLs)

### Adding a drama

**Preferred:** use the Excel import tool (see [Excel Data Import Tool](#excel-data-import-tool)) so casts, networks, and UUIDs stay consistent.

**Manual fallback:** append an object to `src/data/stories.json` matching the `Story` interface in `src/types/story.ts`. Use a unique `uuid` for the detail route `/detail/:uuid`, and reference cast / network UUIDs from `casts.json` and `original_network.json` instead of embedding names.

---

# Excel Data Import Tool

## Purpose

Story Hook stores its catalog as static JSON (`stories.json`, `casts.json`, `original_network.json`). New dramas often arrive as spreadsheet rows. Editing those JSON files by hand is error-prone: easy to break UUIDs, duplicate actors, drop existing photos, or overwrite production data.

`scripts/merge_excel_into_json.py` solves this by **incrementally merging** Excel rows into the existing JSON files. It never deletes existing records, only creates missing ones and fills empty fields.

## Features

| Feature | Behavior |
|---------|----------|
| Incremental merge | Appends new dramas; updates matched dramas without replacing the catalog |
| Existing data preservation | Never deletes stories, casts, or networks |
| UUID generation | Creates UUID v4 only for truly new stories, casts, and networks |
| UUID reuse | Reuses existing cast and network UUIDs when names match |
| Story detection | Matches by title, Myanmar title (`mmTitle`), or watch link |
| Cast normalization | Case-insensitive, whitespace-normalized actor names |
| Network normalization | Case-insensitive, whitespace-normalized network names |
| Relationship mapping | Stories store cast/network UUID references, not raw names |
| Photo merging | Appends only new photo URLs; never removes existing ones |
| Episode merging | Appends missing episode links; skips duplicates by title/link |
| Cover photo safety | Sets `coverPhoto` only when missing or empty |
| Validation checks | Asserts all pre-existing UUIDs remain after merge |
| Merge statistics | Prints a JSON report (created/updated counts, titles, totals) |

## Project files

| File | Role |
|------|------|
| `src/data/stories.json` | Drama catalog consumed by the React app |
| `src/data/casts.json` | Shared actor directory keyed by UUID |
| `src/data/original_network.json` | Shared network directory keyed by UUID |
| `scripts/merge_excel_into_json.py` | Incremental Excel → JSON merge script |

## Quick start

```bash
# One-time dependency
pip install openpyxl

# From the repository root (Windows example)
python scripts/merge_excel_into_json.py "C:\Downloads\Story Hook Raw Data.xlsx"
```

Default Excel path if omitted: `~/Downloads/Story Hook Raw Data.xlsx`.

## Documentation

| Guide | Audience |
|-------|----------|
| [docs/excel-import-guide.md](docs/excel-import-guide.md) | Content editors and operators |
| [docs/excel-import-developer-guide.md](docs/excel-import-developer-guide.md) | Developers extending the importer |

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
useStories() — if module cache hit → stories immediately, loading=false
        │
        └─ else first load: loading=true → setTimeout(400ms) → cache + state
                ├─ success → stories state, loading=false
                └─ throw   → error message, stories=[], loading=false
```

Home exposes `refetch` (re-reads JSON into the module cache). Detail uses `useStory(uuid)` and shows not-found UI when the UUID is absent after load.

## Future remote API (guidance only)

If you introduce a backend, keep the hook signatures (`stories`, `loading`, `error`, `refetch`) and replace the JSON import with `fetch` / a thin `services/` module so pages stay unchanged.

---

# State Management

## Solution

**React built-in hooks only** — no third-party global state library.

## Global state flow

There is **no global store**. Page components remount on route changes, but catalog hooks reuse a **module-level cache** so home/detail/search do not re-hit the artificial first-load delay or show redundant loading states when navigating back.

## Local state usage

- Loading / error / list in `useStories` (backed by module cache)
- Lightbox index in `PhotoGallery`
- Imperative document title/meta in `SEO`
- Scroll positions in `ScrollToTop` (in-memory map keyed by pathname)

## Data caching strategy

- **Build-time:** `stories.json` and locale JSON are bundled by Vite (locales as separate async chunks)
- **Runtime:** Module-level cache for stories / casts / networks plus React state; i18next cache + `localStorage` for language
- **CDN (deployed assets):** `vercel.json` sets long-cache headers for `/assets/*`
- **Scroll:** `/home` and `/advanced-search` restore the last scroll offset when revisiting (back, forward, or in-app links); other routes restore on history POP and start at the top on PUSH

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

React, React DOM, and React Router are split into a `vendor` chunk. i18next-related packages are split into an `i18n` chunk. Locale JSON files load on demand as separate assets.

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
| Route-level code splitting | `lazy()` for pages including Settings / About / Advanced Search |
| Suspense fallbacks | `PageLoader` / `LoadingSkeleton` + root Suspense for i18n |
| Vendor / i18n manual chunks | `manualChunks` in `vite.config.ts` |
| Lazy locale resources | `i18next-resources-to-backend` dynamic imports |
| Lazy images | `loading="lazy"` + `decoding="async"` on cards/gallery |
| Font preconnect | `preconnect` to Google Fonts in `index.html` |
| Long-lived hashed assets | Vite content hashes + Vercel `/assets` cache headers |
| Image error isolation | Placeholder swap avoids broken-image layout thrash |

**Not present:** React `memo` / list virtualization; no service worker / PWA cache.

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
| UI stuck in English | Preference not saved / detection failed | Open `/settings`, pick a language; check Localization troubleshooting above |
| Country labels wrong after switch | Missing `filters` namespace | Confirm `filters.json` exists for the active language |

---

# Contributing

## Suggested workflow

1. Create a feature branch from the default branch
2. Install with `npm install`
3. Develop with `npm run dev`
4. Run `npm run lint` and `npm run build` before opening a PR
5. Prefer the Excel import tool (`scripts/merge_excel_into_json.py`) for catalog updates; keep drama content in `src/data/*.json` typed to `Story` / `Cast` / `OriginalNetwork`
6. When changing UI copy, update **all** locale files under `src/i18n/locales/` (start with `en`)
7. Prefer small, focused PRs (UI vs content vs tooling vs locales)

## Code review checklist

- [ ] Types align with `src/types/story.ts`
- [ ] New UI is accessible (labels, focus styles, keyboard for lightbox where applicable)
- [ ] New user-facing strings are translated in all supported languages
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
| `/advanced-search` | `AdvancedSearchPage` (lazy) | Filters + results |
| `/settings` | `SettingsPage` (lazy) | Language preference |
| `/about` | `AboutPage` (lazy) | App overview |
| `*` | `NotFoundPage` (lazy) | Catch-all under `MainLayout` |

Defined in `src/routes/index.tsx` with constants from `src/constants/index.ts` (`ROUTES.HOME` = `/home`, `ROUTES.DETAIL` = `/detail`, `ROUTES.ADVANCED_SEARCH` = `/advanced-search`, `ROUTES.SETTINGS` = `/settings`, `ROUTES.ABOUT` = `/about`).

Locale prefixes such as `/en/...` are **not** used, so existing bookmarks and shared links keep working while the UI language remains an independent preference.
