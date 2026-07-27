import { useState } from "react";
import { songs, genres, trendingTags } from "../data/songs";
import Card from "../components/Card";
import GenreCard from "../components/GenreCard";

export default function Discover() {
  const [search, setSearch] = useState("");

  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-20" />

      <section className="max-w-4xl mx-auto mb-16">
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-secondary transition-colors">
              search
            </span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border-b border-white/10 px-16 py-6 text-headline-md font-headline-md focus:outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/30 text-on-surface"
            placeholder="Artists, tracks, or frequencies..."
          />
        </div>
        <div className="flex flex-wrap gap-4 mt-6 items-center">
          <span className="font-label-sm text-on-surface-variant/60 uppercase tracking-widest py-2">Trending:</span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearch(tag.replace("#", ""))}
              className="px-4 py-2 bg-surface-variant/30 rounded-full font-label-md hover:bg-primary/20 hover:text-primary transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {search ? (
        <section className="max-w-7xl mx-auto">
          <h2 className="font-headline-lg text-on-surface mb-6">Search Results</h2>
          {filtered.length === 0 ? (
            <p className="text-on-surface-variant font-body-md">No tracks found for "{search}"</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filtered.map((song) => (
                <Card key={song.id} song={song} songs={filtered} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="max-w-7xl mx-auto">
          <h2 className="font-headline-lg text-on-surface mb-8 tracking-tight">Explore Genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[240px]">
            <div className="col-span-2 row-span-2">
              <GenreCard genre={genres[0]} />
            </div>
            {genres.slice(1).map((genre) => (
              <GenreCard key={genre.id} genre={genre} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
