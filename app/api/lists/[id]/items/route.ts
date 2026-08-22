import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getMovieDetail } from "@/lib/tmdb";

export async function POST(
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
  const tmdbId = Number(body.tmdbId);

  if (Number.isNaN(tmdbId)) {
    return NextResponse.json({ error: "tmdbId inválido" }, { status: 400 });
  }

  await getMovieDetail(tmdbId); // asegura la FK a movies_cache

  const currentCount = await prisma.listItem.count({
    where: { listId: params.id },
  });

  const item = await prisma.listItem
    .create({
      data: {
        listId: params.id,
        tmdbId,
        position: currentCount + 1,
        notes: body.notes ?? null,
      },
    })
    .catch(() => null); // ya estaba en la lista

  return NextResponse.json(item ?? { alreadyExists: true });
}
