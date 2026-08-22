import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserProfileHeader } from "@/components/profile/UserProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await prisma.profile.findUnique({
    where: { username: params.username },
  });

  if (!profile) notFound();

  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.id === profile.id;

  const [
    watchedReviews,
    watchlistItems,
    favoriteMovies,
    lists,
    followerCount,
    followingCount,
    isFollowing,
  ] = await Promise.all([
    prisma.review.findMany({
      where: { userId: profile.id },
      include: { movie: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.watchlistItem.findMany({
      where: { userId: profile.id },
      include: { movie: true },
      orderBy: { addedAt: "desc" },
    }),
    prisma.favoriteMovie.findMany({
      where: { userId: profile.id },
      include: { movie: true },
      orderBy: { position: "asc" },
    }),
    prisma.customList.findMany({
      where: {
        userId: profile.id,
        // Las listas privadas solo las ve su dueño.
        ...(isOwnProfile ? {} : { isPrivate: false }),
      },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.count({ where: { followingId: profile.id } }),
    prisma.follow.count({ where: { followerId: profile.id } }),
    currentUser
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: profile.id,
            },
          },
        })
      : null,
  ]);

  return (
    <main className="min-h-screen pb-16">
      <UserProfileHeader
        profile={profile}
        stats={{
          watchedCount: watchedReviews.length,
          followerCount,
          followingCount,
        }}
        isOwnProfile={isOwnProfile}
        isFollowing={Boolean(isFollowing)}
      />

      <ProfileTabs
        username={profile.username}
        isOwnProfile={isOwnProfile}
        watched={watchedReviews.map((r) => ({
          tmdbId: r.movie.tmdbId,
          title: r.movie.title,
          posterPath: r.movie.posterPath,
        }))}
        watchlist={watchlistItems.map((w) => ({
          tmdbId: w.movie.tmdbId,
          title: w.movie.title,
          posterPath: w.movie.posterPath,
        }))}
        favorites={favoriteMovies.map((f) => ({
          tmdbId: f.movie.tmdbId,
          title: f.movie.title,
          posterPath: f.movie.posterPath,
        }))}
        lists={lists.map((l) => ({
          id: l.id,
          title: l.title,
          itemCount: l._count.items,
          isPrivate: l.isPrivate,
        }))}
      />
    </main>
  );
}
