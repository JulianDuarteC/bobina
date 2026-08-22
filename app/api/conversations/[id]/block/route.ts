import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const otherParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: params.id, userId: { not: user.id } },
  });

  if (!otherParticipant) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.chatBlocklist.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId: otherParticipant.userId,
        },
      },
      create: { blockerId: user.id, blockedId: otherParticipant.userId },
      update: {},
    }),
    // Rechaza la conversación para que desaparezca de la bandeja de
    // ambos ("destruye el acceso a la sala" según el SRS).
    prisma.conversationParticipant.updateMany({
      where: { conversationId: params.id },
      data: { status: "REJECTED" },
    }),
  ]);

  return NextResponse.json({ blocked: true });
}
