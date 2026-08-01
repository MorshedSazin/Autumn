import { usePlayer } from "../context/PlayerContext";
import { songs, playlists, moods } from "../data/songs";
import Card from "../components/Card";

export default function Home() {
  const { playPlaylist } = usePlayer();

  const featured = songs.slice(0, 3);
  const recent = songs.slice(3, 9);

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-gradient-to-bl from-primary/10 to-transparent -z-10 blur-3xl pointer-events-none" />

      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-on-surface">Made For You</h2>
            <p className="font-body-md text-on-surface-variant">Personalized rhythm based on your pulse.</p>
          </div>
          <button className="text-secondary font-label-md hover:underline cursor-pointer">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((song) => (
            <Card key={song.id} song={song} songs={featured} variant="large" />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-headline-lg text-on-surface mb-6">Recently Played</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recent.map((song) => (
            <Card key={song.id} song={song} songs={recent} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-headline-lg text-on-surface mb-6">Quick Playlists</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {playlists.map((pl) => {
            const plSongs = pl.songIds.map((id) => songs.find((s) => s.id === id)).filter(Boolean);
            return (
              <button
                key={pl.id}
                onClick={() => playPlaylist(plSongs)}
                className="text-left"
              >
                <div className="bg-surface-container-low hover:bg-surface-container-high rounded-lg p-4 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img className="w-full h-full object-cover" src={pl.cover} alt={pl.title} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline-md text-on-surface">{pl.title}</h3>
                      <p className="font-label-sm text-on-surface-variant">{pl.description}</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-headline-lg text-on-surface mb-6">Choose Your Mood</h2>
        <div className="flex flex-wrap gap-4">
          {moods.map((mood, i) => {
            const colors = [
              "hover:bg-primary/20 hover:border-primary/50",
              "hover:bg-secondary/20 hover:border-secondary/50",
              "hover:bg-tertiary/20 hover:border-tertiary/50",
              "hover:bg-surface-variant/50 hover:border-white/20",
            ];
            return (
              <button
                key={mood}
                className={`px-8 py-4 rounded-xl glass-panel text-on-surface font-headline-md flex-1 min-w-[200px] text-center transition-all group overflow-hidden relative cursor-pointer ${colors[i]}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">{mood}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
