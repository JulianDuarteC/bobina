"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";

export function WatchlistButton({
  tmdbId,
  initiallyInWatchlist,
  variant = "icon",
}: {
  tmdbId: number;
  initiallyInWatchlist: boolean;
  variant?: "icon" | "full";
}) {
  const router = useRouter();
  const [inWatchlist, setInWatchlist] = useState(initiallyInWatchlist);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); // evita navegar si está dentro de un <Link>
    e.stopPropagation();
    setLoading(true);

    const method = inWatchlist ? "DELETE" : "POST";
    const nextState = !inWatchlist;
    setInWatchlist(nextState);

    const res = await fetch(`/api/watchlist/${tmdbId}`, { method });

    if (!res.ok) {
      setInWatchlist(!nextState);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        className={inWatchlist ? "btn-ghost" : "btn-primary"}
      >
        {inWatchlist ? "En tu watchlist" : "Añadir a watchlist"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={inWatchlist ? "Quitar de watchlist" : "Añadir a watchlist"}
      title={inWatchlist ? "Quitar de watchlist" : "Añadir a watchlist"}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
        inWatchlist
          ? "bg-marquee-500 text-frame-50"
          : "bg-reel-950/80 text-frame-50 hover:bg-marquee-500 hover:text-frame-50"
      }`}
    >
      {inWatchlist ? (
        <Check size={16} strokeWidth={2.5} />
      ) : (
        <Plus size={16} strokeWidth={2.5} />
      )}
    </button>
  );
}
