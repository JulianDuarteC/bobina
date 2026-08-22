import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ConversationRequestActions } from "@/components/messages/ConversationRequestActions";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const participations = await prisma.conversationParticipant.findMany({
    where: { userId: user.id, status: { in: ["ACCEPTED", "PENDING"] } },
    include: {
      conversation: {
        include: {
          participants: { include: { user: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  const accepted = participations.filter((p) => p.status === "ACCEPTED");
  const pending = participations.filter((p) => p.status === "PENDING");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 font-display text-2xl tracking-marquee text-frame-50">
        Mensajes
      </h1>

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-body text-xs uppercase tracking-marquee text-frame-200/60">
            Solicitudes de mensaje
          </h2>
          <div className="space-y-2">
            {pending.map((p) => {
              const other = p.conversation.participants.find(
                (participant) => participant.userId !== user.id
              )!.user;
              const lastMessage = p.conversation.messages[0];

              return (
                <div
                  key={p.conversationId}
                  className="rounded-md bg-reel-900/60 p-4"
                >
                  <div className="mb-2 flex items-center gap-2.5">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-reel-700">
                      {other.avatarUrl ? (
                        <Image
                          src={other.avatarUrl}
                          alt=""
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-sm text-marquee-500">
                          {other.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-frame-50">
                        {other.displayName || other.username}
                      </p>
                      {lastMessage && (
                        <p className="line-clamp-1 font-body text-xs text-frame-200/60">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>

                  <ConversationRequestActions
                    conversationId={p.conversationId}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {accepted.length === 0 ? (
        <p className="py-8 text-center font-body text-sm text-frame-200/60">
          Todavía no tienes conversaciones. Escríbele a alguien desde su
          perfil.
        </p>
      ) : (
        <div className="space-y-1">
          {accepted.map((p) => {
            const other = p.conversation.participants.find(
              (participant) => participant.userId !== user.id
            )!.user;
            const lastMessage = p.conversation.messages[0];
            const isUnread =
              lastMessage &&
              lastMessage.senderId !== user.id &&
              (!p.lastReadAt || p.lastReadAt < lastMessage.createdAt);

            return (
              <Link
                key={p.conversationId}
                href={`/messages/${p.conversationId}`}
                className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-reel-900/60"
              >
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-reel-700">
                  {other.avatarUrl ? (
                    <Image
                      src={other.avatarUrl}
                      alt=""
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-base text-marquee-500">
                      {other.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`font-body text-sm ${isUnread ? "font-semibold text-frame-50" : "text-frame-100/80"}`}
                  >
                    {other.displayName || other.username}
                  </p>
                  {lastMessage && (
                    <p
                      className={`line-clamp-1 font-body text-xs ${isUnread ? "text-frame-100" : "text-frame-200/50"}`}
                    >
                      {lastMessage.senderId === user.id ? "Tú: " : ""}
                      {lastMessage.content}
                    </p>
                  )}
                </div>

                {isUnread && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-marquee-500" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
