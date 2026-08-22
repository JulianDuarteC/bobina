import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getMovieDetail } from "@/lib/tmdb";

// Recibe la lista completa y ordenada de favoritos (máx. 5) y reemplaza
// el set anterior. Es más simple y robusto que exponer un endpoint de
// reordenamiento incremental, y encaja bien con un drag-and-drop en el
// frontend que manda el arreglo final al soltar.
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const tmdbIds: number[] = body.tmdbIds ?? [];

  if (tmdbIds.length > 5) {
    return NextResponse.json(
      { error: "Máximo 5 películas favoritas" },
      { status: 400 }
    );
  }

  // Asegura que todas existan en caché antes de referenciarlas.
  await Promise.all(tmdbIds.map((id) => getMovieDetail(id)));

  await prisma.$transaction([
    prisma.favoriteMovie.deleteMany({ where: { userId: user.id } }),
    prisma.favoriteMovie.createMany({
      data: tmdbIds.map((tmdbId, index) => ({
        userId: user.id,
        tmdbId,
        position: index + 1,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}
