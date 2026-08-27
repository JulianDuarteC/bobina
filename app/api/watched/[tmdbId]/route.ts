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

  await getMovieDetail(tmdbId); // asegura la FK a movies_cache

  // upsert: si ya estaba marcada, no pasa nada (evita duplicados sin
  // importar cuántas veces le den clic).
  await prisma.watchedItem.upsert({
    where: { userId_tmdbId: { userId: user.id, tmdbId } },
    create: { userId: user.id, tmdbId },
    update: {},
  });

  // Si estaba en la watchlist, la sacamos: ya se vio.
  await prisma.watchlistItem
    .delete({ where: { userId_tmdbId: { userId: user.id, tmdbId } } })
    .catch(() => null);

  return NextResponse.json({ watched: true });
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

  await prisma.watchedItem
    .delete({ where: { userId_tmdbId: { userId: user.id, tmdbId } } })
    .catch(() => null);

  return NextResponse.json({ watched: false });
}
