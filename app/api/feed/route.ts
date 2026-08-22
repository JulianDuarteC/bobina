import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor"); // createdAt ISO de la última reseña vista

  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);
  const hasFollows = followingIds.length > 0;

  const authorFilter = hasFollows
    ? { userId: { in: [...followingIds, user.id] } }
    : {};

  const reviews = await prisma.review.findMany({
    where: {
      ...authorFilter,
      hiddenBySystem: false,
      ...(cursor && { createdAt: { lt: new Date(cursor) } }),
    },
    include: { author: true, movie: true },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });

  const nextCursor =
    reviews.length === PAGE_SIZE
      ? reviews[reviews.length - 1].createdAt.toISOString()
      : null;

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating ? Number(r.rating) : null,
      content: r.content,
      hasSpoilers: r.hasSpoilers,
      isRewatch: r.isRewatch,
      createdAt: r.createdAt.toISOString(),
      likesCount: r.likesCount,
      author: {
        id: r.author.id,
        username: r.author.username,
        displayName: r.author.displayName,
        avatarUrl: r.author.avatarUrl,
      },
      movie: {
        tmdbId: r.movie.tmdbId,
        title: r.movie.title,
        posterPath: r.movie.posterPath,
      },
    })),
    nextCursor,
  });
}
