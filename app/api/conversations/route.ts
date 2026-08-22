import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const recipientId: string = body.recipientId;

  if (!recipientId || recipientId === user.id) {
    return NextResponse.json(
      { error: "Destinatario inválido" },
      { status: 400 }
    );
  }

  // Si cualquiera de los dos bloqueó al otro, no se puede iniciar chat.
  const blocked = await prisma.chatBlocklist.findFirst({
    where: {
      OR: [
        { blockerId: user.id, blockedId: recipientId },
        { blockerId: recipientId, blockedId: user.id },
      ],
    },
  });
  if (blocked) {
    return NextResponse.json(
      { error: "No es posible iniciar esta conversación" },
      { status: 403 }
    );
  }

  // ¿Ya existe una conversación 1-a-1 entre estos dos usuarios?
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: recipientId } } },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  // Flujo de permisos: si se siguen mutuamente, la conversación nace
  // aceptada para ambos. Si no, nace pendiente para el destinatario.
  const [followsThem, followedByThem] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: user.id, followingId: recipientId },
      },
    }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: recipientId, followingId: user.id },
      },
    }),
  ]);

  const mutualFollow = Boolean(followsThem && followedByThem);

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: user.id, status: "ACCEPTED" },
          { userId: recipientId, status: mutualFollow ? "ACCEPTED" : "PENDING" },
        ],
      },
    },
  });

  return NextResponse.json({ id: conversation.id });
}
