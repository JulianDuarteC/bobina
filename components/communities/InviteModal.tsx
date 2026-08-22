"use client";

import { useState } from "react";
import Image from "next/image";

type UserResult = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export function InviteModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(value: string) {
    setQuery(value);
    setError(null);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setSearching(false);
  }

  async function sendInvite(user: UserResult) {
    setError(null);
    const res = await fetch(`/api/communities/${slug}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitedUserId: user.id }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No pudimos enviar la invitación.");
      return;
    }

    setInvited((prev) => new Set(prev).add(user.id));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="ticket-card w-full max-w-md px-6 py-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 font-display text-xl tracking-marquee text-frame-50">
          Invitar personas
        </h2>

        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Busca por nombre de usuario..."
          className="field-input"
          autoFocus
        />

        {error && <p className="mt-2 text-sm text-marquee-400">{error}</p>}

        <div className="mt-4 max-h-72 space-y-1 overflow-y-auto">
          {searching && (
            <p className="font-body text-xs text-frame-200/50">Buscando...</p>
          )}
          {!searching && query.trim().length >= 2 && results.length === 0 && (
            <p className="font-body text-xs text-frame-200/50">
              No encontramos a nadie con ese usuario.
            </p>
          )}
          {results.map((user) => {
            const alreadyInvited = invited.has(user.id);
            return (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-sm px-2 py-2 hover:bg-reel-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-reel-700">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-xs text-marquee-500">
                        {user.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-body text-sm text-frame-100">
                    {user.displayName || user.username}
                  </span>
                </div>

                <button
                  onClick={() => sendInvite(user)}
                  disabled={alreadyInvited}
                  className="btn-ghost !px-3 !py-1 !text-xs"
                >
                  {alreadyInvited ? "Invitado ✓" : "Invitar"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="btn-ghost">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
