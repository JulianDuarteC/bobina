"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Member = {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  isCreator: boolean;
};

const ROLE_LABELS: Record<Member["role"], string> = {
  ADMIN: "Admin",
  MODERATOR: "Moderador",
  MEMBER: "Miembro",
};

export function MembersList({
  slug,
  members,
  isAdmin,
}: {
  slug: string;
  members: Member[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function setRole(userId: string, role: "MODERATOR" | "MEMBER") {
    setUpdatingId(userId);
    await fetch(`/api/communities/${slug}/members/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.refresh();
    setUpdatingId(null);
  }

  return (
    <div className="space-y-1">
      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center justify-between rounded-sm px-2 py-2 hover:bg-reel-800"
        >
          <div className="flex items-center gap-2.5">
            <Link href={`/${member.username}`} className="font-body text-sm text-frame-100 hover:text-marquee-400">
              {member.displayName || member.username}
            </Link>
            <span className="rounded-sm bg-reel-800 px-2 py-0.5 font-body text-[11px] text-frame-200/60">
              {ROLE_LABELS[member.role]}
            </span>
          </div>

          {isAdmin && !member.isCreator && (
            <div className="flex gap-2">
              {member.role !== "MODERATOR" && (
                <button
                  onClick={() => setRole(member.userId, "MODERATOR")}
                  disabled={updatingId === member.userId}
                  className="font-body text-xs text-frame-200/50 hover:text-marquee-400"
                >
                  Hacer moderador
                </button>
              )}
              {member.role === "MODERATOR" && (
                <button
                  onClick={() => setRole(member.userId, "MEMBER")}
                  disabled={updatingId === member.userId}
                  className="font-body text-xs text-frame-200/50 hover:text-marquee-400"
                >
                  Quitar moderador
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
