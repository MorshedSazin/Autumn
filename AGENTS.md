# Autumn — Music Player (React + Vite)

## Commands

| Command | What |
|---------|------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve built output |
| `npm run lint` | oxlint (no ESLint config) |
| `node scripts/generate-songs.js > src/data/songs.js` | Regenerate song catalog from `public/audio/` |

No test, typecheck, or formatter commands exist.

## Codebase quirks

- **Plain JSX** — no TypeScript.
- **Tailwind CSS v4** — `@import "tailwindcss"` + `@theme {}` (no tailwind.config). Plugin `@tailwindcss/vite`.
- **Song data is generated.** `scripts/generate-songs.js` scans `public/audio/<artist-dir>/` for audio files (`.mp3`/`.wav`/`.flac`/`.ogg`/`.m4a`/`.aac`/`.webm`) and writes `src/data/songs.js`. Directory name → artist/genre via `ARTIST_NAME_MAP` / `GENRE_MAP`. Titles are scrubbed from filenames (YouTube noise, `(...)`, `_...` suffixes stripped); `audio` URLs are percent-encoded with `encodeURIComponent` — filenames contain spaces/unicode, so never hand-write a raw path in `songs.js`. `duration` is always `0`. Exports: `songs`, `playlists`, `moods`, `genres`, `genreImages`, `trendingTags`. After adding audio files, re-run the generator.
- **oxlint** — config baked into npm package; no `.eslintrc` or `.oxlintrc`.
- **Home.jsx** and **Discover.jsx** exist in `src/pages/` but are **not imported anywhere** — dead code.

## Routes

| Path | Page | Sidebar |
|------|------|---------|
| `/` | → redirects `/library` | — |
| `/library` | Library.jsx (tabs: Playlists / All Music, drill-down into playlist detail) | Library |
| `/now-playing` | NowPlaying.jsx (full player + lyrics + queue) | Now Playing |

Sidebar has exactly these two links. TopBar shows search input on `/library` (UI-only placeholder, no actual filtering), hides it on `/now-playing`.

## Architecture

- **State:** `PlayerContext` (`src/context/PlayerContext.jsx`) wraps the whole app — manages a singleton `<Audio>` element via `useRef`. Exposes `playSong`, `togglePlay`, `handleNext`, `handlePrev`, `seek`, `addToQueue`, `playPlaylist`, `formatTime` (plain fn, not useCallback). `setShuffle`/`setRepeat` are argless toggles; `repeat` cycles `"off" → "one" → "all"` — `"one"` restarts the current track on `ended`, `"all"` wraps the queue. `useSliderDrag` (`src/hooks/useSliderDrag.js`) powers all seek/volume sliders.
- **Layout:** `Layout.jsx` renders Sidebar + TopBar + `<Outlet />`. Wrapped in `<PlayerProvider>` + `<BrowserRouter>` in `App.jsx`. Responsive: desktop shows the fixed `w-64` sidebar (`lg:ml-64` on content); below `lg` the sidebar becomes a slide-in drawer toggled by the hamburger in TopBar. `main` is `overflow-y-auto`. PlayerBar renders separate desktop (`hidden md:flex`) and mobile (`md:hidden`, two-row) layouts.
- **User data:** `UserDataContext` (`src/context/UserDataContext.jsx`) adds user playlists + uploaded songs on top of the generated catalog. Uploaded audio blobs and custom playlists persist in **IndexedDB** (`autumn-db`, stores `songs`/`playlists`); song objects get `blob:` object URLs (recreated on load), `id` prefix `user-` (playlists `user-pl-`), default cover `USER_COVER`. Exposes `uploadSongs`, `createPlaylist`, `deletePlaylist`, `addSongsToPlaylist`, `removeSongFromPlaylist`. Library merges these with the static `songs`/`playlists` arrays — playback works via `song.audio` URL, no PlayerContext changes.
- **Lyrics:** Fetched from `lrclib.net/api/get` on NowPlaying page; cached in `localStorage` under prefix `lyrics_cache_v1_`. Supports synced (LRC) and plain lyrics; user can add lyrics manually.
- **PlayerBar** (`src/components/PlayerBar.jsx`) — bottom-fixed mini player used inside **Library.jsx** (both playlist detail and main library views).
- **Card** (`src/components/Card.jsx`) — accepts `variant` prop: `"small"` (default, grid card) or `"large"` (hero card).
- **External deps:** Google Fonts (Montserrat, Inter) and Material Symbols loaded via `<link>` in `index.html`.
- **Styling:** Dark theme with Material 3 palette via `@theme` in `src/index.css`. Utility classes `.glass-panel` and `.custom-scrollbar` available.
