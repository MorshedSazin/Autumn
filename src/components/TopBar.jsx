import { useLocation } from "react-router-dom";
import { useState } from "react";

const pageTitles = {
  "/library": "Library",
  "/now-playing": "Now Playing",
};

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const showSearch = location.pathname !== "/now-playing";

  return (
    <header className="sticky top-0 bg-surface/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-4 sm:px-8 h-16 sm:h-20 z-30">
      <div className="flex items-center flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer shrink-0 mr-3"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[28px]">menu</span>
        </button>
        {showSearch ? (
          <div className="relative w-full max-w-xl mx-auto">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container/50 border-none focus:ring-1 focus:ring-secondary rounded-full py-2.5 pl-12 pr-6 text-on-surface placeholder:text-on-surface-variant/50 font-body-md outline-none"
              placeholder="Search artists, tracks, or vibes..."
            />
          </div>
        ) : (
          <h2 className="font-headline-lg text-on-surface truncate">{pageTitles[location.pathname] || "Autumn"}</h2>
        )}
      </div>
    </header>
  );
}
