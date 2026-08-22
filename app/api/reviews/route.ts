import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getMovieDetail } from "@/lib/tmdb";
import { filterProfanity, containsSpoilerKeywords } from "@/lib/moderation";

// Versión mínima: soporta el botón rápido "Marcar como vista" desde
// MovieCard/MovieDetailPage (sin calificación ni texto). El
// CreateReviewModal completo (estrellas, spoilers, rewatch, filtro de
// contenido) se construye en la fase de Reseñas.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const tmdbId = Number(body.tmdbId);

  if (Number.isNaN(tmdbId)) {
    return NextResponse.json({ error: "tmdbId inválido" }, { status: 400 });
  }

  await getMovieDetail(tmdbId); // asegura la FK a movies_cache

  let content: string | null = body.content ?? null;
  let hasSpoilers = Boolean(body.hasSpoilers);

  if (content) {
    content = filterProfanity(content).filtered;
    if (!hasSpoilers && containsSpoilerKeywords(content)) {
      hasSpoilers = true; // el sistema fuerza el flag aunque no lo marcaras
    }
  }

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      tmdbId,
      rating: body.rating ?? null,
      content,
      hasSpoilers,
      isRewatch: Boolean(body.isRewatch),
      watchedDate: body.watchedDate ? new Date(body.watchedDate) : new Date(),
    },
  });

  // Si ya estaba en la watchlist, la sacamos: ya se vio.
  await prisma.watchlistItem
    .delete({ where: { userId_tmdbId: { userId: user.id, tmdbId } } })
    .catch(() => null);

  return NextResponse.json(review);
}
