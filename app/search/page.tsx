"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MovieCard } from "@/components/MovieCard";
import { FollowButton } from "@/components/profile/FollowButton";
import { createClient } from "@/lib/supabase/client";

type MovieResult = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
};

type PersonResult = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  followerCount: number;
  isFollowing: boolean;
};

const TABS = ["movies", "tv", "people"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  movies: "Películas",
  tv: "Series",
  people: "Personas",
};

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<Tab>("movies");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState<MovieResult[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const [tvQuery, setTvQuery] = useState("");
  const [tvResults, setTvResults] = useState<MovieResult[]>([]);
  const [loadingTv, setLoadingTv] = useState(false);

  const [peopleQuery, setPeopleQuery] = useState("");
  const [peopleResults, setPeopleResults] = useState<PersonResult[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (movieQuery.trim().length < 2) {
      setMovieResults([]);
      return;
    }
    setLoadingMovies(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/movies/search?q=${encodeURIComponent(movieQuery)}`
        );
        const data = await res.json();
        setMovieResults(data.results ?? []);
      } finally {
        setLoadingMovies(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [movieQuery]);

  useEffect(() => {
    if (tvQuery.trim().length < 2) {
      setTvResults([]);
      return;
    }
    setLoadingTv(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/tv/search?q=${encodeURIComponent(tvQuery)}`
        );
        const data = await res.json();
        setTvResults(data.results ?? []);
      } finally {
        setLoadingTv(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [tvQuery]);

  useEffect(() => {
    if (peopleQuery.trim().length < 2) {
      setPeopleResults([]);
      return;
    }
    setLoadingPeople(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(peopleQuery)}`
        );
        const data = await res.json();
        setPeopleResults(data.results ?? []);
      } finally {
        setLoadingPeople(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [peopleQuery]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-display text-3xl tracking-marquee text-frame-50">
        Buscar
      </h1>

      <div className="mb-8 flex gap-1 border-b border-reel-800">
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

      {activeTab === "movies" && (
        <div>
          <input
            type="search"
            autoFocus
            value={movieQuery}
            onChange={(e) => setMovieQuery(e.target.value)}
            placeholder="Busca por título..."
            className="field-input mb-8 max-w-md"
          />

          {loadingMovies && (
            <p className="font-body text-sm text-frame-200/60">Buscando...</p>
          )}

          {!loadingMovies && movieQuery.trim().length >= 2 && movieResults.length === 0 && (
            <p className="font-body text-sm text-frame-200/60">
              No encontramos resultados para &ldquo;{movieQuery}&rdquo;.
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {movieResults.map((movie) => (
              <MovieCard
                key={movie.id}
                tmdbId={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                year={movie.release_date?.slice(0, 4)}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "tv" && (
        <div>
          <input
            type="search"
            autoFocus
            value={tvQuery}
            onChange={(e) => setTvQuery(e.target.value)}
            placeholder="Busca una serie por título..."
            className="field-input mb-8 max-w-md"
          />

          {loadingTv && (
            <p className="font-body text-sm text-frame-200/60">Buscando...</p>
          )}

          {!loadingTv && tvQuery.trim().length >= 2 && tvResults.length === 0 && (
            <p className="font-body text-sm text-frame-200/60">
              No encontramos resultados para &ldquo;{tvQuery}&rdquo;.
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {tvResults.map((show) => (
              <MovieCard
                key={show.id}
                tmdbId={show.id}
                title={show.title}
                posterPath={show.poster_path}
                year={show.release_date?.slice(0, 4)}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "people" && (
        <div>
          <input
            type="search"
            autoFocus
            value={peopleQuery}
            onChange={(e) => setPeopleQuery(e.target.value)}
            placeholder="Busca por nombre de usuario..."
            className="field-input mb-8 max-w-md"
          />

          {loadingPeople && (
            <p className="font-body text-sm text-frame-200/60">Buscando...</p>
          )}

          {!loadingPeople && peopleQuery.trim().length >= 2 && peopleResults.length === 0 && (
            <p className="font-body text-sm text-frame-200/60">
              No encontramos a nadie con &ldquo;{peopleQuery}&rdquo;.
            </p>
          )}

          <div className="space-y-2">
            {peopleResults.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between rounded-md bg-reel-900/60 p-4"
              >
                <Link
                  href={`/${person.username}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-reel-700">
                    {person.avatarUrl ? (
                      <Image
                        src={person.avatarUrl}
                        alt=""
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-base text-marquee-500">
                        {person.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-frame-50">
                      {person.displayName || person.username}
                    </p>
                    <p className="font-body text-xs text-frame-200/50">
                      @{person.username} · {person.followerCount} seguidor
                      {person.followerCount !== 1 ? "es" : ""}
                    </p>
                    {person.bio && (
                      <p className="mt-0.5 line-clamp-1 font-body text-xs text-frame-200/60">
                        {person.bio}
                      </p>
                    )}
                  </div>
                </Link>

                {isLoggedIn && currentUserId !== person.id && (
                  <FollowButton
                    targetUserId={person.id}
                    initiallyFollowing={person.isFollowing}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
