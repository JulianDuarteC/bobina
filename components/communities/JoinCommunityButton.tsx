"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "NONE" | "PENDING" | "ACTIVE";

export function JoinCommunityButton({
  slug,
  initialStatus,
  isCreator,
}: {
  slug: string;
  initialStatus: Status;
  isCreator: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);

  async function join() {
    setLoading(true);
    const res = await fetch(`/api/communities/${slug}/join`, { method: "POST" });

    if (res.ok) {
      const data = await res.json();
      setStatus(data.pending ? "PENDING" : "ACTIVE");
      router.refresh();
    }
    setLoading(false);
  }

  async function leaveOrCancel() {
    setLoading(true);
    const res = await fetch(`/api/communities/${slug}/join`, { method: "DELETE" });
    if (res.ok) {
      setStatus("NONE");
      router.refresh();
    }
    setLoading(false);
  }

  if (isCreator) {
    return (
      <span className="font-body text-xs uppercase tracking-marquee text-marquee-400">
        Tu comunidad
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <button onClick={leaveOrCancel} disabled={loading} className="btn-ghost">
        Solicitud enviada · Cancelar
      </button>
    );
  }

  if (status === "ACTIVE") {
    return (
      <button onClick={leaveOrCancel} disabled={loading} className="btn-ghost">
        Miembro ✓
      </button>
    );
  }

  return (
    <button onClick={join} disabled={loading} className="btn-primary">
      Unirme
    </button>
  );
}
