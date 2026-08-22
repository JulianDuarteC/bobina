"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Check } from "lucide-react";

export function MarkWatchedButton({
  tmdbId,
  variant = "icon",
}: {
  tmdbId: number;
  variant?: "icon" | "full";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function markWatched(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdbId }),
    });

    if (res.ok) {
      setDone(true);
      router.refresh();
    }

    setLoading(false);
  }

  if (variant === "full") {
    return (
      <button onClick={markWatched} disabled={loading || done} className="btn-ghost flex items-center gap-1.5">
        {done ? (
          <>
            <Check size={15} strokeWidth={2.5} /> Vista
          </>
        ) : (
          "Marcar como vista"
        )}
      </button>
    );
  }

  return (
    <button
      onClick={markWatched}
      disabled={loading || done}
      aria-label="Marcar como vista"
      title="Marcar como vista"
      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
        done
          ? "bg-emerald_reel-500 text-frame-50"
          : "bg-reel-950/80 text-frame-50 hover:bg-emerald_reel-500"
      }`}
    >
      <Eye size={16} strokeWidth={2} />
    </button>
  );
}
