import { useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useUserData, USER_PLAYLIST_PREFIX } from "../context/UserDataContext";
import { songs, playlists } from "../data/songs";
import Card from "../components/Card";
import PlayerBar from "../components/PlayerBar";

const tabs = ["Playlists", "All Music"];

export default function Library() {
  const [activeTab, setActiveTab] = useState("Playlists");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const fileInputRef = useRef(null);
  const { playSong, formatTime } = usePlayer();
  const {
    userSongs,
    userPlaylists,
    uploadSongs,
    createPlaylist,
    deletePlaylist,
    addSongsToPlaylist,
    removeSongFromPlaylist,
  } = useUserData();

  const allSongs = [...songs, ...userSongs];
  const allPlaylists = [...playlists, ...userPlaylists];

  const handleCreatePlaylist = async () => {
    const pl = await createPlaylist(newPlaylistName);
    setNewPlaylistName("");
    setShowCreateModal(false);
    setSelectedPlaylist(pl);
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const uploaded = await uploadSongs(files);
    if (uploaded.length > 0) {
      await addSongsToPlaylist(selectedPlaylist.id, uploaded.map((s) => s.id));
    }
  };

  const handleDeletePlaylist = async (pl) => {
    if (!window.confirm(`Delete "${pl.title}"?`)) return;
    await deletePlaylist(pl.id);
    setSelectedPlaylist(null);
  };

  if (selectedPlaylist) {
    const isUserPlaylist = selectedPlaylist.id.startsWith(USER_PLAYLIST_PREFIX);
    const livePlaylist = isUserPlaylist
      ? userPlaylists.find((p) => p.id === selectedPlaylist.id) || selectedPlaylist
      : selectedPlaylist;
    const plSongs = livePlaylist.songIds
      .map((id) => allSongs.find((s) => s.id === id))
      .filter(Boolean);

    return (
      <div className="pb-28">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button onClick={() => setSelectedPlaylist(null)} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[32px]">arrow_back</span>
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="font-headline-lg text-on-surface truncate">{livePlaylist.title}</h2>
            <p className="font-body-md text-on-surface-variant">{livePlaylist.description} · {plSongs.length} tracks</p>
          </div>
          {isUserPlaylist && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-label-md hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add Music
              </button>
              <button
                onClick={() => handleDeletePlaylist(livePlaylist)}
                className="text-on-surface-variant hover:text-red-400 transition-colors cursor-pointer"
                title="Delete playlist"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />

        {plSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">library_music</span>
            <p className="font-body-md text-on-surface-variant/60">No tracks yet</p>
            {isUserPlaylist && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-label-md hover:brightness-110 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">upload</span>
                Upload Music
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {plSongs.map((song, i) => (
              <div
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
                {isUserPlaylist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSongFromPlaylist(livePlaylist.id, song.id);
                    }}
                    className="text-on-surface-variant/40 hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer shrink-0"
                    title="Remove from playlist"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
                <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors">play_arrow</span>
              </div>
            ))}
          </div>
        )}
        <PlayerBar />
      </div>
    );
  }

  return (
    <div className="pb-28">
      <PlayerBar />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-label-md hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Playlist
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-label-md hover:bg-primary/20 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">sort</span>
            Sort
          </button>
        </div>
      </div>

      {activeTab === "Playlists" && (
        <section>
          <h2 className="font-headline-lg text-on-surface mb-6">Your Playlists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPlaylists.map((pl) => {
              const plSongs = pl.songIds.map((id) => allSongs.find((s) => s.id === id)).filter(Boolean);
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
            {allSongs.map((song) => (
              <Card key={song.id} song={song} songs={allSongs} />
            ))}
          </div>
        </section>
      )}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-surface-container-high rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-on-surface mb-4">Create Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
              placeholder="Playlist name..."
              autoFocus
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface font-body-md outline-none focus:ring-1 focus:ring-secondary placeholder:text-on-surface-variant/40 mb-5"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-white/10 text-on-surface-variant rounded-full font-label-md hover:text-on-surface transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="px-5 py-2 bg-primary text-on-primary rounded-full font-label-md hover:brightness-110 transition-all cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
