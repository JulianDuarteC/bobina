import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSiteModerator } from "@/lib/auth";
import { ModerationQueueItem } from "@/components/admin/ModerationQueueItem";

export default async function ModerationQueuePage() {
  const mod = await requireSiteModerator();
  if (!mod) redirect("/");

  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: { reporter: true },
    orderBy: { createdAt: "desc" },
  });

  // Agrupa por (contentType, contentId) para no repetir la misma
  // publicación una vez por cada reporte que tenga.
  const groups = new Map<
    string,
    { contentType: string; contentId: string; reports: typeof reports }
  >();

  for (const r of reports) {
    const key = `${r.contentType}:${r.contentId}`;
    if (!groups.has(key)) {
      groups.set(key, { contentType: r.contentType, contentId: r.contentId, reports: [] });
    }
    groups.get(key)!.reports.push(r);
  }

  // Prioriza por cantidad de reportes (más reportado, más arriba).
  const sortedGroups = Array.from(groups.values()).sort(
    (a, b) => b.reports.length - a.reports.length
  );

  const items = await Promise.all(
    sortedGroups.map(async (g) => {
      let preview: { text: string; context: string; hidden: boolean } | null = null;
      let author: { id: string; username: string; trustScore: number } | null = null;

      if (g.contentType === "REVIEW") {
        const review = await prisma.review.findUnique({
          where: { id: g.contentId },
          include: { author: true, movie: true },
        });
        if (review) {
          preview = {
            text: review.content || "(reseña sin texto, solo calificación)",
            context: `Reseña de ${review.movie.title}`,
            hidden: review.hiddenBySystem,
          };
          author = review.author;
        }
      } else if (g.contentType === "COMMUNITY_POST") {
        const post = await prisma.communityPost.findUnique({
          where: { id: g.contentId },
          include: { author: true, community: true },
        });
        if (post) {
          preview = {
            text: `${post.title}\n\n${post.content}`,
            context: `Publicación en ${post.community.name}`,
            hidden: post.hiddenBySystem,
          };
          author = post.author;
        }
      } else if (g.contentType === "USER") {
        const targetUser = await prisma.profile.findUnique({
          where: { id: g.contentId },
        });
        if (targetUser) {
          preview = {
            text: `Reporte sobre la cuenta @${targetUser.username}`,
            context: "Usuario",
            hidden: false,
          };
          author = targetUser;
        }
      }

      const moderationHistory = author
        ? await prisma.moderationLog.findMany({
            where: { targetUserId: author.id },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : [];

      return {
        contentType: g.contentType,
        contentId: g.contentId,
        reportCount: g.reports.length,
        reasons: g.reports.map((r) => r.reason),
        preview,
        author,
        moderationHistory: moderationHistory.map((m) => ({
          action: m.action,
          reason: m.reason,
          createdAt: m.createdAt.toISOString(),
        })),
      };
    })
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 font-display text-2xl tracking-marquee text-frame-50">
        Cola de moderación
      </h1>
      <p className="mb-8 font-body text-sm text-frame-200/60">
        {items.length} elemento{items.length !== 1 ? "s" : ""} reportado
        {items.length !== 1 ? "s" : ""} pendiente{items.length !== 1 ? "s" : ""}
      </p>

      {items.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-frame-200/60">
          No hay reportes pendientes. Todo tranquilo por ahora.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ModerationQueueItem key={`${item.contentType}:${item.contentId}`} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
