"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Request = {
  userId: string;
  username: string;
  displayName: string | null;
};

export function PendingRequestsList({
  slug,
  requests,
}: {
  slug: string;
  requests: Request[];
}) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [handled, setHandled] = useState<Set<string>>(new Set());

  async function respond(userId: string, action: "approve" | "deny") {
    setProcessingId(userId);
    await fetch(`/api/communities/${slug}/members/${userId}/${action}`, {
      method: "POST",
    });
    setHandled((prev) => new Set(prev).add(userId));
    router.refresh();
    setProcessingId(null);
  }

  const visible = requests.filter((r) => !handled.has(r.userId));

  if (visible.length === 0) return null;

  return (
    <div className="mb-8 rounded-md bg-reel-900/60 p-5">
      <h3 className="mb-3 font-body text-xs uppercase tracking-marquee text-frame-200/50">
        Solicitudes de ingreso ({visible.length})
      </h3>
      <div className="space-y-2">
        {visible.map((r) => (
          <div key={r.userId} className="flex items-center justify-between">
            <span className="font-body text-sm text-frame-100">
              {r.displayName || r.username}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => respond(r.userId, "approve")}
                disabled={processingId === r.userId}
                className="btn-primary !px-3 !py-1 !text-xs"
              >
                Aprobar
              </button>
              <button
                onClick={() => respond(r.userId, "deny")}
                disabled={processingId === r.userId}
                className="btn-ghost !px-3 !py-1 !text-xs"
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
