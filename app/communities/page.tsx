import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CommunitiesBrowser } from "@/components/communities/CommunitiesBrowser";

export default async function CommunitiesPage() {
  const currentUser = await getCurrentUser();

  const communities = await prisma.community.findMany({
    where: { isPrivate: false },
    include: { _count: { select: { members: true, posts: true } } },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-marquee text-frame-50">
          Comunidades
        </h1>
      </div>

      <CommunitiesBrowser
        isLoggedIn={Boolean(currentUser)}
        communities={communities.map((c) => ({
          slug: c.slug,
          name: c.name,
          description: c.description,
          memberCount: c._count.members,
          postCount: c._count.posts,
        }))}
      />
    </main>
  );
}
