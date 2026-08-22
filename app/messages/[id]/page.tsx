import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { ConversationRequestActions } from "@/components/messages/ConversationRequestActions";

const PAGE_SIZE = 30;

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const myParticipant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
  });

  if (!myParticipant || myParticipant.status === "REJECTED") notFound();

  const otherParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: params.id, userId: { not: user.id } },
    include: { user: true },
  });

  if (!otherParticipant) notFound();

  const messages = await prisma.directMessage.findMany({
    where: { conversationId: params.id },
    include: { sender: true, sharedMovie: true },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });

  const nextCursor =
    messages.length === PAGE_SIZE
      ? messages[messages.length - 1].createdAt.toISOString()
      : null;

  const canSend = myParticipant.status === "ACCEPTED";

  // Marca como leído solo si ya aceptaste — quien recibe una solicitud
  // pendiente puede previsualizar sin que se marque como leído.
  if (canSend) {
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
      data: { lastReadAt: new Date() },
    });
  }

  return (
    <main className="flex h-[calc(100vh-57px)] flex-col">
      <header className="flex items-center gap-3 border-b border-reel-800 px-6 py-3">
        <Link
          href="/messages"
          className="font-body text-sm text-frame-200/50 hover:text-marquee-400"
        >
          ← Mensajes
        </Link>
      </header>

      {myParticipant.status === "PENDING" && (
        <div className="border-b border-reel-800 bg-reel-900/60 px-6 py-4">
          <p className="mb-3 font-body text-sm text-frame-100/90">
            @{otherParticipant.user.username} quiere enviarte mensajes.
          </p>
          <ConversationRequestActions conversationId={params.id} />
        </div>
      )}

      <ChatWindow
        conversationId={params.id}
        currentUserId={user.id}
        otherUsername={otherParticipant.user.username}
        otherDisplayName={otherParticipant.user.displayName}
        canSend={canSend}
        initialMessages={messages.reverse().map((m) => ({
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
        }))}
        initialNextCursor={nextCursor}
      />
    </main>
  );
}
