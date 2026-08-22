import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await prisma.profile.findMany({
    where: {
      username: { contains: query, mode: "insensitive" },
      ...(user && { id: { not: user.id } }), // no te muestres a ti mismo
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      _count: { select: { followers: true } },
    },
    take: 10,
  });

  const followingSet = new Set<string>();
  if (user && results.length > 0) {
    const rows = await prisma.follow.findMany({
      where: {
        followerId: user.id,
        followingId: { in: results.map((r) => r.id) },
      },
      select: { followingId: true },
    });
    rows.forEach((r) => followingSet.add(r.followingId));
  }

  return NextResponse.json({
    results: results.map((r) => ({
      id: r.id,
      username: r.username,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      bio: r.bio,
      followerCount: r._count.followers,
      isFollowing: followingSet.has(r.id),
    })),
  });
}
