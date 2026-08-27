import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getMovieDetail,
  getMovieExtras,
  getWatchProviders,
  tmdbImageUrl,
} from "@/lib/tmdb";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { WatchlistButton } from "@/components/WatchlistButton";
import { MarkWatchedButton } from "@/components/MarkWatchedButton";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { AdSlotSidebar } from "@/components/ads/AdSlotSidebar";

export default async function MovieDetailPage({
  params,
}: {
  params: { tmdbId: string };
}) {
  const tmdbId = Number(params.tmdbId);
  if (Number.isNaN(tmdbId)) notFound();

  const [movie, extras, providers, currentUser, aggregate, reviews] =
    await Promise.all([
      getMovieDetail(tmdbId).catch((err) => {
        console.error(`getMovieDetail(${tmdbId}) falló:`, err);
        return null;
      }),
      getMovieExtras(tmdbId).catch((err) => {
        console.error(`getMovieExtras(${tmdbId}) falló:`, err);
        return { cast: [], directors: [], trailerKey: null, numberOfSeasons: null };
      }),
      getWatchProviders(tmdbId, "CO").catch((err) => {
        console.error(`getWatchProviders(${tmdbId}) falló:`, err);
        return null;
      }),
      getCurrentUser(),
      prisma.review.aggregate({
        where: { tmdbId, hiddenBySystem: false },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      prisma.review.findMany({
        where: { tmdbId, hiddenBySystem: false },
        include: { author: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  if (!movie) notFound();

  const inWatchlist = currentUser
    ? Boolean(
        await prisma.watchlistItem.findUnique({
          where: { userId_tmdbId: { userId: currentUser.id, tmdbId } },
        })
      )
    : false;

  const isWatched = currentUser
    ? Boolean(
        await prisma.watchedItem.findUnique({
          where: { userId_tmdbId: { userId: currentUser.id, tmdbId } },
        })
      )
    : false;

  const genres = Array.isArray(movie.genres)
    ? (movie.genres as { id: number; name: string }[])
    : [];

  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  const backdropSrc = tmdbImageUrl(movie.backdropPath, "w1280");
  const posterSrc = tmdbImageUrl(movie.posterPath, "w500");

  return (
    <main className="pb-16">
      {/* Hero */}
      <div className="relative h-[45vh] min-h-[320px] w-full overflow-hidden bg-reel-900">
        {backdropSrc && (
          <>
            <Image
              src={backdropSrc}
              alt=""
              fill
              priority
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-reel-950 via-reel-950/60 to-transparent" />
          </>
        )}

        <div className="relative mx-auto flex h-full max-w-5xl items-end gap-6 px-6 pb-8">
          {posterSrc && (
            <div className="hidden w-40 shrink-0 overflow-hidden rounded-sm shadow-xl shadow-black/40 sm:block">
              <Image
                src={posterSrc}
                alt={movie.title}
                width={320}
                height={480}
                className="w-full"
              />
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-sm bg-marquee-500/15 px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-marquee text-marquee-400">
                {movie.mediaType === "TV" ? "Serie" : "Película"}
              </span>
            </div>

            <h1 className="font-display text-3xl tracking-marquee text-frame-50 sm:text-4xl">
              {movie.title}
            </h1>
            <p className="mt-1 font-body text-sm text-frame-200/60">
              {[
                year,
                extras.directors[0],
                extras.numberOfSeasons
                  ? `${extras.numberOfSeasons} temporada${extras.numberOfSeasons !== 1 ? "s" : ""}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-reel-600 px-3 py-1 font-body text-xs text-frame-200/60"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {currentUser && (
              <div className="mt-5 flex gap-3">
                <WatchlistButton
                  tmdbId={tmdbId}
                  initiallyInWatchlist={inWatchlist}
                  variant="full"
                />
                <MarkWatchedButton tmdbId={tmdbId} variant="full" initiallyWatched={isWatched} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6">
        {/* Métricas de la comunidad */}
        <div className="-mt-4 mb-8 flex gap-6 rounded-sm bg-reel-800 px-5 py-4 font-body text-sm">
          <span>
            <strong className="text-marquee-400">
              {aggregate._avg.rating
                ? Number(aggregate._avg.rating).toFixed(1)
                : "—"}
            </strong>{" "}
            <span className="text-frame-200/60">calificación de Bobina</span>
          </span>
          <span>
            <strong className="text-frame-50">
              {aggregate._count._all}
            </strong>{" "}
            <span className="text-frame-200/60">
              reseña{aggregate._count._all !== 1 ? "s" : ""}
            </span>
          </span>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          <div className="sm:col-span-2">
            {/* Sinopsis */}
            {movie.synopsis && (
              <section className="mb-8">
                <h2 className="mb-2 font-display text-lg tracking-marquee text-frame-50">
                  Sinopsis
                </h2>
                <p className="font-body text-sm leading-relaxed text-frame-200/60">
                  {movie.synopsis}
                </p>
              </section>
            )}

            {/* Tráiler */}
            {extras.trailerKey && (
              <section className="mb-8">
                <h2 className="mb-2 font-display text-lg tracking-marquee text-frame-50">
                  Tráiler
                </h2>
                <div className="aspect-video w-full overflow-hidden rounded-sm">
                  <iframe
                    src={`https://www.youtube.com/embed/${extras.trailerKey}`}
                    title="Tráiler"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </section>
            )}

            {/* Reparto */}
            {extras.cast.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg tracking-marquee text-frame-50">
                  Reparto
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {extras.cast.map((actor) => (
                    <div key={actor.name}>
                      <div className="mb-1.5 aspect-square overflow-hidden rounded-full bg-reel-800">
                        {actor.profilePath ? (
                          <Image
                            src={tmdbImageUrl(actor.profilePath, "w185")!}
                            alt={actor.name}
                            width={92}
                            height={92}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-body text-xs text-frame-200/40">
                            {actor.name[0]}
                          </div>
                        )}
                      </div>
                      <p className="font-body text-xs font-medium text-frame-50">
                        {actor.name}
                      </p>
                      <p className="font-body text-[11px] text-frame-200/60">
                        {actor.character}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <ReviewSection
              tmdbId={tmdbId}
              movieTitle={movie.title}
              isLoggedIn={Boolean(currentUser)}
              currentUserId={currentUser?.id}
              initialNextCursor={
                reviews.length === 10
                  ? reviews[reviews.length - 1].createdAt.toISOString()
                  : null
              }
              reviews={reviews.map((r) => ({
                id: r.id,
                rating: r.rating ? Number(r.rating) : null,
                content: r.content,
                hasSpoilers: r.hasSpoilers,
                isRewatch: r.isRewatch,
                createdAt: r.createdAt.toISOString(),
                likesCount: r.likesCount,
                author: {
                  id: r.author.id,
                  username: r.author.username,
                  displayName: r.author.displayName,
                  avatarUrl: r.author.avatarUrl,
                },
              }))}
            />
          </div>

          {/* Dónde ver */}
          <div>
            <h2 className="mb-3 font-display text-lg tracking-marquee text-frame-50">
              Dónde ver
            </h2>
            {providers?.flatrate && providers.flatrate.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {providers.flatrate.map((p: any) => (
                  <div
                    key={p.provider_id}
                    title={p.provider_name}
                    className="h-11 w-11 overflow-hidden rounded-md"
                  >
                    <Image
                      src={tmdbImageUrl(p.logo_path, "w92")!}
                      alt={p.provider_name}
                      width={44}
                      height={44}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-frame-200/60">
                No encontramos disponibilidad en streaming para tu región
                por ahora.
              </p>
            )}
          </div>

          <AdSlotSidebar />
        </div>
      </div>
    </main>
  );
}
