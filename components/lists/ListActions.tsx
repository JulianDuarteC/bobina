"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ListActions({
  list,
  ownerUsername,
}: {
  list: { id: string; title: string; description: string | null; isPrivate: boolean };
  ownerUsername: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description ?? "");
  const [isPrivate, setIsPrivate] = useState(list.isPrivate);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/lists/${list.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        isPrivate,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar la lista "${list.title}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeleting(true);
    const res = await fetch(`/api/lists/${list.id}`, { method: "DELETE" });

    if (res.ok) {
      router.push(`/${ownerUsername}`);
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="ticket-card mb-6 px-6 py-6">
        <div className="space-y-4">
          <div>
            <label className="field-label">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Descripción</label>
            <textarea
              rows={2}
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
            Lista privada
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(false)}
              className="btn-ghost !px-4 !py-1.5 !text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary !px-4 !py-1.5 !text-xs"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2 flex gap-2">
      <button
        onClick={() => setEditing(true)}
        className="font-body text-xs text-frame-200/50 hover:text-frame-100"
      >
        Editar
      </button>
      <span className="text-frame-200/30">·</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="font-body text-xs text-frame-200/50 hover:text-marquee-400"
      >
        {deleting ? "Eliminando..." : "Eliminar lista"}
      </button>
    </div>
  );
}
