import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getMovieDetail, decodeMediaId } from "@/lib/tmdb";

// Recibe la lista completa y ordenada de favoritos de UN tipo de
// contenido (película o serie) y reemplaza solo ese set — el otro tipo
// queda intacto. Cada uno tiene su propio ranking de 1 a 5,
// independiente entre sí.
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const tmdbIds: number[] = body.tmdbIds ?? [];
  const mediaType: "MOVIE" | "TV" = body.mediaType === "TV" ? "TV" : "MOVIE";

  if (tmdbIds.length > 5) {
    return NextResponse.json(
      { error: "Máximo 5 favoritos por categoría" },
      { status: 400 }
    );
  }

  // Verifica que cada id corresponda de verdad al tipo declarado
  // (protección simple contra un payload manipulado).
  const mismatched = tmdbIds.some(
    (id) => decodeMediaId(id).mediaType !== mediaType
  );
  if (mismatched) {
    return NextResponse.json({ error: "mediaType inconsistente" }, { status: 400 });
  }

  // Asegura que todas existan en caché antes de referenciarlas.
  await Promise.all(tmdbIds.map((id) => getMovieDetail(id)));

  await prisma.$transaction([
    prisma.favoriteMovie.deleteMany({ where: { userId: user.id, mediaType } }),
    prisma.favoriteMovie.createMany({
      data: tmdbIds.map((tmdbId, index) => ({
        userId: user.id,
        tmdbId,
        mediaType,
        position: index + 1,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}
