import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; tmdbId: string } }
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

  await prisma.listItem.delete({
    where: {
      listId_tmdbId: { listId: params.id, tmdbId: Number(params.tmdbId) },
    },
  });

  return NextResponse.json({ success: true });
}
