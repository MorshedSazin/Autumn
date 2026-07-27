import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songs } from "../data/songs";


function parseLRC(lrc) {
  return lrc.split("\n").filter(Boolean).map((line) => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (!match) return null;
    return { time: parseInt(match[1]) * 60 + parseFloat(match[2]), text: match[3].trim() };
  }).filter(Boolean);
}

const CACHE_PREFIX = "lyrics_cache_v1_";

function cacheKey(artist, title) {
  return CACHE_PREFIX + btoa(unescape(encodeURIComponent(`${artist}||${title}`))).slice(0, 64);
}

function useLyrics(artist, title) {
  const [lyrics, setLyrics] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!artist || !title) return;
    let cancelled = false;
    setStatus("loading");
    setLyrics(null);

    const key = cacheKey(artist, title);

    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (!cancelled) {
          setLyrics(parsed);
          setStatus("done");
          return;
        }
      } catch {}
    }

    const userKey = key + "_user";
    const userCached = localStorage.getItem(userKey);
    if (userCached) {
      try {
        const parsed = JSON.parse(userCached);
        if (!cancelled) {
          setLyrics(parsed);
          setStatus("done");
          return;
        }
      } catch {}
    }

    (async () => {
      const qArtist = encodeURIComponent(artist);
      const qTitle = encodeURIComponent(title);

      try {
        const res = await fetch(
          `https://lrclib.net/api/get?artist_name=${qArtist}&track_name=${qTitle}`
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            if (data.syncedLyrics) {
              const ly = { type: "synced", lines: parseLRC(data.syncedLyrics) };
              localStorage.setItem(key, JSON.stringify(ly));
              setLyrics(ly);
              setStatus("done");
              return;
            }
            if (data.plainLyrics) {
              const lines = data.plainLyrics.split("\n").filter(Boolean);
              const ly = { type: "plain", lines };
              localStorage.setItem(key, JSON.stringify(ly));
              setLyrics(ly);
              setStatus("done");
              return;
            }
          }
        }
      } catch {}

      if (!cancelled) {
        setLyrics(null);
        setStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [artist, title]);

  const saveUserLyrics = useCallback((text) => {
    if (!artist || !title) return;
    const key = cacheKey(artist, title);
    const lines = text.split("\n").filter(Boolean);
    const ly = { type: "plain", lines };
    localStorage.setItem(key + "_user", JSON.stringify(ly));
    setLyrics(ly);
    setStatus("done");
  }, [artist, title]);

  return { lyrics, status, saveUserLyrics };
}

function LyricsPanel({ currentTime, duration, lyrics, status, onSaveLyrics }) {
  const scrollRef = useRef(null);
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState("");

  const idx = useMemo(() => {
    if (!lyrics) return -1;
    if (lyrics.type === "plain" && duration > 0) {
      return Math.min(
        Math.floor((currentTime / duration) * lyrics.lines.length),
        lyrics.lines.length - 1
      );
    }
    if (lyrics.type === "synced") {
      let i = lyrics.lines.length - 1;
      for (let j = 0; j < lyrics.lines.length; j++) {
        if (lyrics.lines[j].time > currentTime) {
          i = Math.max(0, j - 1);
          break;
        }
      }
      return i;
    }
    return -1;
  }, [lyrics, currentTime, duration]);

  useEffect(() => {
    if (scrollRef.current && idx >= 0) {
      const el = scrollRef.current.children[idx];
      if (el) {
        const container = scrollRef.current;
        const target = el.offsetTop + el.clientHeight - container.clientHeight;
        container.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
      }
    }
  }, [idx]);

  const showEmpty = !lyrics || status === "idle" || status === "error";
  const lines = lyrics && lyrics.type === "synced" ? lyrics.lines.map((l) => l.text) : lyrics?.lines;

  const handleSave = () => {
    if (!inputText.trim()) return;
    onSaveLyrics(inputText.trim());
    setShowInput(false);
    setInputText("");
  };

  return (
    <div className="min-w-0 max-w-xl flex flex-col h-[520px]">
      <h3 className="font-headline-md text-on-surface mb-6 shrink-0">Lyrics</h3>
      <div className="flex-1 min-h-0">
        {status === "loading" ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : showEmpty && !showInput ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">lyrics</span>
            <p className="font-body-md text-on-surface-variant/60">No lyrics found for this track.</p>
            <button
              onClick={() => setShowInput(true)}
              className="px-4 py-2 bg-primary/10 text-primary rounded-full font-label-md hover:bg-primary/20 transition-colors cursor-pointer"
            >
              Add Lyrics
            </button>
          </div>
        ) : showInput ? (
          <div className="flex flex-col gap-3 h-full">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type lyrics here..."
              className="flex-1 bg-surface-container-low border border-white/10 rounded-lg p-4 text-on-surface font-body-md resize-none outline-none focus:ring-1 focus:ring-secondary placeholder:text-on-surface-variant/40"
            />
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-secondary text-on-secondary rounded-full font-label-md hover:brightness-110 transition-all cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => { setShowInput(false); setInputText(""); }}
                className="px-4 py-2 border border-white/10 text-on-surface-variant rounded-full font-label-md hover:text-on-surface transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto custom-scrollbar space-y-5 px-4 -mx-4"
          >
            {lines.map((line, i) => (
              line === "" ? (
                <div key={i} className="h-4" />
              ) : (
                <p
                  key={i}
                className={`font-body-lg transition-all duration-300 ${
                  i === idx ? "text-secondary scale-105" : "text-on-surface-variant/60"
                }`}
                >
                  {line}
                </p>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NowPlaying() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    setShuffle,
    setRepeat,
    togglePlay,
    handleNext,
    handlePrev,
    seek,
    formatTime,
    setVolume,
    queue,
    queueIndex,
    playSong,
  } = usePlayer();

  const { lyrics, status, saveUserLyrics } = useLyrics(currentSong?.artist, currentSong?.title);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = searchQuery.trim()
    ? songs.filter((s) =>
        [s.title, s.artist, s.album].some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ).slice(0, 20)
    : [];

  if (!currentSong) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-8xl text-on-surface-variant/20 mb-6">music_note</span>
        <h2 className="font-headline-lg text-on-surface-variant mb-2">No track selected</h2>
        <p className="font-body-md text-on-surface-variant/60">
          Browse your library to start playing.
        </p>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    seek(pct * duration);
  };

  return (
    <div className="flex gap-16 items-center justify-center flex-1">
      <div className="w-full max-w-md text-center shrink-0">
        <div className="w-64 h-64 mx-auto mb-8 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(187,134,252,0.3)]">
          <img className="w-full h-full object-cover" src={currentSong.cover} alt={currentSong.title} />
        </div>

        <h2 className="font-display-lg text-on-surface mb-1">{currentSong.title}</h2>
        <p className="font-body-lg text-secondary mb-8">{currentSong.artist}</p>

        <div className="w-full mb-6">
          <div
            className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group relative"
            onClick={handleProgressClick}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #dab9ff 0%, #46f5e0 100%)",
                boxShadow: "0 0 10px rgba(70, 245, 224, 0.3)",
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-label-sm text-on-surface-variant">{formatTime(currentTime)}</span>
            <span className="font-label-sm text-on-surface-variant">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={setShuffle}
            className={`transition-all active:scale-90 cursor-pointer ${shuffle ? "text-secondary" : "text-on-surface-variant hover:text-primary"}`}
          >
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: `'FILL' ${shuffle ? 1 : 0}` }}>
              shuffle
            </span>
          </button>
          <button onClick={handlePrev} className="text-on-surface-variant hover:text-primary transition-all active:scale-90 cursor-pointer">
            <span className="material-symbols-outlined text-[32px]">skip_previous</span>
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_25px_rgba(218,185,255,0.5)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>
          <button onClick={handleNext} className="text-on-surface-variant hover:text-primary transition-all active:scale-90 cursor-pointer">
            <span className="material-symbols-outlined text-[32px]">skip_next</span>
          </button>
          <button
            onClick={setRepeat}
            className={`transition-all active:scale-90 cursor-pointer ${repeat !== "off" ? "text-secondary drop-shadow-[0_0_8px_rgba(70,245,224,0.6)]" : "text-on-surface-variant hover:text-primary"}`}
          >
            <span className="material-symbols-outlined text-[26px]">
              {repeat === "one" ? "repeat_one" : "repeat"}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant">volume_down</span>
          <div
            className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setVolume(Math.min(1, Math.max(0, x / rect.width)));
            }}
          >
            <div className="h-full bg-secondary transition-colors" style={{ width: `${volume * 100}%` }} />
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">volume_up</span>
        </div>
      </div>

      <LyricsPanel
        currentTime={currentTime}
        duration={duration}
        lyrics={lyrics}
        status={status}
        onSaveLyrics={saveUserLyrics}
      />

      {queue.length > 1 && (
        <div className="w-full max-w-sm shrink-0 flex flex-col">
          <h3 className="font-headline-md text-on-surface mb-4">Up Next</h3>
          <div className="bg-surface-container-low rounded-xl p-4 flex flex-col max-h-[520px]">
            <div className="relative mb-3 shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search music..."
                className="w-full bg-surface-container/50 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-0">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  searchResults.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        playSong(s, songs, songs.indexOf(s));
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer text-left hover:bg-surface-container-high"
                    >
                      <div className="w-9 h-9 rounded overflow-hidden shrink-0">
                        <img className="w-full h-full object-cover" src={s.cover} alt={s.title} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-on-surface truncate text-sm">{s.title}</p>
                        <p className="font-label-sm text-on-surface-variant truncate text-xs">{s.artist}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-on-surface-variant/50 font-label-sm py-6">No results found</p>
                )
              ) : (
                queue.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => playSong(s, queue, i)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                      i === queueIndex
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="font-label-sm w-5 text-center text-on-surface-variant/60 shrink-0 text-xs">{i + 1}</span>
                    <div className="w-9 h-9 rounded overflow-hidden shrink-0">
                      <img className="w-full h-full object-cover" src={s.cover} alt={s.title} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-label-md truncate text-sm ${i === queueIndex ? "text-primary" : "text-on-surface"}`}>
                        {s.title}
                      </p>
                      <p className="font-label-sm text-on-surface-variant truncate text-xs">{s.artist}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
