"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarRatingInput } from "./StarRatingInput";

export function CreateReviewModal({
  tmdbId,
  movieTitle,
  onClose,
  mode = "create",
  reviewId,
  initialRating = 0,
  initialContent = "",
  initialHasSpoilers = false,
  initialIsRewatch = false,
  initialWatchedDate,
}: {
  tmdbId: number;
  movieTitle: string;
  onClose: () => void;
  mode?: "create" | "edit";
  reviewId?: string;
  initialRating?: number;
  initialContent?: string;
  initialHasSpoilers?: boolean;
  initialIsRewatch?: boolean;
  initialWatchedDate?: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const [hasSpoilers, setHasSpoilers] = useState(initialHasSpoilers);
  const [isRewatch, setIsRewatch] = useState(initialIsRewatch);
  const [watchedDate, setWatchedDate] = useState(
    initialWatchedDate ?? new Date().toISOString().slice(0, 10)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const url = mode === "edit" ? `/api/reviews/${reviewId}` : "/api/reviews";
    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbId,
        rating: rating > 0 ? rating : null,
        content: content.trim() || null,
        hasSpoilers,
        isRewatch,
        watchedDate,
      }),
    });

    if (!res.ok) {
      setError("No pudimos guardar tu reseña. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="ticket-card w-full max-w-lg px-6 py-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 font-display text-xl tracking-marquee text-frame-50">
          {mode === "edit" ? "Editar reseña" : "Escribir reseña"}
        </h2>
        <p className="mb-5 font-body text-sm text-frame-200/60">
          {movieTitle}
        </p>

        <div className="space-y-5">
          <div>
            <label className="field-label">Calificación</label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label htmlFor="watchedDate" className="field-label">
              Fecha en que la viste
            </label>
            <input
              id="watchedDate"
              type="date"
              value={watchedDate}
              onChange={(e) => setWatchedDate(e.target.value)}
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="content" className="field-label">
              Reseña (opcional)
            </label>
            <textarea
              id="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué te pareció?"
              className="field-input resize-none"
            />
          </div>

          <div className="flex gap-6 font-body text-sm text-frame-100/90">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasSpoilers}
                onChange={(e) => setHasSpoilers(e.target.checked)}
                className="accent-marquee-500"
              />
              Contiene spoilers
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRewatch}
                onChange={(e) => setIsRewatch(e.target.checked)}
                className="accent-marquee-500"
              />
              Revisitado (rewatch)
            </label>
          </div>

          {error && <p className="text-sm text-marquee-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting
                ? "Guardando..."
                : mode === "edit"
                  ? "Guardar cambios"
                  : "Publicar reseña"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
