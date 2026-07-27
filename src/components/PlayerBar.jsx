import { usePlayer } from "../context/PlayerContext";

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    setVolume,
    setShuffle,
    setRepeat,
    togglePlay,
    handleNext,
    handlePrev,
    seek,
    formatTime,
  } = usePlayer();

  if (!currentSong) {
    return (
      <footer className="fixed bottom-0 left-0 w-full h-24 bg-surface-container/90 backdrop-blur-3xl border-t border-white/10 flex items-center justify-between px-8 z-50">
        <div className="text-on-surface-variant/50 font-label-md w-full text-center">
          Select a track to start listening
        </div>
      </footer>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    seek(pct * duration);
  };

  const repeatIcon = repeat === "one" ? "repeat_one" : "repeat";

  return (
    <footer className="fixed bottom-0 left-0 w-full h-24 bg-surface-container/90 backdrop-blur-3xl border-t border-white/10 flex items-center justify-between px-4 md:px-8 z-50">
      <div className="flex items-center gap-4 w-1/3 min-w-0">
        <div className="w-14 h-14 rounded-md overflow-hidden shrink-0 shadow-[0_0_15px_rgba(70,245,224,0.2)]">
          <img
            className="w-full h-full object-cover"
            src={currentSong.cover}
            alt={currentSong.title}
          />
        </div>
        <div className="min-w-0">
          <h5 className="font-label-md text-on-surface truncate">{currentSong.title}</h5>
          <p className="font-label-sm text-on-surface-variant truncate hover:text-secondary cursor-pointer transition-colors">
            {currentSong.artist}
          </p>
        </div>
        <button className="ml-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer shrink-0">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 w-1/3 max-w-xl">
        <div className="flex items-center gap-6 md:gap-8">
          <button
            onClick={setShuffle}
            className={`transition-all active:scale-90 cursor-pointer ${shuffle ? "text-secondary" : "text-on-surface-variant hover:text-primary"}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${shuffle ? 1 : 0}` }}>
              shuffle
            </span>
          </button>
          <button onClick={handlePrev} className="text-on-surface-variant hover:text-primary transition-all active:scale-90 cursor-pointer">
            <span className="material-symbols-outlined">skip_previous</span>
          </button>
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_15px_rgba(218,185,255,0.4)] cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>
          <button onClick={handleNext} className="text-on-surface-variant hover:text-primary transition-all active:scale-90 cursor-pointer">
            <span className="material-symbols-outlined">skip_next</span>
          </button>
          <button
            onClick={setRepeat}
            className={`transition-all active:scale-90 cursor-pointer ${repeat !== "off" ? "text-secondary drop-shadow-[0_0_8px_rgba(70,245,224,0.6)]" : "text-on-surface-variant hover:text-primary"}`}
          >
            <span className="material-symbols-outlined">{repeatIcon}</span>
          </button>
        </div>
        <div className="w-full flex items-center gap-3">
          <span className="font-label-sm text-on-surface-variant w-10 text-right shrink-0">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #dab9ff 0%, #46f5e0 100%)",
              }}
            />
          </div>
          <span className="font-label-sm text-on-surface-variant w-10 shrink-0">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 w-1/4">
        <button className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
          <span className="material-symbols-outlined">queue_music</span>
        </button>
        <div className="flex items-center gap-2 group">
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">
            {volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
          </span>
          <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setVolume(Math.min(1, Math.max(0, x / rect.width)));
            }}
          >
            <div className="h-full bg-on-surface-variant group-hover:bg-secondary transition-colors" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
        <button className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
          <span className="material-symbols-outlined">fullscreen</span>
        </button>
      </div>
    </footer>
  );
}
