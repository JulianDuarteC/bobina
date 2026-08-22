"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type NotificationData = {
  id: string;
  type: "LIKE" | "FOLLOW" | "COMMUNITY_INVITE";
  createdAt: string;
  isRead: boolean;
  actor: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  review?: {
    id: string;
    tmdbId: number;
    movieTitle: string;
  };
  invite?: {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED";
    communitySlug: string;
    communityName: string;
  };
};

export function NotificationItem({
  notification,
}: {
  notification: NotificationData;
}) {
  const router = useRouter();
  const [inviteStatus, setInviteStatus] = useState(
    notification.invite?.status
  );
  const [loading, setLoading] = useState(false);

  const actorName =
    notification.actor.displayName || notification.actor.username;

  async function respondInvite(action: "accept" | "decline") {
    if (!notification.invite) return;
    setLoading(true);

    const res = await fetch(`/api/invites/${notification.invite.id}/${action}`, {
      method: "POST",
    });

    if (res.ok) {
      setInviteStatus(action === "accept" ? "ACCEPTED" : "DECLINED");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex items-start gap-3 rounded-md bg-reel-900/60 p-4">
      <Link href={`/${notification.actor.username}`} className="shrink-0">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-reel-700">
          {notification.actor.avatarUrl ? (
            <Image
              src={notification.actor.avatarUrl}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-sm text-marquee-500">
              {notification.actor.username[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <p className="font-body text-sm text-frame-100">
          <Link
            href={`/${notification.actor.username}`}
            className="font-semibold text-frame-50 hover:text-marquee-400"
          >
            {actorName}
          </Link>{" "}
          {notification.type === "LIKE" && notification.review && (
            <>
              le dio like a tu reseña de{" "}
              <Link
                href={`/movies/${notification.review.tmdbId}`}
                className="text-marquee-400 hover:underline"
              >
                {notification.review.movieTitle}
              </Link>
            </>
          )}
          {notification.type === "FOLLOW" && <>empezó a seguirte</>}
          {notification.type === "COMMUNITY_INVITE" && notification.invite && (
            <>
              te invitó a la comunidad{" "}
              <Link
                href={`/communities/${notification.invite.communitySlug}`}
                className="text-marquee-400 hover:underline"
              >
                {notification.invite.communityName}
              </Link>
            </>
          )}
        </p>

        <p className="mt-1 font-body text-xs text-frame-200/40">
          {new Date(notification.createdAt).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "short",
          })}
        </p>

        {notification.type === "COMMUNITY_INVITE" && (
          <>
            {inviteStatus === "PENDING" && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => respondInvite("accept")}
                  disabled={loading}
                  className="btn-primary !px-3 !py-1 !text-xs"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => respondInvite("decline")}
                  disabled={loading}
                  className="btn-ghost !px-3 !py-1 !text-xs"
                >
                  Rechazar
                </button>
              </div>
            )}
            {inviteStatus === "ACCEPTED" && (
              <p className="mt-2 font-body text-xs text-emerald_reel-500">
                Invitación aceptada ✓
              </p>
            )}
            {inviteStatus === "DECLINED" && (
              <p className="mt-2 font-body text-xs text-frame-200/40">
                Invitación rechazada
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
