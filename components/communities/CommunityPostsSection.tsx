"use client";

import { useState } from "react";
import { CreatePostModal } from "./CreatePostModal";
import { CommunityPostItem, type PostData } from "./CommunityPostItem";

export function CommunityPostsSection({
  slug,
  posts,
  isMember,
  canModerate,
  currentUserId,
}: {
  slug: string;
  posts: PostData[];
  isMember: boolean;
  canModerate: boolean;
  currentUserId?: string | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const sorted = [...posts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg tracking-marquee text-frame-50">
          Publicaciones
        </h2>
        {isMember && (
          <button onClick={() => setModalOpen(true)} className="btn-ghost">
            Nueva publicación
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="font-body text-sm text-frame-200/60">
          Todavía no hay publicaciones en esta comunidad.
          {isMember && " ¡Empieza tú la conversación!"}
        </p>
      ) : (
        <div className="space-y-4">
          {sorted.map((post) => (
            <CommunityPostItem
              key={post.id}
              post={post}
              slug={slug}
              canModerate={canModerate}
              isMember={isMember}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <CreatePostModal slug={slug} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
