import { prisma } from "@/lib/prisma";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días, según el SRS

function tmdbHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export type MediaType = "MOVIE" | "TV";

// --- Codificación película/serie en el mismo espacio de ids ---
// TMDb usa contadores separados para películas y series (pueden
// coincidir números entre ambos), pero toda nuestra app ya usa
// `tmdbId` como un simple entero en reviews, watchlist, listas,
// favoritos y chat. En vez de agregar una columna "mediaType" a cada
// una de esas tablas, codificamos el tipo en el signo: positivo =
// película (como siempre), negativo = serie. Los ids reales de TMDb
// siempre son positivos, así que no hay ambigüedad posible.
export function encodeMediaId(realId: number, mediaType: MediaType): number {
  return mediaType === "TV" ? -realId : realId;
}

export function decodeMediaId(encodedId: number): {
  realId: number;
  mediaType: MediaType;
} {
  return encodedId < 0
    ? { realId: -encodedId, mediaType: "TV" }
    : { realId: encodedId, mediaType: "MOVIE" };
}

// --- Búsqueda de películas: siempre en vivo (autocompletado no se cachea) ---
export async function searchMovies(query: string, page = 1) {
  const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(
    query
  )}&page=${page}&language=es-ES&include_adult=false`;

  const res = await fetch(url, { headers: tmdbHeaders() });

  if (!res.ok) {
    throw new Error(`TMDb search failed: ${res.status}`);
  }

  return res.json();
}

// --- Búsqueda de series: mismo patrón, resultados con ids codificados
// en negativo para que encajen directo en /movies/[tmdbId] y en
// cualquier flujo (watchlist, listas, etc.) sin cambios adicionales.
export async function searchTv(query: string, page = 1) {
  const url = `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(
    query
  )}&page=${page}&language=es-ES&include_adult=false`;

  const res = await fetch(url, { headers: tmdbHeaders() });

  if (!res.ok) {
    throw new Error(`TMDb TV search failed: ${res.status}`);
  }

  const data = await res.json();

  return {
    ...data,
    results: (data.results ?? []).map((r: any) => ({
      id: encodeMediaId(r.id, "TV"),
      title: r.name,
      poster_path: r.poster_path,
      release_date: r.first_air_date,
    })),
  };
}

// --- Detalle de película o serie: caché local con TTL de 7 días ---
// `tmdbId` aquí es el id CODIFICADO (puede ser negativo para series).
export async function getMovieDetail(tmdbId: number) {
  const cached = await prisma.movieCache.findUnique({ where: { tmdbId } });

  const isFresh =
    cached && Date.now() - cached.cachedAt.getTime() < CACHE_TTL_MS;

  if (isFresh) {
    return cached;
  }

  const { realId, mediaType } = decodeMediaId(tmdbId);
  const endpoint = mediaType === "TV" ? "tv" : "movie";

  const res = await fetch(
    `${TMDB_BASE_URL}/${endpoint}/${realId}?language=es-ES`,
    { headers: tmdbHeaders() }
  );

  if (!res.ok) {
    // Si TMDb falla pero tenemos una versión vieja en caché, la devolvemos
    // en vez de romper la página (mejor una versión desactualizada que un error).
    if (cached) return cached;
    throw new Error(`TMDb detail failed: ${res.status}`);
  }

  const data = await res.json();
  const title = mediaType === "TV" ? data.name : data.title;
  const releaseDateRaw = mediaType === "TV" ? data.first_air_date : data.release_date;

  const upserted = await prisma.movieCache.upsert({
    where: { tmdbId },
    create: {
      tmdbId,
      mediaType,
      title,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: releaseDateRaw ? new Date(releaseDateRaw) : null,
      genres: data.genres ?? [],
      synopsis: data.overview,
    },
    update: {
      title,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: releaseDateRaw ? new Date(releaseDateRaw) : null,
      genres: data.genres ?? [],
      synopsis: data.overview,
      cachedAt: new Date(),
    },
  });

  return upserted;
}

// --- Reparto y tráiler: se piden en vivo (no se cachean en DB por ahora,
// solo el detalle básico se cachea). Un solo request con append_to_response.
type MovieExtras = {
  cast: { name: string; character: string; profilePath: string | null }[];
  directors: string[];
  trailerKey: string | null;
  numberOfSeasons: number | null;
};

export async function getMovieExtras(tmdbId: number): Promise<MovieExtras> {
  const { realId, mediaType } = decodeMediaId(tmdbId);
  const endpoint = mediaType === "TV" ? "tv" : "movie";

  const res = await fetch(
    `${TMDB_BASE_URL}/${endpoint}/${realId}?language=es-ES&append_to_response=credits,videos`,
    { headers: tmdbHeaders() }
  );

  if (!res.ok) {
    throw new Error(`TMDb extras failed: ${res.status}`);
  }

  const data = await res.json();

  const cast = (data.credits?.cast ?? []).slice(0, 8).map((c: any) => ({
    name: c.name,
    character: c.character,
    profilePath: c.profile_path,
  }));

  // Las series no tienen un "Director" único como las películas —
  // usamos los creadores (created_by), que TMDb siempre incluye en el
  // detalle de series.
  const directors =
    mediaType === "TV"
      ? (data.created_by ?? []).map((c: any) => c.name)
      : (data.credits?.crew ?? [])
          .filter((c: any) => c.job === "Director")
          .map((c: any) => c.name);

  const trailer = (data.videos?.results ?? []).find(
    (v: any) => v.site === "YouTube" && v.type === "Trailer"
  );

  return {
    cast,
    directors,
    trailerKey: trailer?.key ?? null,
    // Solo relevante para series; útil en la página de detalle.
    numberOfSeasons: mediaType === "TV" ? data.number_of_seasons : null,
  };
}

// --- Tendencias de la semana (para la página de Explorar) ---
type TrendingItem = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: string | null;
};

export async function getTrendingMovies(): Promise<TrendingItem[]> {
  const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?language=es-ES`, {
    headers: tmdbHeaders(),
  });

  if (!res.ok) {
    throw new Error(`TMDb trending failed: ${res.status}`);
  }

  const data = await res.json();

  return (data.results ?? []).slice(0, 12).map((m: any) => ({
    tmdbId: m.id,
    title: m.title,
    posterPath: m.poster_path,
    year: m.release_date ? String(m.release_date).slice(0, 4) : null,
  }));
}

export async function getTrendingTv(): Promise<TrendingItem[]> {
  const res = await fetch(`${TMDB_BASE_URL}/trending/tv/week?language=es-ES`, {
    headers: tmdbHeaders(),
  });

  if (!res.ok) {
    throw new Error(`TMDb TV trending failed: ${res.status}`);
  }

  const data = await res.json();

  return (data.results ?? []).slice(0, 12).map((m: any) => ({
    tmdbId: encodeMediaId(m.id, "TV"),
    title: m.name,
    posterPath: m.poster_path,
    year: m.first_air_date ? String(m.first_air_date).slice(0, 4) : null,
  }));
}

// --- Proveedores de streaming por región (JustWatch vía TMDb) ---
export async function getWatchProviders(tmdbId: number, region = "CO") {
  const { realId, mediaType } = decodeMediaId(tmdbId);
  const endpoint = mediaType === "TV" ? "tv" : "movie";

  const res = await fetch(
    `${TMDB_BASE_URL}/${endpoint}/${realId}/watch/providers`,
    { headers: tmdbHeaders() }
  );

  if (!res.ok) {
    throw new Error(`TMDb watch providers failed: ${res.status}`);
  }

  const data = await res.json();
  return data.results?.[region] ?? null;
}

export function posterUrl(path: string | null, size: "w342" | "w500" = "w342") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function tmdbImageUrl(path: string | null, size: string) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
