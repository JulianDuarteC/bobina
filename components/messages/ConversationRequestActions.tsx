"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConversationRequestActions({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function respond(action: "accept" | "reject" | "block") {
    setLoading(true);
    await fetch(`/api/conversations/${conversationId}/${action}`, {
      method: "POST",
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => respond("accept")}
        disabled={loading}
        className="btn-primary !px-3 !py-1 !text-xs"
      >
        Aceptar
      </button>
      <button
        onClick={() => respond("reject")}
        disabled={loading}
        className="btn-ghost !px-3 !py-1 !text-xs"
      >
        Rechazar
      </button>
      <button
        onClick={() => respond("block")}
        disabled={loading}
        className="font-body text-xs text-frame-200/50 hover:text-marquee-400"
      >
        Bloquear
      </button>
    </div>
  );
}
