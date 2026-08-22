import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";

export function MoviePoster({
  tmdbId,
  title,
  posterPath,
  badge,
}: {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  badge?: string;
}) {
  const src = posterUrl(posterPath, "w342");

  return (
    <Link
      href={`/movies/${tmdbId}`}
      className="group relative block overflow-hidden rounded-sm bg-reel-800 transition-transform hover:-translate-y-0.5"
    >
      <div className="aspect-[2/3] w-full">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            sizes="(max-width: 640px) 33vw, 160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center font-body text-xs text-frame-200/50">
            {title}
          </div>
        )}
      </div>

      {badge && (
        <span className="absolute right-1 top-1 rounded-sm bg-reel-950/85 px-1.5 py-0.5 font-body text-[11px] font-semibold text-marquee-400">
          {badge}
        </span>
      )}

      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-reel-950/90 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <p className="p-2 font-body text-xs text-frame-50 line-clamp-2">
          {title}
        </p>
      </div>
    </Link>
  );
}
