"use client";

import { useState } from "react";
import { ReviewFeedItem, type ReviewData } from "@/components/reviews/ReviewFeedItem";
import { AdSlotFeed } from "@/components/ads/AdSlotFeed";

export function FeedList({
  initialReviews,
  initialNextCursor,
  currentUserId,
}: {
  initialReviews: ReviewData[];
  initialNextCursor: string | null;
  currentUserId: string;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor) return;
    setLoading(true);

    const res = await fetch(`/api/feed?cursor=${encodeURIComponent(nextCursor)}`);
    const data = await res.json();

    setReviews((prev) => [...prev, ...data.reviews]);
    setNextCursor(data.nextCursor);
    setLoading(false);
  }

  return (
    <div>
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={review.id}>
            <ReviewFeedItem
              review={review}
              isLoggedIn
              currentUserId={currentUserId}
            />
            {/* Anuncio nativo cada 10 elementos, como pedía el SRS */}
            {(index + 1) % 10 === 0 && <AdSlotFeed />}
          </div>
        ))}
      </div>

      {nextCursor && (
        <div className="mt-6 flex justify-center">
          <button onClick={loadMore} disabled={loading} className="btn-ghost">
            {loading ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </div>
  );
}
