import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

const DB_NAME = "autumn-db";
const DB_VERSION = 1;
const SONGS_STORE = "songs";
const PLAYLISTS_STORE = "playlists";

export const USER_SONG_PREFIX = "user-";
export const USER_PLAYLIST_PREFIX = "user-pl-";

export const USER_COVER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dab9ff"/><stop offset="1" stop-color="#46f5e0"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><text x="100" y="122" font-family="Arial, sans-serif" font-size="72" text-anchor="middle" fill="#1a1a2e">&#9835;</text></svg>`
  );

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SONGS_STORE)) {
        db.createObjectStore(SONGS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
        db.createObjectStore(PLAYLISTS_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAll(db, store) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store).objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function put(db, store, value) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, "readwrite").objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function del(db, store, key) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, "readwrite").objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function newId(prefix) {
  return `${prefix}${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
}

function titleFromFile(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || name;
}

function readDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const done = (v) => {
      URL.revokeObjectURL(url);
      resolve(v);
    };
    audio.onloadedmetadata = () => done(isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => done(0);
    audio.src = url;
  });
}

const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
  const [userSongs, setUserSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const dbRef = useRef(null);
  const songsRef = useRef([]);
  const playlistsRef = useRef([]);

  useEffect(() => {
    let cancelled = false;
    openDB()
      .then(async (db) => {
        if (cancelled) return;
        dbRef.current = db;
        const [songRecords, playlistRecords] = await Promise.all([
          getAll(db, SONGS_STORE),
          getAll(db, PLAYLISTS_STORE),
        ]);
        if (cancelled) return;
        setUserSongs(
          songRecords.map((r) => ({
            id: r.id,
            title: r.title,
            artist: r.artist,
            cover: USER_COVER,
            duration: r.duration || 0,
            audio: URL.createObjectURL(r.blob),
          }))
        );
        setUserPlaylists(
          playlistRecords.map((p) => ({
            ...p,
            cover: p.cover || USER_COVER,
            description: "Custom playlist",
          }))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    songsRef.current = userSongs;
  }, [userSongs]);

  useEffect(() => {
    playlistsRef.current = userPlaylists;
  }, [userPlaylists]);

  const uploadSongs = useCallback(async (files) => {
    const db = dbRef.current;
    if (!db || files.length === 0) return [];
    const created = [];
    for (const file of files) {
      const id = newId(USER_SONG_PREFIX);
      const title = titleFromFile(file.name);
      const artist = "My Uploads";
      const duration = await readDuration(file);
      await put(db, SONGS_STORE, { id, title, artist, blob: file, duration, addedAt: Date.now() });
      created.push({
        id,
        title,
        artist,
        album: artist,
        genre: "Local",
        cover: USER_COVER,
        duration,
        audio: URL.createObjectURL(file),
      });
    }
    setUserSongs((prev) => [...prev, ...created]);
    return created;
  }, []);

  const createPlaylist = useCallback(async (name) => {
    const db = dbRef.current;
    const id = newId(USER_PLAYLIST_PREFIX);
    const playlist = {
      id,
      title: name.trim() || "New Playlist",
      songIds: [],
      cover: USER_COVER,
      description: "Custom playlist",
      createdAt: Date.now(),
    };
    if (db) await put(db, PLAYLISTS_STORE, playlist);
    setUserPlaylists((prev) => [...prev, playlist]);
    return playlist;
  }, []);

  const deletePlaylist = useCallback(async (playlistId) => {
    setUserPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    const db = dbRef.current;
    if (db) await del(db, PLAYLISTS_STORE, playlistId);
  }, []);

  const addSongsToPlaylist = useCallback(async (playlistId, songIds) => {
    const target = playlistsRef.current.find((p) => p.id === playlistId);
    if (!target) return;
    const next = { ...target, songIds: [...new Set([...target.songIds, ...songIds])] };
    setUserPlaylists((prev) => prev.map((p) => (p.id === playlistId ? next : p)));
    const db = dbRef.current;
    if (db) await put(db, PLAYLISTS_STORE, next);
  }, []);

  const removeSongFromPlaylist = useCallback(async (playlistId, songId) => {
    const target = playlistsRef.current.find((p) => p.id === playlistId);
    if (!target) return;
    const next = { ...target, songIds: target.songIds.filter((id) => id !== songId) };
    setUserPlaylists((prev) => prev.map((p) => (p.id === playlistId ? next : p)));
    const db = dbRef.current;
    if (db) await put(db, PLAYLISTS_STORE, next);
  }, []);

  const value = {
    userSongs,
    userPlaylists,
    uploadSongs,
    createPlaylist,
    deletePlaylist,
    addSongsToPlaylist,
    removeSongFromPlaylist,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within UserDataProvider");
  return ctx;
}
