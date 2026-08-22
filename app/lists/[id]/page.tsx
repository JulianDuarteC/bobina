import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ListEditor } from "@/components/lists/ListEditor";
import { ListActions } from "@/components/lists/ListActions";
import { MoviePoster } from "@/components/MoviePoster";

export default async function ListPage({
  params,
}: {
  params: { id: string };
}) {
  const list = await prisma.customList.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      items: { include: { movie: true }, orderBy: { position: "asc" } },
    },
  });

  if (!list) notFound();

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === list.userId;

  if (list.isPrivate && !isOwner) notFound();

  const movies = list.items.map((item) => ({
    tmdbId: item.movie.tmdbId,
    title: item.movie.title,
    posterPath: item.movie.posterPath,
  }));

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href={`/${list.owner.username}`}
        className="font-body text-xs uppercase tracking-marquee text-frame-200/60 hover:text-marquee-400"
      >
        ← @{list.owner.username}
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-marquee text-frame-50">
            {list.title}
          </h1>
          {list.description && (
            <p className="mt-2 max-w-xl font-body text-sm text-frame-200/60">
              {list.description}
            </p>
          )}
        </div>

        {list.isPrivate && (
          <span className="rounded-sm border border-reel-600 px-2.5 py-1 font-body text-xs uppercase tracking-marquee text-frame-200/60">
            Privada
          </span>
        )}
      </div>

      <p className="mb-8 mt-2 font-body text-xs text-frame-200/60">
        {movies.length} película{movies.length !== 1 ? "s" : ""}
      </p>

      {isOwner && (
        <ListActions
          list={{
            id: list.id,
            title: list.title,
            description: list.description,
            isPrivate: list.isPrivate,
          }}
          ownerUsername={list.owner.username}
        />
      )}

      {isOwner ? (
        <ListEditor listId={list.id} initialItems={movies} />
      ) : movies.length === 0 ? (
        <p className="font-body text-sm text-frame-200/60">
          Esta lista todavía no tiene películas.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {movies.map((movie) => (
            <MoviePoster
              key={movie.tmdbId}
              tmdbId={movie.tmdbId}
              title={movie.title}
              posterPath={movie.posterPath}
            />
          ))}
        </div>
      )}
    </main>
  );
}
