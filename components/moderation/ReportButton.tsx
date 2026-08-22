"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

const REASON_LABELS: Record<string, string> = {
  SPAM: "Spam",
  HATE_SPEECH: "Discurso de odio",
  UNMARKED_SPOILER: "Spoiler sin marcar",
  NSFW: "Contenido explícito",
  HARASSMENT: "Acoso",
};

export function ReportButton({
  contentType,
  contentId,
}: {
  contentType: "REVIEW" | "COMMUNITY_POST" | "USER";
  contentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function submitReport(reason: string) {
    setSending(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, contentId, reason }),
    });
    setSending(false);
    setOpen(false);
    if (res.ok) setSent(true);
  }

  if (sent) {
    return (
      <span className="font-body text-xs text-frame-200/40">
        Reportado ✓
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 font-body text-xs text-frame-200/50 hover:text-marquee-400"
      >
        <Flag size={13} strokeWidth={2} />
        Reportar
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-50 mt-1 w-48 rounded-sm border border-reel-700 bg-reel-900 p-1 shadow-xl">
            {Object.entries(REASON_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => submitReport(value)}
                disabled={sending}
                className="block w-full rounded-sm px-2.5 py-1.5 text-left font-body text-xs text-frame-100 hover:bg-reel-800"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
