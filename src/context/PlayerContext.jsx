import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { songs } from "../data/songs";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off");

  const handleNextRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setCurrentTime(0);
      } else {
        handleNextRef.current();
      }
    };
    const onError = () => {
      if (currentSong) {
        setIsPlaying(false);
      }
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [currentSong, repeat]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playSong = useCallback((song, songQueue, index) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.src = song.audio;
    audio.play().catch(() => {});
    setCurrentSong(song);
    setQueue(songQueue || [song]);
    setQueueIndex(index ?? 0);
    setIsPlaying(true);
    setCurrentTime(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === "all") nextIndex = 0;
        else return;
      }
    }
    const nextSong = queue[nextIndex];
    playSong(nextSong, queue, nextIndex);
  }, [queue, queueIndex, shuffle, repeat, playSong]);

  handleNextRef.current = handleNext;

  const handlePrev = useCallback(() => {
    if (queue.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) prevIndex = repeat === "all" ? queue.length - 1 : 0;
    const prevSong = queue[prevIndex];
    playSong(prevSong, queue, prevIndex);
  }, [queue, queueIndex, repeat, playSong]);

  const seek = useCallback((time) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const addToQueue = useCallback((song) => {
    setQueue((prev) => {
      if (prev.find((s) => s.id === song.id)) return prev;
      return [...prev, song];
    });
  }, []);

  const playPlaylist = useCallback((playlistSongs) => {
    if (playlistSongs.length === 0) return;
    playSong(playlistSongs[0], playlistSongs, 0);
  }, [playSong]);

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    queue,
    queueIndex,
    setVolume,
    setShuffle: () => setShuffle((s) => !s),
    setRepeat: () => setRepeat((r) => (r === "off" ? "one" : r === "one" ? "all" : "off")),
    playSong,
    togglePlay,
    handleNext,
    handlePrev,
    seek,
    formatTime,
    addToQueue,
    playPlaylist,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
