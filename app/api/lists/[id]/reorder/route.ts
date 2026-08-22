import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Recibe el arreglo completo de tmdbIds en el nuevo orden y actualiza
// la posición de cada uno. Simple y robusto para el tamaño de listas
// personales (no está pensado para miles de elementos).
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const list = await prisma.customList.findUnique({
    where: { id: params.id },
  });

  if (!list || list.userId !== user.id) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const tmdbIds: number[] = body.tmdbIds ?? [];

  await prisma.$transaction(
    tmdbIds.map((tmdbId, index) =>
      prisma.listItem.update({
        where: { listId_tmdbId: { listId: params.id, tmdbId } },
        data: { position: index + 1 },
      })
    )
  );

  return NextResponse.json({ success: true });
}
