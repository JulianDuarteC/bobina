"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { posterUrl } from "@/lib/tmdb";
import { CreateReviewModal } from "./CreateReviewModal";
import { ReportButton } from "@/components/moderation/ReportButton";

export type ReviewData = {
  id: string;
  rating: number | null;
  content: string | null;
  hasSpoilers: boolean;
  isRewatch: boolean;
  createdAt: string;
  likesCount: number;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  movie?: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
  };
};

export function ReviewFeedItem({
  review,
  isLoggedIn,
  currentUserId,
  contextTmdbId,
  contextMovieTitle,
}: {
  review: ReviewData;
  isLoggedIn: boolean;
  currentUserId?: string | null;
  contextTmdbId?: number;
  contextMovieTitle?: string;
}) {
  const router = useRouter();
  const [spoilerRevealed, setSpoilerRevealed] = useState(!review.hasSpoilers);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review.likesCount);
  const [pulsing, setPulsing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const isOwnReview = currentUserId === review.author.id;

  async function handleDelete() {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar esta reseña? No se puede deshacer."
    );
    if (!confirmed) return;

    setDeleting(true);
    const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });

    if (res.ok) {
      setDeleted(true);
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  async function toggleLike() {
    if (!isLoggedIn) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((c) => c + (nextLiked ? 1 : -1));

    if (nextLiked) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 300);
    }

    const res = await fetch(`/api/reviews/${review.id}/like`, {
      method: nextLiked ? "POST" : "DELETE",
    });

    if (!res.ok) {
      // revertir si falló
      setLiked(!nextLiked);
      setLikesCount((c) => c + (nextLiked ? -1 : 1));
    }
  }

  return deleted ? null : (
    <article className="rounded-md bg-reel-900/60 p-5 sm:p-6">
      <div className="flex gap-4">
        {/* Avatar */}
        <Link href={`/${review.author.username}`} className="shrink-0">
          <div className="h-11 w-11 overflow-hidden rounded-full bg-reel-700">
            {review.author.avatarUrl ? (
              <Image
                src={review.author.avatarUrl}
                alt={review.author.username}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-base text-marquee-500">
                {review.author.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          {/* Fila de identidad: nombre + metadatos secundarios separados con puntos */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/${review.author.username}`}
              className="font-body text-sm font-semibold text-frame-50 hover:text-marquee-400"
            >
              {review.author.displayName || review.author.username}
            </Link>

            <span className="font-body text-xs text-frame-200/40">
              {new Date(review.createdAt).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "short",
              })}
            </span>

            {review.isRewatch && (
              <>
                <span className="text-frame-200/30">·</span>
                <span className="font-body text-xs text-frame-200/50">
                  revisitado
                </span>
              </>
            )}
          </div>

          {/* Calificación: como badge propio, con su propia línea de aire */}
          {review.rating && (
            <div className="mt-2 font-body text-sm tracking-wide text-marquee-400">
              {"★".repeat(Math.floor(review.rating))}
              {review.rating % 1 !== 0 ? "½" : ""}
            </div>
          )}

          {/* Película reseñada (solo aparece en feeds multi-película) */}
          {review.movie && (
            <Link
              href={`/movies/${review.movie.tmdbId}`}
              className="group/movie mt-3 flex items-center gap-3"
            >
              {posterUrl(review.movie.posterPath, "w342") && (
                <div className="h-14 w-10 shrink-0 overflow-hidden rounded-[3px] bg-reel-800">
                  <Image
                    src={posterUrl(review.movie.posterPath, "w342")!}
                    alt=""
                    width={40}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <span className="font-body text-sm font-medium text-frame-100/90 group-hover/movie:text-marquee-400">
                {review.movie.title}
              </span>
            </Link>
          )}

          {/* Texto de la reseña o aviso de spoiler */}
          {review.content && (
            <div className="mt-3">
              {spoilerRevealed ? (
                <p className="font-body text-sm leading-relaxed text-frame-100/90">
                  {review.content}
                </p>
              ) : (
                <button
                  onClick={() => setSpoilerRevealed(true)}
                  className="flex w-full items-center gap-2 rounded-sm border border-reel-700 bg-reel-800 px-4 py-3 text-left font-body text-xs text-frame-200/70 transition-colors hover:border-marquee-500 hover:text-frame-50"
                >
                  <TriangleAlert size={14} strokeWidth={2} />
                  Esta reseña contiene spoilers — clic para mostrar
                </button>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="mt-4 flex items-center gap-1">
            <button
              onClick={toggleLike}
              disabled={!isLoggedIn}
              className={`-ml-2 flex items-center gap-1.5 rounded-sm px-2 py-1 font-body text-xs transition-colors hover:bg-reel-800 ${
                liked ? "text-marquee-400" : "text-frame-200/50"
              } disabled:cursor-default disabled:hover:bg-transparent`}
            >
              <span
                className={`inline-block transition-transform duration-300 ${pulsing ? "scale-125" : "scale-100"}`}
              >
                <Heart size={14} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
              </span>
              <span>{likesCount}</span>
            </button>

            {isOwnReview && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-sm px-2 py-1 font-body text-xs text-frame-200/50 transition-colors hover:bg-reel-800 hover:text-frame-100"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-sm px-2 py-1 font-body text-xs text-frame-200/50 transition-colors hover:bg-reel-800 hover:text-marquee-400"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </>
            )}

            {!isOwnReview && isLoggedIn && (
              <div className="ml-1">
                <ReportButton contentType="REVIEW" contentId={review.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <CreateReviewModal
          mode="edit"
          reviewId={review.id}
          tmdbId={review.movie?.tmdbId ?? contextTmdbId ?? 0}
          movieTitle={review.movie?.title ?? contextMovieTitle ?? ""}
          initialRating={review.rating ?? 0}
          initialContent={review.content ?? ""}
          initialHasSpoilers={review.hasSpoilers}
          initialIsRewatch={review.isRewatch}
          onClose={() => setEditing(false)}
        />
      )}
    </article>
  );
}
