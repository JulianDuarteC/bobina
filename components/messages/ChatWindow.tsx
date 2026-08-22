"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { posterUrl } from "@/lib/tmdb";

type SharedMovie = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderUsername: string;
  sharedMovie?: SharedMovie | null;
};

type SearchResult = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
};

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUsername,
  otherDisplayName,
  canSend,
  initialMessages,
  initialNextCursor,
}: {
  conversationId: string;
  currentUserId: string;
  otherUsername: string;
  otherDisplayName: string | null;
  canSend: boolean;
  initialMessages: Message[];
  initialNextCursor: string | null;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [olderCursor, setOlderCursor] = useState(initialNextCursor);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [movieSearchOpen, setMovieSearchOpen] = useState(false);
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState<SearchResult[]>([]);
  const [searchingMovies, setSearchingMovies] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageIdsRef = useRef(new Set(initialMessages.map((m) => m.id)));
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastTypingSentRef = useRef(0);
  // Caché local de datos de película para tarjetas que llegan por
  // Realtime sin el join (ver comentario más abajo).
  const movieCacheRef = useRef<Map<number, SharedMovie>>(new Map());

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${conversationId}`, {
        config: { presence: { key: currentUserId } },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            content: string;
            created_at: string;
            sender_id: string;
            shared_tmdb_id: number | null;
          };

          if (messageIdsRef.current.has(row.id)) return; // eco de nuestro propio envío
          messageIdsRef.current.add(row.id);

          const sharedMovie = row.shared_tmdb_id
            ? movieCacheRef.current.get(row.shared_tmdb_id) ?? null
            : null;

          setMessages((prev) => [
            ...prev,
            {
              id: row.id,
              content: row.content,
              createdAt: row.created_at,
              senderId: row.sender_id,
              senderUsername: "",
              sharedMovie,
            },
          ]);

          // El evento de Postgres no trae el join con movies_cache — si
          // es una tarjeta compartida y no la teníamos en caché, la
          // completamos en segundo plano.
          if (row.shared_tmdb_id && !sharedMovie) {
            fetch(`/api/movies/${row.shared_tmdb_id}`)
              .then((r) => r.json())
              .then((data) => {
                const movie = {
                  tmdbId: data.tmdbId,
                  title: data.title,
                  posterPath: data.posterPath,
                };
                movieCacheRef.current.set(data.tmdbId, movie);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === row.id ? { ...m, sharedMovie: movie } : m
                  )
                );
              })
              .catch(() => {});
          }

          setOtherTyping(false);
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.userId === currentUserId) return;
        setOtherTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 2500);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const onlineKeys = Object.keys(state).filter((key) => key !== currentUserId);
        setOtherOnline(onlineKeys.length > 0);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ userId: currentUserId });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function loadOlder() {
    if (!olderCursor) return;
    setLoadingOlder(true);

    const res = await fetch(
      `/api/conversations/${conversationId}/messages?cursor=${encodeURIComponent(olderCursor)}`
    );
    const data = await res.json();

    data.messages.forEach((m: Message) => messageIdsRef.current.add(m.id));
    setMessages((prev) => [...data.messages, ...prev]);
    setOlderCursor(data.nextCursor);
    setLoadingOlder(false);
  }

  function handleTyping() {
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) return;
    lastTypingSentRef.current = now;

    const supabase = createClient();
    supabase.channel(`room:${conversationId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId },
    });
  }

  async function sendMessage(sharedTmdbId?: number) {
    const content = draft.trim();
    if (!content && !sharedTmdbId) return;

    setSending(true);
    setDraft("");

    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, sharedTmdbId }),
    });

    if (res.ok) {
      const message = await res.json();
      messageIdsRef.current.add(message.id);
      if (message.sharedMovie) {
        movieCacheRef.current.set(message.sharedMovie.tmdbId, message.sharedMovie);
      }
      setMessages((prev) => [...prev, message]);
    }

    setSending(false);
  }

  async function handleMovieSearch(value: string) {
    setMovieQuery(value);
    if (value.trim().length < 2) {
      setMovieResults([]);
      return;
    }
    setSearchingMovies(true);
    const res = await fetch(`/api/movies/search?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setMovieResults((data.results ?? []).slice(0, 6));
    setSearchingMovies(false);
  }

  async function shareMovie(movie: SearchResult) {
    movieCacheRef.current.set(movie.id, {
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
    });
    setMovieSearchOpen(false);
    setMovieQuery("");
    setMovieResults([]);
    await sendMessage(movie.id);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-reel-800 px-6 py-3">
        <Link
          href={`/${otherUsername}`}
          className="font-body text-sm font-semibold text-frame-50 hover:text-marquee-400"
        >
          {otherDisplayName || otherUsername}
        </Link>
        {otherOnline && (
          <span
            title="En línea"
            className="inline-block h-2 w-2 rounded-full bg-emerald_reel-500"
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {olderCursor && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={loadOlder}
              disabled={loadingOlder}
              className="font-body text-xs text-frame-200/50 hover:text-marquee-400"
            >
              {loadingOlder ? "Cargando..." : "Cargar mensajes anteriores"}
            </button>
          </div>
        )}

        <div className="space-y-2">
          {messages.map((m) => {
            const isMine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                {m.sharedMovie ? (
                  <Link
                    href={`/movies/${m.sharedMovie.tmdbId}`}
                    className={`flex max-w-[75%] items-center gap-2.5 rounded-md p-2 ${
                      isMine ? "bg-marquee-500/15" : "bg-reel-800"
                    }`}
                  >
                    {posterUrl(m.sharedMovie.posterPath, "w342") ? (
                      <Image
                        src={posterUrl(m.sharedMovie.posterPath, "w342")!}
                        alt=""
                        width={40}
                        height={56}
                        className="rounded-[3px] object-cover"
                      />
                    ) : (
                      <div className="h-14 w-10 shrink-0 rounded-[3px] bg-reel-700" />
                    )}
                    <span className="flex items-center gap-1.5 font-body text-sm text-frame-50">
                      <Clapperboard size={14} strokeWidth={2} /> {m.sharedMovie.title}
                    </span>
                  </Link>
                ) : (
                  <div
                    className={`max-w-[75%] rounded-md px-3.5 py-2 font-body text-sm ${
                      isMine
                        ? "bg-marquee-500 text-frame-50"
                        : "bg-reel-800 text-frame-100"
                    }`}
                  >
                    {m.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {otherTyping && (
          <p className="mt-2 font-body text-xs italic text-frame-200/50">
            Escribiendo...
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {canSend ? (
        <div className="relative border-t border-reel-800 px-6 py-4">
          {movieSearchOpen && (
            <div className="absolute bottom-full left-6 right-6 mb-2 rounded-sm border border-reel-700 bg-reel-900 shadow-xl">
              <input
                type="text"
                autoFocus
                value={movieQuery}
                onChange={(e) => handleMovieSearch(e.target.value)}
                placeholder="Busca una película para compartir..."
                className="field-input rounded-b-none"
              />
              <div className="max-h-56 overflow-y-auto">
                {searchingMovies && (
                  <p className="px-3 py-2 font-body text-xs text-frame-200/50">
                    Buscando...
                  </p>
                )}
                {movieResults.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => shareMovie(movie)}
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
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setMovieSearchOpen((v) => !v)}
              title="Compartir película"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-reel-700 text-frame-100 hover:border-marquee-500 hover:text-marquee-400"
            >
              <Clapperboard size={18} strokeWidth={2} />
            </button>
            <input
              type="text"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Escribe un mensaje..."
              className="field-input flex-1"
            />
            <button
              onClick={() => sendMessage()}
              disabled={sending || !draft.trim()}
              className="btn-primary"
            >
              Enviar
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-reel-800 px-6 py-4">
          <p className="font-body text-xs text-frame-200/40">
            No puedes responder hasta aceptar esta solicitud.
          </p>
        </div>
      )}
    </div>
  );
}
