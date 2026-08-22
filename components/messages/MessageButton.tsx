"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MessageButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startConversation() {
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: userId }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/messages/${data.id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <button onClick={startConversation} disabled={loading} className="btn-ghost">
      {loading ? "Abriendo..." : "Mensaje"}
    </button>
  );
}
