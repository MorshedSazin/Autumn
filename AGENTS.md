# Autumn — Music Player (React + Vite)

## Commands

| Command | What |
|---------|------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve built output |
| `npm run lint` | oxlint (not ESLint) |
| `node scripts/generate-songs.js > src/data/songs.js` | Regenerate song catalog from `public/audio/` |

No test, typecheck, or formatter commands exist.

## Codebase quirks

- **Plain JSX** — no TypeScript, no type checking.
- **Tailwind CSS v4** — uses `@import "tailwindcss"` and `@theme {}` (not `@tailwind` or `tailwind.config.*`). Plugin is `@tailwindcss/vite`.
- **Song data is generated.** `scripts/generate-songs.js` scans `public/audio/<artist-dir>/` for audio files and writes `src/data/songs.js`. Run it whenever audio files change. `duration` is always `0`. The output also exports `playlists`, `moods`, `genres`, `genreImages`, `trendingTags`.
- **oxlint** — config baked into npm package; no `.eslintrc*` or `.oxlintrc*`.
- **Home.jsx** and **Discover.jsx** exist in `src/pages/` but are **not imported anywhere** — only `Library` and `NowPlaying` are active.

## Routes & nav

| Path | Page | Sidebar label |
|------|------|---------------|
| `/` | Redirects to `/library` | — |
| `/library` | Library.jsx — tabs (Playlists / All Music) | Library |
| `/now-playing` | NowPlaying.jsx — full player + lyrics + queue | Now Playing |

Sidebar (`Sidebar.jsx`) has exactly these two links. TopBar shows a search input on `/library`, hides it on `/now-playing`.

## Architecture

- **State:** `PlayerContext` (`src/context/PlayerContext.jsx`) wraps the whole app — manages a single `<Audio>` element, queue, shuffle/repeat, volume. Exposes `playSong`, `togglePlay`, `handleNext`, `handlePrev`, `seek`, `addToQueue`, `playPlaylist`, `formatTime`.
- **Layout:** `Layout.jsx` renders Sidebar + TopBar + `<Outlet />`. Wrapped in `<PlayerProvider>` + `<BrowserRouter>` in `App.jsx`.
- **Lyrics:** Fetched from `lrclib.net/api/get` on NowPlaying page; cached in `localStorage` under key `lyrics_cache_v1_*`. Supports synced (LRC) and plain lyrics; user can add lyrics manually.
- **PlayerBar** (`src/components/PlayerBar.jsx`) — bottom-fixed mini player used inside **Library.jsx** (both playlist detail and main library views).
- **External deps:** Google Fonts (Montserrat, Inter) and Material Symbols loaded via `<link>` in `index.html`.
- **Styling:** Dark theme with custom Material 3 palette in `src/index.css` via `@theme`. Utility classes `.glass-panel` and `.custom-scrollbar` available.
- **Dead pages:** `Home.jsx`, `Discover.jsx` — exist in `src/pages/` but not wired in router or imported anywhere.
