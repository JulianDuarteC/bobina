"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pin, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReportButton } from "@/components/moderation/ReportButton";

export type PostData = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  commentCount: number;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

export function CommunityPostItem({
  post,
  slug,
  canModerate,
  isMember,
  currentUserId,
}: {
  post: PostData;
  slug: string;
  canModerate: boolean;
  isMember: boolean;
  currentUserId?: string | null;
}) {
  const router = useRouter();
  const [pinning, setPinning] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  async function togglePin() {
    setPinning(true);
    await fetch(`/api/communities/${slug}/posts/${post.id}/pin`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !post.isPinned }),
    });
    router.refresh();
    setPinning(false);
  }

  async function toggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);

    if (next && comments.length === 0) {
      setLoadingComments(true);
      const res = await fetch(`/api/communities/${slug}/posts/${post.id}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
      setLoadingComments(false);
    }
  }

  async function sendComment() {
    const content = draft.trim();
    if (!content) return;

    setSending(true);
    const res = await fetch(`/api/communities/${slug}/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setCommentCount((c) => c + 1);
      setDraft("");
    }
    setSending(false);
  }

  return (
    <article className="rounded-md bg-reel-900/60 p-5 sm:p-6">
      <div className="mb-2 flex items-center gap-x-2">
        {post.isPinned && (
          <span className="flex items-center gap-1 rounded-sm bg-marquee-500/15 px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-marquee text-marquee-400">
            <Pin size={11} strokeWidth={2.5} /> Fijado
          </span>
        )}
        <Link
          href={`/${post.author.username}`}
          className="font-body text-sm font-semibold text-frame-50 hover:text-marquee-400"
        >
          {post.author.displayName || post.author.username}
        </Link>
        <span className="font-body text-xs text-frame-200/40">
          {new Date(post.createdAt).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      <h3 className="mb-2 font-display text-lg tracking-wide text-frame-50">
        {post.title}
      </h3>

      <p className="whitespace-pre-line font-body text-sm leading-relaxed text-frame-100/90">
        {post.content}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 font-body text-xs text-frame-200/50 hover:text-marquee-400"
        >
          <MessageCircle size={13} strokeWidth={2} />
          {commentCount} comentario{commentCount !== 1 ? "s" : ""}
        </button>

        {canModerate && (
          <button
            onClick={togglePin}
            disabled={pinning}
            className="font-body text-xs text-frame-200/50 hover:text-marquee-400"
          >
            {post.isPinned ? "Quitar de fijados" : "Fijar publicación"}
          </button>
        )}

        {currentUserId && currentUserId !== post.author.id && (
          <ReportButton contentType="COMMUNITY_POST" contentId={post.id} />
        )}
      </div>

      {commentsOpen && (
        <div className="mt-4 space-y-3 border-t border-reel-800 pt-4">
          {loadingComments && (
            <p className="font-body text-xs text-frame-200/50">Cargando...</p>
          )}

          {!loadingComments && comments.length === 0 && (
            <p className="font-body text-xs text-frame-200/50">
              Sin comentarios todavía.
            </p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-reel-700">
                {c.author.avatarUrl ? (
                  <Image
                    src={c.author.avatarUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-[11px] text-marquee-500">
                    {c.author.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-body text-xs">
                  <span className="font-semibold text-frame-50">
                    {c.author.displayName || c.author.username}
                  </span>{" "}
                  <span className="text-frame-200/40">
                    {new Date(c.createdAt).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </p>
                <p className="font-body text-sm text-frame-100/90">
                  {c.content}
                </p>
              </div>
            </div>
          ))}

          {isMember && (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendComment();
                }}
                placeholder="Escribe un comentario..."
                className="field-input flex-1 !py-1.5 !text-xs"
              />
              <button
                onClick={sendComment}
                disabled={sending || !draft.trim()}
                className="btn-ghost !px-3 !py-1.5 !text-xs"
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
