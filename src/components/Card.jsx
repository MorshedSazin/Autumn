import { usePlayer } from "../context/PlayerContext";

export default function Card({ song, songs, variant = "small" }) {
  const { playSong, isPlaying, currentSong, addToQueue } = usePlayer();

  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    const queue = songs || [song];
    const idx = queue.findIndex((s) => s.id === song.id);
    playSong(song, queue, idx);
  };

  const handleAddToQueue = (e) => {
    e.stopPropagation();
    addToQueue(song);
  };

  if (variant === "large") {
    return (
      <div
        onClick={handlePlay}
        className="group relative rounded-xl overflow-hidden bg-surface-container aspect-[16/9] cursor-pointer transition-all duration-300"
        style={{ boxShadow: isCurrent ? "0 0 20px rgba(187, 134, 252, 0.3)" : "none" }}
      >
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src={song.cover}
            alt={song.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </div>
        <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
          <span className="px-2 py-1 bg-primary text-on-primary font-label-sm rounded mb-3 inline-block">
            {song.album?.toUpperCase() || "SINGLE"}
          </span>
          <h3 className="font-headline-md text-white">{song.title}</h3>
          <p className="font-body-md text-on-surface-variant line-clamp-1">{song.artist}</p>
        </div>
        <button className="absolute right-6 bottom-6 w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isThisPlaying ? "pause" : "play_arrow"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handlePlay}
      className={`bg-surface-container-low hover:bg-surface-container-high rounded-lg p-3 transition-all cursor-pointer group ${isCurrent ? "ring-1 ring-primary" : ""}`}
    >
      <div className="aspect-square rounded-md overflow-hidden mb-3 relative">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src={song.cover}
          alt={song.title}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isThisPlaying ? "pause_circle" : "play_circle"}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <h4 className="font-label-md text-on-surface truncate">{song.title}</h4>
          <p className="font-label-sm text-on-surface-variant truncate">{song.artist}</p>
        </div>
        <button
          onClick={handleAddToQueue}
          className="text-on-surface-variant hover:text-secondary transition-colors ml-2 shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Add to queue"
        >
          <span className="material-symbols-outlined text-lg">playlist_add</span>
        </button>
      </div>
    </div>
  );
}
