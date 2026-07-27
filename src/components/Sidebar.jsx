import { NavLink } from "react-router-dom";

const links = [
  { to: "/library", icon: "library_music", label: "Library" },
  { to: "/now-playing", icon: "equalizer", label: "Now Playing" },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface border-r border-white/5 flex flex-col py-8 px-4 space-y-6 z-40">
      <div className="px-4 mb-8">
        <h1 className="font-display-lg text-[28px] leading-8 text-primary tracking-tighter font-bold">Autumn</h1>
        <p className="font-label-md text-on-surface-variant/60">Electric Audio</p>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "text-primary border-r-4 border-primary bg-primary/5"
                  : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
              }`
            }
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              {link.icon}
            </span>
            <span className="font-label-md">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
