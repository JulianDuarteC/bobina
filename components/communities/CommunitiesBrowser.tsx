"use client";

import { useState } from "react";
import Link from "next/link";
import { CreateCommunityModal } from "./CreateCommunityModal";

type CommunitySummary = {
  slug: string;
  name: string;
  description: string | null;
  memberCount: number;
  postCount: number;
};

export function CommunitiesBrowser({
  communities,
  isLoggedIn,
}: {
  communities: CommunitySummary[];
  isLoggedIn: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      {isLoggedIn && (
        <button onClick={() => setModalOpen(true)} className="btn-primary mb-6">
          + Crear comunidad
        </button>
      )}

      {communities.length === 0 ? (
        <p className="font-body text-sm text-frame-200/60">
          Todavía no hay comunidades públicas. ¡Sé la primera persona en
          crear una!
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {communities.map((c) => (
            <Link
              key={c.slug}
              href={`/communities/${c.slug}`}
              className="ticket-card px-5 py-4 transition-colors hover:bg-reel-700"
            >
              <p className="font-body text-sm font-semibold text-frame-50">
                {c.name}
              </p>
              {c.description && (
                <p className="mt-1 line-clamp-2 font-body text-xs text-frame-200/60">
                  {c.description}
                </p>
              )}
              <p className="mt-2 font-body text-xs text-frame-200/40">
                {c.memberCount} miembro{c.memberCount !== 1 ? "s" : ""} ·{" "}
                {c.postCount} publicación{c.postCount !== 1 ? "es" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <CreateCommunityModal onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
