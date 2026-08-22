"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreatePostModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      setError("Completa el título y el contenido.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/communities/${slug}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim() }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No pudimos publicar. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="ticket-card w-full max-w-lg px-6 py-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 font-display text-xl tracking-marquee text-frame-50">
          Nueva publicación
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="postTitle" className="field-label">
              Título
            </label>
            <input
              id="postTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="field-input"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="postContent" className="field-label">
              Contenido
            </label>
            <textarea
              id="postContent"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="field-input resize-none"
            />
          </div>

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
              {submitting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
