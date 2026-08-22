import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NotificationItem } from "@/components/notifications/NotificationItem";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Resolvemos el contenido relacionado según el tipo (like -> reseña,
  // invitación -> comunidad + estado). No es lo más eficiente para miles
  // de notificaciones, pero es simple y correcto para el volumen de un
  // MVP.
  const enriched = await Promise.all(
    notifications.map(async (n) => {
      if (n.type === "LIKE" && n.entityId) {
        const review = await prisma.review.findUnique({
          where: { id: n.entityId },
          include: { movie: true },
        });
        return { ...n, review };
      }

      if (n.type === "COMMUNITY_INVITE" && n.entityId) {
        const invite = await prisma.communityInvite.findUnique({
          where: { id: n.entityId },
          include: { community: true },
        });
        return { ...n, invite };
      }

      return n;
    })
  );

  // Marca todo como leído al visitar la bandeja (patrón típico de
  // notificaciones: abrir la bandeja = leído).
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 font-display text-2xl tracking-marquee text-frame-50">
        Notificaciones
      </h1>

      {enriched.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-frame-200/60">
          No tienes notificaciones todavía.
        </p>
      ) : (
        <div className="space-y-2">
          {enriched.map((n) => (
            <NotificationItem
              key={n.id}
              notification={{
                id: n.id,
                type: n.type,
                createdAt: n.createdAt.toISOString(),
                isRead: true, // ya se marcaron como leídas arriba
                actor: {
                  username: n.actor.username,
                  displayName: n.actor.displayName,
                  avatarUrl: n.actor.avatarUrl,
                },
                review:
                  "review" in n && n.review
                    ? {
                        id: n.review.id,
                        tmdbId: n.review.tmdbId,
                        movieTitle: n.review.movie.title,
                      }
                    : undefined,
                invite:
                  "invite" in n && n.invite
                    ? {
                        id: n.invite.id,
                        status: n.invite.status,
                        communitySlug: n.invite.community.slug,
                        communityName: n.invite.community.name,
                      }
                    : undefined,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
