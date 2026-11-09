<<<<<<< HEAD
# React + Vite
visit: https://autumn-one.vercel.app
This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.
=======
# Autumn — Electric Audio

A dark-themed, client-side music player built with React and Vite. Autumn streams a bundled catalog of 266 tracks across 9 genres, and lets you upload your own audio and build playlists that survive page reloads.
>>>>>>> c465049 (documentation)

**Live demo:** [https://autumn-one.vercel.app](https://autumn-one.vercel.app)

---

## Features

- **Full playback engine** — play/pause, next/prev, seek, volume, shuffle, and repeat (`off → one → all`) powered by a single shared `<audio>` element.
- **Library** — browse playlists or the full catalog in a responsive grid, then drill into any playlist.
- **Now Playing** — large artwork, progress/volume sliders, and an "Up Next" queue with in-queue search.
- **Lyrics** — automatically fetched from [LRCLIB](https://lrclib.net); supports synced (LRC) and plain lyrics, cached locally, with a manual "Add Lyrics" fallback.
- **User uploads** — add your own audio files to a playlist. Blobs and playlist metadata persist in IndexedDB.
- **Responsive shell** — fixed sidebar on desktop, slide-in drawer on mobile, plus a two-row mini player on small screens.
- **Material 3 design system** — custom Tailwind v4 theme tokens, glassmorphism panels, and Material Symbols icons.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | **React 19** (function components + hooks, plain JSX) |
| Language | **JavaScript (ES modules)** — no TypeScript |
| Build tool | **Vite 8** with `@vitejs/plugin-react` (Oxc-based Fast Refresh) |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` (CSS-first `@theme`, no `tailwind.config.js`) |
| Routing | **React Router DOM 7** (`BrowserRouter`, nested routes, `Outlet`) |
| Audio | Native **HTML5 Audio API** (`new Audio()` in a ref) |
| Persistence | **IndexedDB** (`autumn-db`) for uploads/playlists, **localStorage** for lyrics cache |
| Lyrics API | **LRCLIB** (`https://lrclib.net/api/get`) |
| Linting | **oxlint** (zero-config) |
| Icons & fonts | **Material Symbols Outlined**, **Montserrat** + **Inter** (Google Fonts) |
| Deployment | **Vercel** (static SPA build) |

### Plugins and dependencies

**Runtime**
- `react`, `react-dom` — UI runtime
- `react-router-dom` — client-side routing
- `tailwindcss`, `@tailwindcss/vite` — utility-first styling and the Vite integration plugin

**Development**
- `vite` — dev server and production bundler
- `@vitejs/plugin-react` — JSX transform + React Fast Refresh
- `oxlint` — fast Rust-based linter
- `@types/react`, `@types/react-dom` — editor IntelliSense only (the app is still plain JS)

---

## Getting Started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# production build → dist/
npm run build

# preview the production build
npm run preview

# lint
npm run lint
```

### Regenerating the song catalog

The catalog in `src/data/songs.js` is generated, not hand-written:

```bash
node scripts/generate-songs.js > src/data/songs.js
```

The script walks `public/audio/<artist-dir>/`, maps folder names to artists/genres, cleans up YouTube-style filenames, percent-encodes the resulting URLs, and emits `songs`, `playlists`, `moods`, `genres`, `genreImages`, and `trendingTags`. Re-run it whenever you add or remove audio files.

---

## Project Structure

```
Autumn/
├── public/
│   ├── audio/                  # committed audio, one folder per artist
│   ├── favicon.svg
│   └── icons.svg
├── scripts/
│   └── generate-songs.js       # catalog generator
├── src/
│   ├── components/
│   │   ├── Card.jsx            # grid / hero track card
│   │   ├── GenreCard.jsx       # (unused, legacy Discover page)
│   │   ├── Layout.jsx          # sidebar + topbar + outlet shell
│   │   ├── PlayerBar.jsx       # bottom mini player (desktop + mobile)
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   ├── context/
│   │   ├── PlayerContext.jsx   # playback state + audio element
│   │   └── UserDataContext.jsx # uploads + playlists (IndexedDB)
│   ├── data/
│   │   └── songs.js            # GENERATED catalog — do not hand-edit
│   ├── hooks/
│   │   └── useSliderDrag.js    # pointer-capture slider logic
│   ├── pages/
│   │   ├── Library.jsx
│   │   ├── NowPlaying.jsx
│   │   ├── Home.jsx            # (unused)
│   │   └── Discover.jsx        # (unused)
│   ├── App.jsx                 # providers + routes
│   ├── main.jsx                # React root
│   └── index.css               # Tailwind import, @theme tokens, utilities
├── index.html
├── vite.config.js
└── package.json
```

---

## Architecture

### Provider tree

```
<BrowserRouter>
  └── <PlayerProvider>        // playback: current song, queue, time, volume…
        └── <UserDataProvider> // uploads + playlists, IndexedDB-backed
              └── <Routes>
                    └── <Layout>  // Sidebar + TopBar + <Outlet />
                          ├── /            → redirect to /library
                          ├── /library     → Library
                          └── /now-playing → NowPlaying
```

`PlayerProvider` sits above the router so playback keeps running while you navigate. `UserDataProvider` is nested inside it because the library merges both data sources at render time.

### Playback layer

`PlayerContext` owns a singleton `Audio` object created in a `useRef` and attaches `timeupdate`, `loadedmetadata`, `ended`, and `error` listeners. Components never create their own audio elements — they call `playSong(song, queue, index)` and the context swaps `audio.src` and syncs state.

Key behaviors:
- The `ended` listener reads `handleNextRef.current`, avoiding a stale closure over the `handleNext` callback.
- `repeat === "one"` resets `currentTime` and replays; `"all"` wraps the queue; shuffle picks a random index.
- `handlePrev` restarts the track if more than 3 seconds have elapsed, otherwise steps back.
- `addToQueue` de-duplicates by `song.id`.

### Data layer

The static catalog (`src/data/songs.js`) and user data are merged in `Library`:

```js
const allSongs     = [...songs, ...userSongs];
const allPlaylists = [...playlists, ...userPlaylists];
```

Because both sides expose the same shape (`id`, `title`, `artist`, `cover`, `audio`, `duration`), playback needs no special-casing — a `blob:` URL and an `/audio/...` URL are both just `song.audio`.

### Persistence

- **Uploads** — raw `File` blobs are stored in IndexedDB store `songs`; on load, each record is rehydrated with a fresh `URL.createObjectURL` so it plays again.
- **Playlists** — stored in IndexedDB store `playlists` as `{ id, title, songIds, cover, description, createdAt }`.
- **Lyrics** — cached in `localStorage` under `lyrics_cache_v1_<hash>`; user-supplied lyrics live at `<hash>_user` and win over the network result.

### Styling

`src/index.css` defines the Material 3 palette and font families through Tailwind v4's `@theme` block, so utilities like `bg-surface-container-high`, `text-primary`, and `font-headline-md` are generated without a config file. Two custom utilities (`glass-panel`, `custom-scrollbar`) handle the frosted panels and thin scrollbars.

---

## Challenges & Solutions

**1. Hundreds of audio files with messy, unicode, space-containing names**
Manually curating a song list would be error-prone. Instead, `scripts/generate-songs.js` derives the catalog from the filesystem, scrubs YouTube artifacts from titles, and percent-encodes paths with `encodeURIComponent` so names like `(28) Mayabee (মায়াবী)-Blue Touch (Official Music Video) - YouTube.MP3` still resolve in the browser.

**2. Audio duration is unknown at build time**
Parsing media metadata in Node would require extra native dependencies, so the generated catalog stores `duration: 0` and the UI reads the real duration from the `loadedmetadata` event once playback starts. Uploaded files get their duration read client-side via a temporary object URL.

**3. Keeping one audio element in sync with React**
A single shared `<audio>` avoids overlapping playback but introduces stale-closure risks in event listeners. The solution was a `handleNextRef` mirror of the latest `handleNext`, plus effect dependencies on `currentSong`/`repeat` so listeners rebind when behavior changes.

**4. Custom sliders that work with mouse, touch, and pen**
Native `<input type="range">` was too hard to style consistently. `useSliderDrag` normalizes pointer events into a 0–1 fraction, uses `setPointerCapture` so dragging continues outside the bar, and clamps values — shared by seek and volume controls in both players.

**5. Persisting uploaded audio without a backend**
`localStorage` can't hold blobs. IndexedDB can, but `blob:` URLs expire with the page, so uploads are re-materialized on startup with `URL.createObjectURL`. All database access is wrapped in small promise helpers with graceful failure — if IndexedDB is unavailable, the app still plays the static catalog.

**6. Lyrics are inconsistent across sources**
LRCLIB may return synced LRC, plain text, or nothing at all. The lyrics hook parses timestamps when present, falls back to proportional highlighting for plain text, and exposes a manual entry path for tracks with no match. Caching avoids re-hitting the API on every navigation.

**7. Responsive player without duplicating state**
`PlayerBar` renders two separate layouts (desktop `md:flex`, mobile two-row) that share the same context, so there is no state duplication. The mobile variant also respects `env(safe-area-inset-bottom)` for notched devices.

**8. Fragile generated playlist IDs**
The generator maps playlist tracks with `findIndex(artist) + j`, which breaks when two folders map to the same artist (e.g. `scorpions` and `scorpions rocks` → `Scorpions`). This is a known limitation; the fix is to collect IDs while walking each directory instead of re-deriving them by artist.

---

## Deployment

The app is a static SPA. On Vercel:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework preset:** Vite
- Client-side routes need the standard SPA rewrite to `index.html`.

Live: [https://autumn-one.vercel.app](https://autumn-one.vercel.app)

---

## Known Limitations

- `src/pages/Home.jsx`, `src/pages/Discover.jsx`, and `src/components/GenreCard.jsx` are unused legacy code.
- The top bar search on `/library` is visual only; actual search lives in the Now Playing queue.
- The Now Playing queue search covers the static catalog only, not user uploads.
- No automated tests or type checking are configured.
- Generated playlists are capped at the first 10 artist folders with at least three tracks.

---

## Credits

- Audio catalog metadata generated from the files in `public/audio/`.
- Lyrics provided by [LRCLIB](https://lrclib.net).
- Icons by Material Symbols; typography by Google Fonts (Montserrat, Inter).
