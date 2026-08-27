"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { posterUrl } from "@/lib/tmdb";

type MovieRef = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
};

export function WatchedGrid({
  initialItems,
  emptyLabel,
}: {
  initialItems: MovieRef[];
  emptyLabel: string;
}) {
  const [items, setItems] = useState(initialItems);

  async function unmark(tmdbId: number) {
    setItems((prev) => prev.filter((i) => i.tmdbId !== tmdbId));
    await fetch(`/api/watched/${tmdbId}`, { method: "DELETE" });
  }

  if (items.length === 0) {
    return (
      <p className="py-12 text-center font-body text-sm text-frame-200/60">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {items.map((movie) => {
        const src = posterUrl(movie.posterPath, "w342");
        return (
          <div key={movie.tmdbId} className="flex flex-col gap-1.5">
            <Link
              href={`/movies/${movie.tmdbId}`}
              className="relative block aspect-[2/3] overflow-hidden rounded-sm bg-reel-800"
            >
              {src ? (
                <Image
                  src={src}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 640px) 33vw, 160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-center font-body text-xs text-frame-200/50">
                  {movie.title}
                </div>
              )}
            </Link>

            <button
              onClick={() => unmark(movie.tmdbId)}
              className="flex w-full items-center justify-center gap-1 rounded-sm border border-reel-700 py-1.5 font-body text-xs text-frame-200/70 transition-colors hover:border-marquee-500 hover:text-marquee-400"
            >
              <X size={12} strokeWidth={2.5} />
              Desmarcar
            </button>
          </div>
        );
      })}
    </div>
  );
}
