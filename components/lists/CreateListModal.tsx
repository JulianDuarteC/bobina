"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateListModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Ponle un título a tu lista.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        isPrivate,
      }),
    });

    if (!res.ok) {
      setError("No pudimos crear la lista. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    const list = await res.json();
    router.push(`/lists/${list.id}`);
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
          Nueva lista
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="listTitle" className="field-label">
              Título
            </label>
            <input
              id="listTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mis clásicos de terror"
              className="field-input"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="listDescription" className="field-label">
              Descripción (opcional)
            </label>
            <textarea
              id="listDescription"
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
            Lista privada (solo tú la ves)
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
              {submitting ? "Creando..." : "Crear lista"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
