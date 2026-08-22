"use client";

import { useState } from "react";
import { CreateReviewModal } from "./CreateReviewModal";
import { ReviewFeedItem, type ReviewData } from "./ReviewFeedItem";

export function ReviewSection({
  tmdbId,
  movieTitle,
  reviews: initialReviews,
  isLoggedIn,
  currentUserId,
  initialNextCursor,
}: {
  tmdbId: number;
  movieTitle: string;
  reviews: ReviewData[];
  isLoggedIn: boolean;
  currentUserId?: string | null;
  initialNextCursor?: string | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);
  const [nextCursor, setNextCursor] = useState(initialNextCursor ?? null);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);

    const res = await fetch(
      `/api/movies/${tmdbId}/reviews?cursor=${encodeURIComponent(nextCursor)}`
    );
    const data = await res.json();

    setReviews((prev) => [...prev, ...data.reviews]);
    setNextCursor(data.nextCursor);
    setLoadingMore(false);
  }

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg tracking-marquee text-frame-50">
          Reseñas
        </h2>
        {isLoggedIn && (
          <button onClick={() => setModalOpen(true)} className="btn-ghost">
            Escribir reseña
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="font-body text-sm text-frame-200/60">
          Todavía no hay reseñas para esta película. ¡Sé el primero!
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewFeedItem
                key={review.id}
                review={review}
                isLoggedIn={isLoggedIn}
                currentUserId={currentUserId}
                contextTmdbId={tmdbId}
                contextMovieTitle={movieTitle}
              />
            ))}
          </div>

          {nextCursor && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-ghost"
              >
                {loadingMore ? "Cargando..." : "Cargar más"}
              </button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <CreateReviewModal
          tmdbId={tmdbId}
          movieTitle={movieTitle}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}
