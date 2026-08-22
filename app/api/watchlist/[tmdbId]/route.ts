import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getMovieDetail } from "@/lib/tmdb";

export async function POST(
  _request: NextRequest,
  { params }: { params: { tmdbId: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tmdbId = Number(params.tmdbId);
  if (Number.isNaN(tmdbId)) {
    return NextResponse.json({ error: "tmdbId inválido" }, { status: 400 });
  }

  // Asegura que la película exista en caché antes de referenciarla
  // (respeta la FK de watchlist_items -> movies_cache).
  await getMovieDetail(tmdbId);

  await prisma.watchlistItem.upsert({
    where: { userId_tmdbId: { userId: user.id, tmdbId } },
    create: { userId: user.id, tmdbId },
    update: {},
  });

  return NextResponse.json({ inWatchlist: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { tmdbId: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tmdbId = Number(params.tmdbId);

  await prisma.watchlistItem
    .delete({ where: { userId_tmdbId: { userId: user.id, tmdbId } } })
    .catch(() => null);

  return NextResponse.json({ inWatchlist: false });
}
