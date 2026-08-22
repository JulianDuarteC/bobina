import Image from "next/image";
import Link from "next/link";
import { FollowButton } from "./FollowButton";
import { MessageButton } from "@/components/messages/MessageButton";

export function UserProfileHeader({
  profile,
  stats,
  isOwnProfile,
  isFollowing,
}: {
  profile: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    bio: string | null;
    location: string | null;
  };
  stats: {
    watchedCount: number;
    followerCount: number;
    followingCount: number;
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
}) {
  return (
    <header>
      {/* Banner */}
      <div className="h-40 w-full bg-reel-800 sm:h-56">
        {profile.bannerUrl && (
          <Image
            src={profile.bannerUrl}
            alt=""
            width={1400}
            height={400}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="mx-auto max-w-4xl px-6">
        <div className="-mt-12 flex flex-col items-start gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-reel-950 bg-reel-700 sm:h-32 sm:w-32">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.username}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-3xl text-marquee-500">
                  {profile.username[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="pb-1">
              <h1 className="font-display text-2xl tracking-marquee text-frame-50 sm:text-3xl">
                {profile.displayName || profile.username}
              </h1>
              <p className="font-body text-sm text-frame-200/60">
                @{profile.username}
              </p>
            </div>
          </div>

          <div className="pb-1">
            {isOwnProfile ? (
              <Link href="/settings/profile" className="btn-ghost">
                Editar perfil
              </Link>
            ) : (
              <div className="flex gap-2">
                <MessageButton userId={profile.id} />
                <FollowButton
                  targetUserId={profile.id}
                  initiallyFollowing={isFollowing}
                />
              </div>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 max-w-xl font-body text-sm text-frame-200/60">
            {profile.bio}
          </p>
        )}

        {profile.location && (
          <p className="mt-1 font-body text-xs text-frame-200/60">
            {profile.location}
          </p>
        )}

        {/* Estadísticas básicas */}
        <div className="mt-5 flex gap-6 border-b border-reel-800 pb-5 font-body text-sm">
          <span>
            <strong className="text-frame-50">{stats.watchedCount}</strong>{" "}
            <span className="text-frame-200/60">vistas</span>
          </span>
          <span>
            <strong className="text-frame-50">{stats.followerCount}</strong>{" "}
            <span className="text-frame-200/60">seguidores</span>
          </span>
          <span>
            <strong className="text-frame-50">{stats.followingCount}</strong>{" "}
            <span className="text-frame-200/60">siguiendo</span>
          </span>
        </div>
      </div>
    </header>
  );
}
