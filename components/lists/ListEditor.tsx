"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { posterUrl } from "@/lib/tmdb";

type ListMovie = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
};

type SearchResult = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
};

export function ListEditor({
  listId,
  initialItems,
}: {
  listId: string;
  initialItems: ListMovie[];
}) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/movies/search?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setResults((data.results ?? []).slice(0, 6));
    setSearching(false);
  }

  async function addMovie(movie: SearchResult) {
    if (items.some((i) => i.tmdbId === movie.id)) return; // ya está

    setItems((prev) => [
      ...prev,
      { tmdbId: movie.id, title: movie.title, posterPath: movie.poster_path },
    ]);
    setQuery("");
    setResults([]);

    await fetch(`/api/lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdbId: movie.id }),
    });
  }

  async function removeMovie(tmdbId: number) {
    setItems((prev) => prev.filter((i) => i.tmdbId !== tmdbId));
    await fetch(`/api/lists/${listId}/items/${tmdbId}`, { method: "DELETE" });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.tmdbId === active.id);
    const newIndex = items.findIndex((i) => i.tmdbId === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    await fetch(`/api/lists/${listId}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdbIds: reordered.map((i) => i.tmdbId) }),
    });
  }

  return (
    <div>
      {/* Buscador para añadir películas */}
      <div className="relative mb-6 max-w-md">
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Busca una película para añadir..."
          className="field-input"
        />

        {query.trim().length >= 2 && (
          <div className="absolute z-10 mt-1 w-full rounded-sm border border-reel-700 bg-reel-900 shadow-xl">
            {searching && (
              <p className="px-3 py-2 font-body text-xs text-frame-200/50">
                Buscando...
              </p>
            )}
            {!searching && results.length === 0 && (
              <p className="px-3 py-2 font-body text-xs text-frame-200/50">
                Sin resultados.
              </p>
            )}
            {results.map((movie) => (
              <button
                key={movie.id}
                onClick={() => addMovie(movie)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-reel-800"
              >
                {posterUrl(movie.poster_path, "w342") ? (
                  <Image
                    src={posterUrl(movie.poster_path, "w342")!}
                    alt=""
                    width={28}
                    height={40}
                    className="rounded-[2px] object-cover"
                  />
                ) : (
                  <div className="h-10 w-7 shrink-0 rounded-[2px] bg-reel-800" />
                )}
                <span className="font-body text-sm text-frame-100">
                  {movie.title}{" "}
                  <span className="text-frame-200/40">
                    {movie.release_date?.slice(0, 4)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="font-body text-sm text-frame-200/60">
          Esta lista está vacía. Busca una película arriba para empezar.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.tmdbId)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {items.map((item) => (
                <SortableMovie
                  key={item.tmdbId}
                  item={item}
                  onRemove={() => removeMovie(item.tmdbId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableMovie({
  item,
  onRemove,
}: {
  item: ListMovie;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.tmdbId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const src = posterUrl(item.posterPath, "w342");

  return (
    <div className="flex flex-col gap-1.5">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group relative cursor-grab overflow-hidden rounded-sm bg-reel-800 active:cursor-grabbing"
      >
        <div className="aspect-[2/3] w-full">
          {src ? (
            <Image
              src={src}
              alt={item.title}
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-2 text-center font-body text-xs text-frame-200/50">
              {item.title}
            </div>
          )}
        </div>

        <Link
          href={`/movies/${item.tmdbId}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-0 flex items-end bg-gradient-to-t from-reel-950/90 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100"
        >
          <p className="p-2 font-body text-xs text-frame-50 line-clamp-2">
            {item.title}
          </p>
        </Link>
      </div>

      {/* Fuera del área que se arrastra: sin conflicto con el gesto de
          reordenar, y siempre visible (funciona igual en celular). */}
      <button
        onClick={onRemove}
        className="flex w-full items-center justify-center gap-1 rounded-sm border border-reel-700 py-1.5 font-body text-xs text-frame-200/70 transition-colors hover:border-marquee-500 hover:text-marquee-400"
      >
        <X size={12} strokeWidth={2.5} />
        Eliminar
      </button>
    </div>
  );
}
