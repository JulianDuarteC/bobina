"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Check } from "lucide-react";

export function MarkWatchedButton({
  tmdbId,
  variant = "icon",
  initiallyWatched = false,
}: {
  tmdbId: number;
  variant?: "icon" | "full";
  /** Estado real conocido de antemano (ej. en la ficha de película, donde
      sí consultamos la base de datos). En tarjetas de búsqueda/Explorar
      no siempre se conoce de antemano — igual funciona bien: el
      endpoint es idempotente, así que no genera duplicados. */
  initiallyWatched?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [watched, setWatched] = useState(initiallyWatched);

  async function toggleWatched(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const method = watched ? "DELETE" : "POST";
    const nextState = !watched;
    setWatched(nextState);

    const res = await fetch(`/api/watched/${tmdbId}`, { method });

    if (!res.ok) {
      setWatched(!nextState); // revertir si falló
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  if (variant === "full") {
    return (
      <button
        onClick={toggleWatched}
        disabled={loading}
        className={watched ? "btn-primary flex items-center gap-1.5" : "btn-ghost flex items-center gap-1.5"}
      >
        {watched ? (
          <>
            <Check size={15} strokeWidth={2.5} /> Vista — quitar
          </>
        ) : (
          "Marcar como vista"
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleWatched}
      disabled={loading}
      aria-label={watched ? "Desmarcar como vista" : "Marcar como vista"}
      title={watched ? "Desmarcar como vista" : "Marcar como vista"}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
        watched
          ? "bg-emerald_reel-500 text-frame-50"
          : "bg-reel-950/80 text-frame-50 hover:bg-emerald_reel-500"
      }`}
    >
      <Eye size={16} strokeWidth={2} />
    </button>
  );
}
