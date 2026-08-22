import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const PAGE_SIZE = 30;

async function getParticipant(conversationId: string, userId: string) {
  return prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const participant = await getParticipant(params.id, user.id);
  if (!participant) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");

  const messages = await prisma.directMessage.findMany({
    where: {
      conversationId: params.id,
      ...(cursor && { createdAt: { lt: new Date(cursor) } }),
    },
    include: { sender: true, sharedMovie: true },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });

  const nextCursor =
    messages.length === PAGE_SIZE
      ? messages[messages.length - 1].createdAt.toISOString()
      : null;

  return NextResponse.json({
    // Se devuelven en orden cronológico ascendente para pintar el chat.
    messages: messages.reverse().map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      senderId: m.senderId,
      senderUsername: m.sender.username,
      sharedMovie: m.sharedMovie
        ? {
            tmdbId: m.sharedMovie.tmdbId,
            title: m.sharedMovie.title,
            posterPath: m.sharedMovie.posterPath,
          }
        : null,
    })),
    nextCursor,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const participant = await getParticipant(params.id, user.id);

  if (!participant || participant.status !== "ACCEPTED") {
    return NextResponse.json(
      { error: "No puedes enviar mensajes en esta conversación todavía" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const content = (body.content ?? "").trim();
  const sharedTmdbId: number | null = body.sharedTmdbId ?? null;

  if (!content && !sharedTmdbId) {
    return NextResponse.json(
      { error: "El mensaje no puede estar vacío" },
      { status: 400 }
    );
  }

  if (sharedTmdbId) {
    // Asegura la FK a movies_cache antes de insertar.
    const { getMovieDetail } = await import("@/lib/tmdb");
    await getMovieDetail(sharedTmdbId);
  }

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.directMessage.create({
      data: {
        conversationId: params.id,
        senderId: user.id,
        content,
        sharedTmdbId,
      },
      include: { sender: true, sharedMovie: true },
    });

    await tx.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    // Marca como leído para quien envía (obviamente ya "leyó" su propio
    // mensaje).
    await tx.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
      data: { lastReadAt: new Date() },
    });

    return created;
  });

  return NextResponse.json({
    id: message.id,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    senderId: message.senderId,
    senderUsername: message.sender.username,
    sharedMovie: message.sharedMovie
      ? {
          tmdbId: message.sharedMovie.tmdbId,
          title: message.sharedMovie.title,
          posterPath: message.sharedMovie.posterPath,
        }
      : null,
  });
}
