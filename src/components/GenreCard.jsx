import { genreImages } from "../data/songs";

export default function GenreCard({ genre, className = "" }) {
  const bgImage = genreImages[genre.name] || "";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl cursor-pointer ${className}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)"
      }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
        <h3 className="font-headline-md text-white">{genre.name}</h3>
        <p className="text-on-surface-variant font-label-sm">{genre.count}</p>
      </div>
    </div>
  );
}
