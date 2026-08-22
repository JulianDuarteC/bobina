import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: { tmdbId: string } }
) {
  const tmdbId = Number(params.tmdbId);
  if (Number.isNaN(tmdbId)) {
    return NextResponse.json({ error: "tmdbId inválido" }, { status: 400 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");

  const reviews = await prisma.review.findMany({
    where: {
      tmdbId,
      hiddenBySystem: false,
      ...(cursor && { createdAt: { lt: new Date(cursor) } }),
    },
    include: { author: true },
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
    })),
    nextCursor,
  });
}
