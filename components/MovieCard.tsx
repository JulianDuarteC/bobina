import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { WatchlistButton } from "./WatchlistButton";
import { MarkWatchedButton } from "./MarkWatchedButton";

export function MovieCard({
  tmdbId,
  title,
  posterPath,
  year,
  averageRating,
  inWatchlist,
  isLoggedIn,
}: {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year?: string | null;
  averageRating?: number | null;
  inWatchlist?: boolean;
  isLoggedIn: boolean;
}) {
  const src = posterUrl(posterPath, "w342");

  return (
    <Link
      href={`/movies/${tmdbId}`}
      className="group relative block overflow-hidden rounded-sm bg-reel-800 transition-transform hover:-translate-y-0.5"
    >
      <div className="relative aspect-[2/3] w-full">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            sizes="(max-width: 640px) 33vw, 200px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center font-body text-xs text-frame-200/50">
            {title}
          </div>
        )}

        {typeof averageRating === "number" && (
          <span className="absolute left-1.5 top-1.5 rounded-sm bg-reel-950/85 px-1.5 py-0.5 font-body text-[11px] font-semibold text-marquee-400">
            ★ {averageRating.toFixed(1)}
          </span>
        )}

        {/* Acciones rápidas: solo si hay sesión, aparecen al hover */}
        {isLoggedIn && (
          <div className="absolute right-1.5 top-1.5 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <WatchlistButton
              tmdbId={tmdbId}
              initiallyInWatchlist={Boolean(inWatchlist)}
            />
            <MarkWatchedButton tmdbId={tmdbId} />
          </div>
        )}

        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-reel-950/90 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="p-2">
            <p className="font-body text-xs font-medium text-frame-50 line-clamp-2">
              {title}
            </p>
            {year && (
              <p className="font-body text-[11px] text-frame-200/70">{year}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
