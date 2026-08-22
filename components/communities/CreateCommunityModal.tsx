"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateCommunityModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Ponle un nombre a tu comunidad.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        isPrivate,
      }),
    });

    if (!res.ok) {
      setError("No pudimos crear la comunidad. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    const community = await res.json();
    router.push(`/communities/${community.slug}`);
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
          Nueva comunidad
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="communityName" className="field-label">
              Nombre
            </label>
            <input
              id="communityName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cine de culto latinoamericano"
              className="field-input"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="communityDescription" className="field-label">
              Descripción
            </label>
            <textarea
              id="communityDescription"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="field-input resize-none"
            />
          </div>

          <label className="flex items-center gap-2 font-body text-sm text-frame-100/90">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="accent-marquee-500"
            />
            Comunidad privada
          </label>

          {error && <p className="text-sm text-marquee-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? "Creando..." : "Crear comunidad"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
