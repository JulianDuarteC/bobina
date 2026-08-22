"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const REASON_LABELS: Record<string, string> = {
  SPAM: "Spam",
  HATE_SPEECH: "Discurso de odio",
  UNMARKED_SPOILER: "Spoiler sin marcar",
  NSFW: "Contenido explícito",
  HARASSMENT: "Acoso",
};

const ACTION_LABELS: Record<string, string> = {
  WARNING: "Advertencia",
  MUTE: "Silenciado",
  BAN: "Baneado",
  DELETE_CONTENT: "Contenido eliminado",
};

type QueueItem = {
  contentType: string;
  contentId: string;
  reportCount: number;
  reasons: string[];
  preview: { text: string; context: string; hidden: boolean } | null;
  author: { id: string; username: string; trustScore: number } | null;
  moderationHistory: { action: string; reason: string | null; createdAt: string }[];
};

export function ModerationQueueItem({ item }: { item: QueueItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  async function runAction(action: "approve" | "hide" | "strike") {
    setLoading(action);
    const res = await fetch(
      `/api/admin/reports/${item.contentType}/${item.contentId}/${action}`,
      { method: "POST" }
    );
    setLoading(null);
    if (res.ok) {
      setResolved(true);
      router.refresh();
    }
  }

  if (resolved) return null;

  return (
    <article className="rounded-md bg-reel-900/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-marquee-500/15 px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-marquee text-marquee-400">
            {item.reportCount} reporte{item.reportCount !== 1 ? "s" : ""}
          </span>
          {item.preview?.hidden && (
            <span className="rounded-sm bg-reel-800 px-2 py-0.5 font-body text-[11px] text-frame-200/60">
              Oculto por el sistema
            </span>
          )}
        </div>
        {item.author && (
          <Link
            href={`/${item.author.username}`}
            className="font-body text-xs text-frame-200/60 hover:text-marquee-400"
          >
            @{item.author.username} · confianza {item.author.trustScore}
          </Link>
        )}
      </div>

      <p className="mb-2 font-body text-xs text-frame-200/50">
        {item.preview?.context}
      </p>
      <p className="mb-3 whitespace-pre-line font-body text-sm text-frame-100/90">
        {item.preview?.text}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {item.reasons.map((r, i) => (
          <span
            key={i}
            className="rounded-full border border-reel-600 px-2.5 py-0.5 font-body text-[11px] text-frame-200/70"
          >
            {REASON_LABELS[r] ?? r}
          </span>
        ))}
      </div>

      {item.moderationHistory.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="font-body text-xs text-frame-200/50 hover:text-frame-100"
          >
            {historyOpen ? "Ocultar" : "Ver"} historial de sanciones (
            {item.moderationHistory.length})
          </button>
          {historyOpen && (
            <div className="mt-2 space-y-1 border-l border-reel-700 pl-3">
              {item.moderationHistory.map((h, i) => (
                <p key={i} className="font-body text-xs text-frame-200/60">
                  {ACTION_LABELS[h.action] ?? h.action} ·{" "}
                  {new Date(h.createdAt).toLocaleDateString("es-CO")}
                  {h.reason && ` — ${h.reason}`}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => runAction("approve")}
          disabled={loading !== null}
          className="btn-ghost !px-3 !py-1.5 !text-xs"
        >
          {loading === "approve" ? "..." : "Aprobar"}
        </button>
        <button
          onClick={() => runAction("hide")}
          disabled={loading !== null}
          className="rounded-sm border border-reel-600 px-3 py-1.5 font-body text-xs text-frame-100 transition-colors hover:border-marquee-500 hover:text-marquee-400"
        >
          {loading === "hide" ? "..." : "Ocultar contenido"}
        </button>
        <button
          onClick={() => runAction("strike")}
          disabled={loading !== null}
          className="rounded-sm border border-reel-600 px-3 py-1.5 font-body text-xs text-frame-100 transition-colors hover:border-marquee-500 hover:text-marquee-400"
        >
          {loading === "strike" ? "..." : "Aplicar strike"}
        </button>
      </div>
    </article>
  );
}
