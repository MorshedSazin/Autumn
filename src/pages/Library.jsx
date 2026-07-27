import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songs, playlists } from "../data/songs";
import Card from "../components/Card";
import PlayerBar from "../components/PlayerBar";

const tabs = ["Playlists", "All Music"];

export default function Library() {
  const [activeTab, setActiveTab] = useState("Playlists");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const { playSong, formatTime } = usePlayer();

  const handleBack = () => setSelectedPlaylist(null);

  if (selectedPlaylist) {
    const plSongs = selectedPlaylist.songIds.map((id) => songs.find((s) => s.id === id)).filter(Boolean);
    return (
      <div className="pb-28">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={handleBack} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[32px]">arrow_back</span>
          </button>
          <div>
            <h2 className="font-headline-lg text-on-surface">{selectedPlaylist.title}</h2>
            <p className="font-body-md text-on-surface-variant">{selectedPlaylist.description} · {plSongs.length} tracks</p>
          </div>
        </div>

        <div className="space-y-1">
          {plSongs.map((song, i) => (
            <button
              key={song.id}
              onClick={() => playSong(song, plSongs, i)}
              className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer text-left group"
            >
              <span className="font-label-sm text-on-surface-variant/60 w-6 text-center shrink-0">{i + 1}</span>
              <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src={song.cover} alt={song.title} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label-md text-on-surface truncate">{song.title}</p>
                <p className="font-label-sm text-on-surface-variant truncate">{song.artist}</p>
              </div>
              <span className="font-label-sm text-on-surface-variant/60 shrink-0">
                {formatTime(song.duration)}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors">play_arrow</span>
            </button>
          ))}
        </div>
        <PlayerBar />
      </div>
    );
  }

  return (
    <div className="pb-28">
      <PlayerBar />
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-label-md pb-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-label-md hover:bg-primary/20 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">sort</span>
          Sort
        </button>
      </div>

      {activeTab === "Playlists" && (
        <section>
          <h2 className="font-headline-lg text-on-surface mb-6">Your Playlists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((pl) => {
              const plSongs = pl.songIds.map((id) => songs.find((s) => s.id === id)).filter(Boolean);
              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="bg-surface-container-low hover:bg-surface-container-high rounded-xl p-4 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg">
                      <img className="w-full h-full object-cover" src={pl.cover} alt={pl.title} />
                    </div>
                    <div>
                      <h3 className="font-headline-md text-on-surface">{pl.title}</h3>
                      <p className="font-label-sm text-on-surface-variant">{pl.description}</p>
                      <p className="font-label-sm text-on-surface-variant/60 mt-1">{plSongs.length} tracks</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "All Music" && (
        <section>
          <h2 className="font-headline-lg text-on-surface mb-6">All Music</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {songs.map((song) => (
              <Card key={song.id} song={song} songs={songs} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
