import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { JoinCommunityButton } from "@/components/communities/JoinCommunityButton";
import { CommunityPostsSection } from "@/components/communities/CommunityPostsSection";
import { InviteButton } from "@/components/communities/InviteButton";
import { MembersList } from "@/components/communities/MembersList";
import { PendingRequestsList } from "@/components/communities/PendingRequestsList";

export default async function CommunityPage({
  params,
}: {
  params: { slug: string };
}) {
  const community = await prisma.community.findUnique({
    where: { slug: params.slug },
    include: {
      _count: { select: { members: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!community) notFound();

  const currentUser = await getCurrentUser();

  const membership = currentUser
    ? await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: community.id,
            userId: currentUser.id,
          },
        },
      })
    : null;

  const isMember = membership?.status === "ACTIVE";
  const isPending = membership?.status === "PENDING";
  const canModerate =
    isMember && (membership?.role === "ADMIN" || membership?.role === "MODERATOR");
  const isCreator = currentUser?.id === community.creatorId;

  // Comunidad privada: solo miembros activos pueden ver el contenido.
  if (community.isPrivate && !isMember) notFound();

  const posts = await prisma.communityPost.findMany({
    where: { communityId: community.id, hiddenBySystem: false },
    include: { author: true, _count: { select: { comments: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const members = isMember
    ? await prisma.communityMember.findMany({
        where: { communityId: community.id, status: "ACTIVE" },
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      })
    : [];

  const pendingRequests = canModerate
    ? await prisma.communityMember.findMany({
        where: { communityId: community.id, status: "PENDING" },
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      })
    : [];

  let joinButtonStatus: "NONE" | "PENDING" | "ACTIVE" = "NONE";
  if (isMember) joinButtonStatus = "ACTIVE";
  else if (isPending) joinButtonStatus = "PENDING";

  return (
    <main>
      <header className="border-b border-reel-800">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl tracking-marquee text-frame-50">
                {community.name}
              </h1>
              {community.description && (
                <p className="mt-2 max-w-xl font-body text-sm text-frame-200/60">
                  {community.description}
                </p>
              )}
              <p className="mt-3 font-body text-xs text-frame-200/60">
                {community._count.members} miembro
                {community._count.members !== 1 ? "s" : ""}
                {community.isPrivate && " · Privada"}
              </p>
            </div>

            {currentUser && (
              <div className="flex items-center gap-3">
                {isMember && <InviteButton slug={community.slug} />}
                <JoinCommunityButton
                  slug={community.slug}
                  initialStatus={joinButtonStatus}
                  isCreator={isCreator}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {canModerate && pendingRequests.length > 0 && (
          <PendingRequestsList
            slug={community.slug}
            requests={pendingRequests.map((r) => ({
              userId: r.userId,
              username: r.user.username,
              displayName: r.user.displayName,
            }))}
          />
        )}

        <CommunityPostsSection
          slug={community.slug}
          isMember={isMember}
          canModerate={Boolean(canModerate)}
          currentUserId={currentUser?.id}
          posts={posts.map((p) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            isPinned: p.isPinned,
            createdAt: p.createdAt.toISOString(),
            commentCount: p._count.comments,
            author: {
              id: p.author.id,
              username: p.author.username,
              displayName: p.author.displayName,
              avatarUrl: p.author.avatarUrl,
            },
          }))}
        />

        {isMember && (
          <div className="mt-10 border-t border-reel-800 pt-8">
            <h2 className="mb-4 font-display text-lg tracking-marquee text-frame-50">
              Miembros ({members.length})
            </h2>
            <MembersList
              slug={community.slug}
              isAdmin={membership?.role === "ADMIN"}
              members={members.map((m) => ({
                userId: m.userId,
                username: m.user.username,
                displayName: m.user.displayName,
                avatarUrl: m.user.avatarUrl,
                role: m.role,
                isCreator: m.userId === community.creatorId,
              }))}
            />
          </div>
        )}
      </div>
    </main>
  );
}
