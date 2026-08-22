"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function OnlineDot({
  conversationId,
  currentUserId,
  otherUserId,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserId: string;
}) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`room:${conversationId}`, {
      config: { presence: { key: currentUserId } },
    });

    function updatePresence() {
      const state = channel.presenceState();
      setOnline(Object.keys(state).includes(otherUserId));
    }

    channel
      .on("presence", { event: "sync" }, updatePresence)
      .on("presence", { event: "join" }, updatePresence)
      .on("presence", { event: "leave" }, updatePresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ userId: currentUserId });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, otherUserId]);

  if (!online) return null;

  return (
    <span
      title="En línea"
      className="inline-block h-2 w-2 rounded-full bg-emerald_reel-500"
    />
  );
}
