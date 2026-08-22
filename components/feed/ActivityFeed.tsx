import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FeedList } from "./FeedList";

const PAGE_SIZE = 20;

export async function ActivityFeed({ userId }: { userId: string }) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);
  const hasFollows = followingIds.length > 0;

  // Si el usuario no sigue a nadie todavía, mostramos un feed global
  // reciente para que la página no se sienta vacía, con un aviso.
  const authorFilter = hasFollows
    ? { userId: { in: [...followingIds, userId] } }
    : {};

  const reviews = await prisma.review.findMany({
    where: { ...authorFilter, hiddenBySystem: false },
    include: { author: true, movie: true },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });

  const nextCursor =
    reviews.length === PAGE_SIZE
      ? reviews[reviews.length - 1].createdAt.toISOString()
      : null;

  const mappedReviews = reviews.map((review) => ({
    id: review.id,
    rating: review.rating ? Number(review.rating) : null,
    content: review.content,
    hasSpoilers: review.hasSpoilers,
    isRewatch: review.isRewatch,
    createdAt: review.createdAt.toISOString(),
    likesCount: review.likesCount,
    author: {
      id: review.author.id,
      username: review.author.username,
      displayName: review.author.displayName,
      avatarUrl: review.author.avatarUrl,
    },
    movie: {
      tmdbId: review.movie.tmdbId,
      title: review.movie.title,
      posterPath: review.movie.posterPath,
    },
  }));

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-1 font-display text-2xl tracking-marquee text-frame-50">
        Tu feed
      </h1>

      {!hasFollows && (
        <p className="mb-6 font-body text-sm text-frame-200/60">
          Todavía no sigues a nadie, así que te mostramos actividad reciente
          de toda la comunidad.{" "}
          <Link href="/search" className="text-marquee-500 hover:underline">
            Busca películas
          </Link>{" "}
          y explora reseñas de otras personas para empezar a seguirlas.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-frame-200/60">
          Todavía no hay reseñas en Bobina.{" "}
          <Link href="/search" className="text-marquee-500 hover:underline">
            Sé la primera persona en escribir una
          </Link>
          .
        </p>
      ) : (
        <FeedList
          initialReviews={mappedReviews}
          initialNextCursor={nextCursor}
          currentUserId={userId}
        />
      )}
    </main>
  );
}
