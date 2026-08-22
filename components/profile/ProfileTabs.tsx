"use client";

import { useState } from "react";
import Link from "next/link";
import { MoviePoster } from "@/components/MoviePoster";
import { CreateListModal } from "@/components/lists/CreateListModal";
import { FavoritesEditor } from "@/components/profile/FavoritesEditor";

type MovieRef = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
};

type ListSummary = {
  id: string;
  title: string;
  itemCount: number;
  isPrivate: boolean;
};

const TABS = ["watched", "watchlist", "favoritos", "listas"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  watched: "Vistas",
  watchlist: "Watchlist",
  favoritos: "Top favoritos",
  listas: "Listas",
};

export function ProfileTabs({
  watched,
  watchlist,
  favorites,
  lists,
  username,
  isOwnProfile,
}: {
  watched: MovieRef[];
  watchlist: MovieRef[];
  favorites: MovieRef[];
  lists: ListSummary[];
  username: string;
  isOwnProfile: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("watched");
  const [createListOpen, setCreateListOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="flex gap-1 border-b border-reel-800">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-body text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-marquee-500 text-marquee-500"
                : "text-frame-200/60 hover:text-frame-50"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "watched" && (
          <PosterGrid
            movies={watched}
            emptyLabel={`@${username} todavía no ha registrado películas vistas.`}
          />
        )}

        {activeTab === "watchlist" && (
          <PosterGrid
            movies={watchlist}
            emptyLabel={`@${username} no tiene películas guardadas para ver después.`}
          />
        )}

        {activeTab === "favoritos" && (
          <>
            {isOwnProfile ? (
              <FavoritesEditor initialItems={favorites} />
            ) : (
              <PosterGrid
                movies={favorites}
                emptyLabel={`@${username} todavía no eligió sus películas favoritas.`}
                columns="favorites"
              />
            )}
          </>
        )}

        {activeTab === "listas" && (
          <div>
            {isOwnProfile && (
              <button
                onClick={() => setCreateListOpen(true)}
                className="btn-ghost mb-4"
              >
                + Crear lista
              </button>
            )}
            <ListsView lists={lists} username={username} />
          </div>
        )}
      </div>

      {createListOpen && (
        <CreateListModal onClose={() => setCreateListOpen(false)} />
      )}
    </div>
  );
}

function PosterGrid({
  movies,
  emptyLabel,
  columns = "default",
}: {
  movies: MovieRef[];
  emptyLabel: string;
  columns?: "default" | "favorites";
}) {
  if (movies.length === 0) {
    return <EmptyState label={emptyLabel} />;
  }

  const gridClass =
    columns === "favorites"
      ? "grid grid-cols-3 gap-3 sm:grid-cols-5"
      : "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6";

  return (
    <div className={gridClass}>
      {movies.map((movie) => (
        <MoviePoster
          key={movie.tmdbId}
          tmdbId={movie.tmdbId}
          title={movie.title}
          posterPath={movie.posterPath}
        />
      ))}
    </div>
  );
}

function ListsView({
  lists,
  username,
}: {
  lists: ListSummary[];
  username: string;
}) {
  if (lists.length === 0) {
    return (
      <EmptyState label={`@${username} todavía no ha creado listas.`} />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {lists.map((list) => (
        <Link
          key={list.id}
          href={`/lists/${list.id}`}
          className="ticket-card flex items-center justify-between px-5 py-4 transition-colors hover:bg-reel-700"
        >
          <div>
            <p className="font-body text-sm font-semibold text-frame-50">
              {list.title}
            </p>
            <p className="font-body text-xs text-frame-200/60">
              {list.itemCount} película{list.itemCount !== 1 ? "s" : ""}
            </p>
          </div>
          {list.isPrivate && (
            <span className="font-body text-xs uppercase tracking-marquee text-frame-200/50">
              Privada
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="py-12 text-center font-body text-sm text-frame-200/60">
      {label}
    </p>
  );
}
