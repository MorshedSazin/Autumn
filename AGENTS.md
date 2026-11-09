# Autumn — Music Player (React + Vite)

A client-only music player. Catalog comes from audio files committed under `public/audio/`, plus user-uploaded songs and playlists stored in IndexedDB.

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

- **Plain JSX** — no TypeScript, despite `@types/react` being installed.
- **Tailwind CSS v4** — `@import "tailwindcss"` + `@theme {}` in `src/index.css` (no tailwind.config). Plugin `@tailwindcss/vite` in `vite.config.js`.
- **Song data is generated.** `scripts/generate-songs.js` scans `public/audio/<artist-dir>/` for audio files (`.mp3`/`.wav`/`.flac`/`.ogg`/`.m4a`/`.aac`/`.webm`) and writes `src/data/songs.js`. Directory name → artist/genre via `ARTIST_NAME_MAP` / `GENRE_MAP` (lowercased key, falls back to the raw dir name / `"Unknown"`). Titles are scrubbed from filenames (YouTube noise, `(...)`, `[...]`, `_...` suffixes stripped); `audio` URLs are percent-encoded with `encodeURIComponent` — filenames contain spaces/unicode, so never hand-write a raw path in `songs.js`. `duration` is always `0` (real duration comes from the `<audio>` element at runtime). Exports: `songs`, `playlists`, `moods`, `genres`, `genreImages`, `trendingTags`. After adding audio files, re-run the generator; hand edits to `songs.js` are overwritten.
- **Generator playlist quirk:** `playlists` only includes the first 10 directories (readdir order) with ≥3 tracks, ids `pl-1…pl-10`, and computes `songIds` as `findIndex(s => s.artist === artist) + j`. Two directories mapping to the same artist (`scorpions` / `scorpions rocks` → `Scorpions`) therefore produce overlapping/incorrect ids.
- **oxlint** — config baked into the npm package; no `.eslintrc` or `.oxlintrc`.
- **Committed vs ignored:** `public/audio/**` and `src/data/songs.js` are tracked in git; `dist/` and `node_modules/` are ignored.

## Routes

| Path | Page | Sidebar |
|------|------|---------|
| `/` | → redirects `/library` | — |
| `/library` | Library.jsx (tabs: Playlists / All Music, drill-down into playlist detail) | Library |
| `/now-playing` | NowPlaying.jsx (full player + lyrics + queue) | Now Playing |

Sidebar has exactly these two links. TopBar shows a search input on `/library` (UI-only placeholder, no filtering), and a page title on `/now-playing`.

## Architecture

- **State:** `PlayerContext` (`src/context/PlayerContext.jsx`) wraps the whole app — manages a singleton `<Audio>` element via `useRef`. Exposes `playSong(song, queue?, index?)`, `togglePlay`, `handleNext`, `handlePrev`, `seek`, `addToQueue`, `playPlaylist`, `formatTime` (plain fn, not useCallback, so the context value is new every render). `setShuffle`/`setRepeat` are argless toggles; `repeat` cycles `"off" → "one" → "all"` — `"one"` restarts the current track on `ended`, `"all"` wraps the queue, shuffle picks a random queue index. `addToQueue` dedupes by `song.id`. `handlePrev` restarts the current track when `currentTime > 3`, otherwise goes back (clamped at 0 unless `repeat === "all"`). Default volume `0.75`. The `ended` listener reads `handleNextRef.current` to avoid a stale closure.
- **Layout:** `Layout.jsx` renders Sidebar + TopBar + `<Outlet />`. Wrapped in `<BrowserRouter>` → `<PlayerProvider>` → `<UserDataProvider>` in `App.jsx`. Responsive: desktop shows the fixed `w-64` sidebar (`lg:ml-64` on content); below `lg` the sidebar becomes a slide-in drawer toggled by the hamburger in TopBar, with a backdrop. `main` is `overflow-y-auto`.
- **User data:** `UserDataContext` (`src/context/UserDataContext.jsx`) adds user playlists + uploaded songs on top of the generated catalog. Uploaded audio blobs and custom playlists persist in **IndexedDB** (`autumn-db` v1, stores `songs`/`playlists`); song objects get `blob:` object URLs (recreated on load, never revoked), `id` prefix `user-` (playlists `user-pl-`), default cover `USER_COVER` (inline SVG data URI). Uploads get `artist: "My Uploads"`, `genre: "Local"` and a real duration read from the file. Exposes `uploadSongs`, `createPlaylist`, `deletePlaylist`, `addSongsToPlaylist`, `removeSongFromPlaylist`. Uploads happen from a user playlist's "Add Music" button and are added to that playlist. Library merges these with the static `songs`/`playlists` arrays — playback works via `song.audio` URL, no PlayerContext changes. If IndexedDB fails to open, uploads silently no-op.
- **Lyrics:** Fetched from `lrclib.net/api/get` on NowPlaying page; cached in `localStorage` under prefix `lyrics_cache_v1_` (key = prefix + base64(`artist||title`), truncated to 64 chars). Supports synced (LRC) and plain lyrics. Manual lyrics are saved under `<key>_user` and take precedence over the network. Plain lyrics are highlighted by proportion of elapsed duration; synced by timestamps.
- **PlayerBar** (`src/components/PlayerBar.jsx`) — bottom-fixed mini player used inside **Library.jsx** (both playlist detail and main library views), not in Layout. Renders separate desktop (`hidden md:flex`) and mobile (`md:hidden`, two-row, safe-area padding) layouts. Favorite / queue / sort buttons are UI-only.
- **Card** (`src/components/Card.jsx`) — accepts `variant` prop: `"small"` (default, grid card with add-to-queue) or `"large"` (hero card).
- **Sliders:** `useSliderDrag` (`src/hooks/useSliderDrag.js`) returns a `pointerdown` handler that uses pointer capture and calls back with a 0–1 fraction; it powers all seek/volume sliders (NowPlaying + PlayerBar).
- **NowPlaying search:** the "Up Next" search only searches the static `songs` catalog — user uploads are not searchable there. The queue panel only renders when `queue.length > 1`.
- **Dead code:** `src/pages/Home.jsx`, `src/pages/Discover.jsx` are not imported anywhere. `src/components/GenreCard.jsx` is used only by `Discover.jsx`, so it is effectively dead too.
- **External deps:** Google Fonts (Montserrat, Inter) and Material Symbols loaded via `<link>` in `index.html`.
- **Styling:** Dark theme with a Material 3 palette via `@theme` in `src/index.css` (tokens like `surface`, `surface-container-*`, `on-surface`, `primary`/`secondary`; font utilities `font-display-lg`, `font-headline-*`, `font-body-*`, `font-label-*`). Utility classes `.glass-panel` and `.custom-scrollbar` available. `body` background is black.
