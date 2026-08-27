"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Bell, Shield, Search } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { ThemeSwitcher } from "./ThemeSwitcher";

type Profile = {
  id: string;
  username: string;
  colorTheme: "BOBINA" | "NOIR" | "TECHNICOLOR" | "PINK" | "WHITE" | "MONO";
  siteRole: string;
};

export function MobileNav({
  profile,
  unreadCount,
  unreadMessagesCount,
}: {
  profile: Profile | null;
  unreadCount: number;
  unreadMessagesCount: number;
}) {
  const [open, setOpen] = useState(false);

  const linkClass =
    "flex items-center justify-between gap-2 rounded-sm px-3 py-3 font-body text-base text-frame-100 hover:bg-reel-800";

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex h-9 w-9 items-center justify-center text-frame-100"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-[57px] z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-[57px] z-50 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-reel-800 bg-reel-950 px-3 py-3 shadow-xl">
            <Link href="/explore" onClick={() => setOpen(false)} className={linkClass}>
              Explorar
            </Link>
            <Link href="/communities" onClick={() => setOpen(false)} className={linkClass}>
              Comunidades
            </Link>
            <Link href="/search" onClick={() => setOpen(false)} className={linkClass}>
              <span className="flex items-center gap-2">
                <Search size={16} strokeWidth={2} />
                Buscar
              </span>
            </Link>

            {profile ? (
              <>
                <Link href="/messages" onClick={() => setOpen(false)} className={linkClass}>
                  Mensajes
                  {unreadMessagesCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-marquee-500 px-1.5 font-body text-xs font-bold text-reel-950">
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </span>
                  )}
                </Link>
                <Link href="/notifications" onClick={() => setOpen(false)} className={linkClass}>
                  <span className="flex items-center gap-2">
                    <Bell size={16} strokeWidth={2} />
                    Notificaciones
                  </span>
                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-marquee-500 px-1.5 font-body text-xs font-bold text-reel-950">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href={`/${profile.username}`} onClick={() => setOpen(false)} className={linkClass}>
                  Mi perfil
                </Link>
                {(profile.siteRole === "MODERATOR" || profile.siteRole === "ADMIN") && (
                  <Link href="/admin/moderation" onClick={() => setOpen(false)} className={linkClass}>
                    <span className="flex items-center gap-2">
                      <Shield size={16} strokeWidth={2} />
                      Panel de moderación
                    </span>
                  </Link>
                )}

                <div className="mt-2 flex items-center justify-between border-t border-reel-800 px-3 pt-3">
                  <span className="font-body text-sm text-frame-200/60">Tema de color</span>
                  <ThemeSwitcher userId={profile.id} initialTheme={profile.colorTheme} />
                </div>
                <div className="px-3 pb-1 pt-2">
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className={linkClass}>
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary mt-2 block text-center"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
