import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getTrendingMovies, getTrendingTv } from "@/lib/tmdb";
import { MovieCard } from "@/components/MovieCard";

async function getPopularOnBobina() {
  // Agrupa reseñas por película: la que tiene más reseñas, más arriba.
  // No filtramos por fecha porque con el volumen de un proyecto nuevo,
  // limitarlo a "esta semana" dejaría la sección vacía casi siempre.
  const grouped = await prisma.review.groupBy({
    by: ["tmdbId"],
    where: { hiddenBySystem: false },
    _count: { id: true },
    _avg: { rating: true },
    orderBy: { _count: { id: "desc" } },
    take: 12,
  });

  if (grouped.length === 0) return [];

  const movies = await prisma.movieCache.findMany({
    where: { tmdbId: { in: grouped.map((g) => g.tmdbId) } },
  });
  const movieMap = new Map(movies.map((m) => [m.tmdbId, m]));

  return grouped
    .map((g) => {
      const movie = movieMap.get(g.tmdbId);
      if (!movie) return null;
      return {
        tmdbId: g.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        reviewCount: g._count.id,
        averageRating: g._avg.rating ? Number(g._avg.rating) : null,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);
}

export default async function ExplorePage() {
  const currentUser = await getCurrentUser();

  const [trending, trendingTv, popularOnBobina] = await Promise.all([
    getTrendingMovies().catch((): Awaited<ReturnType<typeof getTrendingMovies>> => []),
    getTrendingTv().catch((): Awaited<ReturnType<typeof getTrendingTv>> => []),
    getPopularOnBobina(),
  ]);

  const allTmdbIds = [
    ...trending.map((m) => m.tmdbId),
    ...trendingTv.map((m) => m.tmdbId),
    ...popularOnBobina.map((m) => m.tmdbId),
  ];

  const watchlistSet = new Set<number>();
  const watchedSet = new Set<number>();
  if (currentUser && allTmdbIds.length > 0) {
    const [watchlistItems, watchedItems] = await Promise.all([
      prisma.watchlistItem.findMany({
        where: { userId: currentUser.id, tmdbId: { in: allTmdbIds } },
        select: { tmdbId: true },
      }),
      prisma.watchedItem.findMany({
        where: { userId: currentUser.id, tmdbId: { in: allTmdbIds } },
        select: { tmdbId: true },
      }),
    ]);
    watchlistItems.forEach((i) => watchlistSet.add(i.tmdbId));
    watchedItems.forEach((i) => watchedSet.add(i.tmdbId));
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-1 font-display text-3xl tracking-marquee text-frame-50">
        Explorar
      </h1>
      <p className="mb-10 font-body text-sm text-frame-200/60">
        Qué está viendo el mundo, y qué está viendo tu comunidad en Bobina.
      </p>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-lg tracking-marquee text-frame-50">
          Tendencia esta semana
        </h2>
        {trending.length === 0 ? (
          <p className="font-body text-sm text-frame-200/60">
            No pudimos cargar las tendencias en este momento.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {trending.map((movie) => (
              <MovieCard
                key={movie.tmdbId}
                tmdbId={movie.tmdbId}
                title={movie.title}
                posterPath={movie.posterPath}
                year={movie.year}
                inWatchlist={watchlistSet.has(movie.tmdbId)}
                isWatched={watchedSet.has(movie.tmdbId)}
                isLoggedIn={Boolean(currentUser)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-lg tracking-marquee text-frame-50">
          Series en tendencia
        </h2>
        {trendingTv.length === 0 ? (
          <p className="font-body text-sm text-frame-200/60">
            No pudimos cargar las tendencias de series en este momento.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {trendingTv.map((show) => (
              <MovieCard
                key={show.tmdbId}
                tmdbId={show.tmdbId}
                title={show.title}
                posterPath={show.posterPath}
                year={show.year}
                inWatchlist={watchlistSet.has(show.tmdbId)}
                isWatched={watchedSet.has(show.tmdbId)}
                isLoggedIn={Boolean(currentUser)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg tracking-marquee text-frame-50">
          Populares en Bobina
        </h2>
        {popularOnBobina.length === 0 ? (
          <p className="font-body text-sm text-frame-200/60">
            Todavía no hay suficientes reseñas en Bobina para armar este
            ranking. ¡Sé de los primeros en escribir una!
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {popularOnBobina.map((movie) => (
              <MovieCard
                key={movie.tmdbId}
                tmdbId={movie.tmdbId}
                title={movie.title}
                posterPath={movie.posterPath}
                averageRating={movie.averageRating}
                inWatchlist={watchlistSet.has(movie.tmdbId)}
                isWatched={watchedSet.has(movie.tmdbId)}
                isLoggedIn={Boolean(currentUser)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
