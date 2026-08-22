import { NextRequest, NextResponse } from "next/server";
import { getMovieDetail } from "@/lib/tmdb";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { tmdbId: string } }
) {
  const tmdbId = Number(params.tmdbId);

  if (Number.isNaN(tmdbId)) {
    return NextResponse.json({ error: "tmdbId inválido" }, { status: 400 });
  }

  try {
    const movie = await getMovieDetail(tmdbId);

    // Métricas locales de la comunidad: promedio y conteo de reseñas.
    const aggregate = await prisma.review.aggregate({
      where: { tmdbId, hiddenBySystem: false },
      _avg: { rating: true },
      _count: { _all: true },
    });

    return NextResponse.json({
      ...movie,
      community: {
        averageRating: aggregate._avg.rating,
        reviewCount: aggregate._count._all,
      },
    });
  } catch (error) {
    console.error(`Error obteniendo la película ${tmdbId}:`, error);
    return NextResponse.json(
      { error: "No se pudo obtener la información de la película" },
      { status: 502 }
    );
  }
}
