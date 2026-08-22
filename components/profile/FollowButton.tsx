"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({
  targetUserId,
  initiallyFollowing,
}: {
  targetUserId: string;
  initiallyFollowing: boolean;
}) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initiallyFollowing);
  const [isPending, startTransition] = useTransition();

  async function toggleFollow() {
    const method = isFollowing ? "DELETE" : "POST";
    const nextState = !isFollowing;

    // Actualización optimista: se ve instantáneo, se revierte si falla.
    setIsFollowing(nextState);

    const res = await fetch(`/api/users/${targetUserId}/follow`, { method });

    if (!res.ok) {
      setIsFollowing(!nextState);
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={isPending}
      className={isFollowing ? "btn-ghost" : "btn-primary"}
    >
      {isFollowing ? "Siguiendo" : "Seguir"}
    </button>
  );
}
